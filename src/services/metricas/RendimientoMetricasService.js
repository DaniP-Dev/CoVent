'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

class RendimientoMetricasService {
    static async obtenerTasaConversion(tiendaId, periodo = 30) {
        try {
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() - periodo);

            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const q = query(
                pedidosRef,
                where('fecha', '>=', fechaInicio.toISOString()),
                orderBy('fecha', 'desc')
            );

            const snapshot = await getDocs(q);
            const pedidos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calcular métricas de conversión
            const pedidosCompletados = pedidos.filter(p => p.estado === 'entregado').length;
            const pedidosCancelados = pedidos.filter(p => p.estado === 'cancelado').length;
            const totalPedidos = pedidos.length;

            return {
                exito: true,
                datos: {
                    periodo: `${periodo} días`,
                    tasaConversion: (pedidosCompletados / totalPedidos) * 100,
                    tasaAbandono: (pedidosCancelados / totalPedidos) * 100,
                    pedidosCompletados,
                    pedidosCancelados,
                    totalPedidos
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al calcular tasa de conversión",
                error: error.message
            };
        }
    }

    static async obtenerEficienciaOperativa(tiendaId) {
        try {
            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const snapshot = await getDocs(pedidosRef);
            const pedidos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calcular tiempos de proceso
            const tiemposProceso = pedidos.map(pedido => {
                const fechaPedido = new Date(pedido.fecha);
                const fechaEntrega = pedido.fechaEntrega ? new Date(pedido.fechaEntrega) : null;
                return fechaEntrega ? (fechaEntrega - fechaPedido) / (1000 * 60) : null; // Tiempo en minutos
            }).filter(tiempo => tiempo !== null);

            const tiempoPromedioEntrega = tiemposProceso.length > 0 
                ? tiemposProceso.reduce((a, b) => a + b, 0) / tiemposProceso.length 
                : 0;

            return {
                exito: true,
                datos: {
                    tiempoPromedioEntrega,
                    pedidosProcesados: pedidos.length,
                    eficienciaTiempo: {
                        rapidos: tiemposProceso.filter(t => t < tiempoPromedioEntrega).length,
                        lentos: tiemposProceso.filter(t => t > tiempoPromedioEntrega).length
                    }
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al calcular eficiencia operativa",
                error: error.message
            };
        }
    }

    static async obtenerKPIs(tiendaId) {
        try {
            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const productosRef = collection(db, 'tiendas', tiendaId, 'productos');

            const [pedidosSnapshot, productosSnapshot] = await Promise.all([
                getDocs(pedidosRef),
                getDocs(productosRef)
            ]);

            const pedidos = pedidosSnapshot.docs.map(doc => doc.data());
            const productos = productosSnapshot.docs.map(doc => doc.data());

            // Calcular KPIs generales
            const ventasTotal = pedidos.reduce((sum, p) => sum + p.total, 0);
            const productosTotal = productos.length;
            const stockTotal = productos.reduce((sum, p) => sum + (p.details?.stock || 0), 0);
            const pedidosTotal = pedidos.length;

            // Calcular KPIs específicos
            const kpis = {
                ventas: {
                    total: ventasTotal,
                    promedioPorPedido: pedidosTotal > 0 ? ventasTotal / pedidosTotal : 0
                },
                productos: {
                    total: productosTotal,
                    stockPromedio: productosTotal > 0 ? stockTotal / productosTotal : 0,
                    stockBajo: productos.filter(p => (p.details?.stock || 0) < 5).length
                },
                pedidos: {
                    total: pedidosTotal,
                    completados: pedidos.filter(p => p.estado === 'entregado').length,
                    pendientes: pedidos.filter(p => p.estado === 'pendiente').length
                }
            };

            return {
                exito: true,
                datos: kpis
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener KPIs",
                error: error.message
            };
        }
    }

    static async obtenerRendimientoGeneral(tiendaId) {
        try {
            const [tasaConversion, eficiencia, kpis] = await Promise.all([
                this.obtenerTasaConversion(tiendaId),
                this.obtenerEficienciaOperativa(tiendaId),
                this.obtenerKPIs(tiendaId)
            ]);

            if (!tasaConversion.exito || !eficiencia.exito || !kpis.exito) {
                throw new Error("Error al obtener métricas de rendimiento");
            }

            return {
                exito: true,
                datos: {
                    tasaConversion: tasaConversion.datos,
                    eficiencia: eficiencia.datos,
                    kpis: kpis.datos
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener rendimiento general",
                error: error.message
            };
        }
    }
}

export default RendimientoMetricasService; 