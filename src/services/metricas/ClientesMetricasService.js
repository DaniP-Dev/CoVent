'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

class ClientesMetricasService {
    static async obtenerHistorialCliente(tiendaId, clienteEmail) {
        try {
            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const q = query(
                pedidosRef,
                where('cliente.correo', '==', clienteEmail),
                orderBy('fecha', 'desc')
            );

            const snapshot = await getDocs(q);
            const historial = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calcular estadísticas del historial
            const estadisticas = historial.reduce((stats, pedido) => {
                stats.totalGastado += pedido.total;
                stats.totalProductos += pedido.cantidadProductos;
                stats.categorias = new Set([...stats.categorias, ...pedido.productos.map(p => p.categoria)]);
                return stats;
            }, { totalGastado: 0, totalProductos: 0, categorias: new Set() });

            return {
                exito: true,
                datos: {
                    pedidos: historial,
                    estadisticas: {
                        ...estadisticas,
                        categorias: Array.from(estadisticas.categorias),
                        cantidadPedidos: historial.length,
                        ticketPromedio: historial.length > 0 ? estadisticas.totalGastado / historial.length : 0
                    }
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener historial del cliente",
                error: error.message
            };
        }
    }

    static async obtenerFrecuenciaCompra(tiendaId, clienteEmail) {
        try {
            const historial = await this.obtenerHistorialCliente(tiendaId, clienteEmail);
            if (!historial.exito) throw new Error(historial.mensaje);

            const pedidos = historial.datos.pedidos;
            if (pedidos.length < 2) {
                return {
                    exito: true,
                    datos: {
                        frecuenciaDias: 0,
                        cantidadCompras: pedidos.length,
                        ultimaCompra: pedidos[0]?.fecha || null
                    }
                };
            }

            // Calcular días entre compras
            const fechasOrdenadas = pedidos
                .map(p => new Date(p.fecha))
                .sort((a, b) => b - a);

            let diasEntreCompras = [];
            for (let i = 1; i < fechasOrdenadas.length; i++) {
                const diferencia = fechasOrdenadas[i - 1] - fechasOrdenadas[i];
                diasEntreCompras.push(diferencia / (1000 * 60 * 60 * 24)); // Convertir a días
            }

            const frecuenciaPromedio = diasEntreCompras.reduce((a, b) => a + b, 0) / diasEntreCompras.length;

            return {
                exito: true,
                datos: {
                    frecuenciaDias: Math.round(frecuenciaPromedio),
                    cantidadCompras: pedidos.length,
                    ultimaCompra: fechasOrdenadas[0].toISOString(),
                    diasEntreCompras: diasEntreCompras
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al calcular frecuencia de compra",
                error: error.message
            };
        }
    }

    static async obtenerValorCliente(tiendaId, clienteEmail) {
        try {
            const [historial, frecuencia] = await Promise.all([
                this.obtenerHistorialCliente(tiendaId, clienteEmail),
                this.obtenerFrecuenciaCompra(tiendaId, clienteEmail)
            ]);

            if (!historial.exito || !frecuencia.exito) {
                throw new Error("Error al obtener datos del cliente");
            }

            const stats = historial.datos.estadisticas;
            const ultimaCompra = new Date(frecuencia.datos.ultimaCompra || new Date());
            const diasDesdeUltimaCompra = Math.floor((new Date() - ultimaCompra) / (1000 * 60 * 60 * 24));

            // Calcular valor del cliente
            const valorCliente = {
                totalGastado: stats.totalGastado,
                ticketPromedio: stats.ticketPromedio,
                frecuenciaCompra: frecuencia.datos.frecuenciaDias,
                categoriasFavoritas: stats.categorias,
                estado: diasDesdeUltimaCompra > frecuencia.datos.frecuenciaDias * 2 ? 'inactivo' : 'activo',
                probabilidadRecompra: Math.max(0, 100 - (diasDesdeUltimaCompra / frecuencia.datos.frecuenciaDias * 100))
            };

            return {
                exito: true,
                datos: valorCliente
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al calcular valor del cliente",
                error: error.message
            };
        }
    }

    static async obtenerClientesTop(tiendaId, limite = 10) {
        try {
            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const snapshot = await getDocs(pedidosRef);

            // Agrupar pedidos por cliente
            const clientesMap = new Map();

            snapshot.docs.forEach(doc => {
                const pedido = doc.data();
                const clienteEmail = pedido.cliente.correo;
                
                const clienteData = clientesMap.get(clienteEmail) || {
                    email: clienteEmail,
                    totalGastado: 0,
                    cantidadPedidos: 0,
                    ultimaCompra: null
                };

                clienteData.totalGastado += pedido.total;
                clienteData.cantidadPedidos += 1;
                
                const fechaPedido = new Date(pedido.fecha);
                if (!clienteData.ultimaCompra || fechaPedido > new Date(clienteData.ultimaCompra)) {
                    clienteData.ultimaCompra = pedido.fecha;
                }

                clientesMap.set(clienteEmail, clienteData);
            });

            // Convertir a array y ordenar por total gastado
            const clientesTop = Array.from(clientesMap.values())
                .sort((a, b) => b.totalGastado - a.totalGastado)
                .slice(0, limite)
                .map(cliente => ({
                    ...cliente,
                    ticketPromedio: cliente.totalGastado / cliente.cantidadPedidos
                }));

            return {
                exito: true,
                datos: clientesTop
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener clientes top",
                error: error.message
            };
        }
    }
}

export default ClientesMetricasService; 