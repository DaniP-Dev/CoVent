'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

class ClientesMetricasService {
    static async registrarCompra(tiendaId, correoCliente, datosCompra) {
        try {
            const metricasRef = collection(db, `tiendas/${tiendaId}/metricas/clientes/registros`);
            
            const nuevaMetrica = {
                compraId: datosCompra.compraId,
                correoCliente,
                total: datosCompra.total,
                fecha: datosCompra.fecha,
                cantidadProductos: datosCompra.productos.reduce((sum, p) => sum + p.cantidad, 0),
                productos: datosCompra.productos.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    cantidad: p.cantidad
                }))
            };

            await addDoc(metricasRef, nuevaMetrica);

            return {
                exito: true,
                mensaje: "Métricas de cliente registradas"
            };
        } catch (error) {
            console.error('Error al registrar métricas de cliente:', error);
            return {
                exito: false,
                mensaje: "Error al registrar métricas de cliente",
                error: error.message
            };
        }
    }

    static async obtenerHistorialCliente(tiendaId, correoCliente) {
        try {
            const metricasRef = collection(db, `tiendas/${tiendaId}/metricas/clientes/registros`);
            const q = query(metricasRef, where('correoCliente', '==', correoCliente));
            const snapshot = await getDocs(q);
            
            const historial = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                exito: true,
                datos: historial
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener historial del cliente",
                error: error.message
            };
        }
    }

    static async obtenerClientesTop(tiendaId, limite = 10) {
        try {
            const metricasRef = collection(db, `tiendas/${tiendaId}/metricas/clientes/registros`);
            const snapshot = await getDocs(metricasRef);
            
            // Agrupar por cliente
            const clientesMap = new Map();
            
            snapshot.docs.forEach(doc => {
                const metrica = doc.data();
                const cliente = clientesMap.get(metrica.correoCliente) || {
                    correo: metrica.correoCliente,
                    totalCompras: 0,
                    cantidadCompras: 0,
                    ultimaCompra: null
                };

                cliente.totalCompras += metrica.total;
                cliente.cantidadCompras += 1;
                
                if (!cliente.ultimaCompra || metrica.fecha > cliente.ultimaCompra) {
                    cliente.ultimaCompra = metrica.fecha;
                }

                clientesMap.set(metrica.correoCliente, cliente);
            });

            // Convertir a array y ordenar
            const clientesTop = Array.from(clientesMap.values())
                .sort((a, b) => b.totalCompras - a.totalCompras)
                .slice(0, limite);

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