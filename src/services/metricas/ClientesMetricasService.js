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

    static async obtenerClientesTop(tiendaId, limite = 5) {
        try {
            if (!tiendaId) {
                throw new Error('tiendaId es requerido');
            }

            // Datos de prueba estáticos para evitar regeneración constante
            const clientesPrueba = [
                {
                    correo: 'cliente1@ejemplo.com',
                    totalCompras: 1000000,
                    cantidadCompras: 10,
                    ultimaCompra: new Date().toISOString()
                },
                {
                    correo: 'cliente2@ejemplo.com',
                    totalCompras: 850000,
                    cantidadCompras: 8,
                    ultimaCompra: new Date().toISOString()
                },
                {
                    correo: 'cliente3@ejemplo.com',
                    totalCompras: 700000,
                    cantidadCompras: 6,
                    ultimaCompra: new Date().toISOString()
                },
                {
                    correo: 'cliente4@ejemplo.com',
                    totalCompras: 550000,
                    cantidadCompras: 4,
                    ultimaCompra: new Date().toISOString()
                },
                {
                    correo: 'cliente5@ejemplo.com',
                    totalCompras: 400000,
                    cantidadCompras: 2,
                    ultimaCompra: new Date().toISOString()
                }
            ];

            return {
                exito: true,
                datos: clientesPrueba
            };
        } catch (error) {
            console.error('Error in obtenerClientesTop:', error);
            return {
                exito: false,
                mensaje: "Error al obtener clientes top",
                error: error.message
            };
        }
    }
}

export default ClientesMetricasService; 