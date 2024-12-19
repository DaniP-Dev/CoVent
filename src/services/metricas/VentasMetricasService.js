'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, doc, getDoc, query, where, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';

class VentasMetricasService {
    static async obtenerVentasDiarias(tiendaId, fecha) {
        try {
            if (!tiendaId) {
                throw new Error('tiendaId es requerido');
            }

            console.log('Fetching ventas for:', tiendaId);

            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const fechaInicio = new Date(fecha);
            fechaInicio.setHours(0, 0, 0, 0);
            const fechaFin = new Date(fecha);
            fechaFin.setHours(23, 59, 59, 999);

            const q = query(
                pedidosRef,
                where('fecha', '>=', fechaInicio.toISOString()),
                where('fecha', '<=', fechaFin.toISOString())
            );

            const snapshot = await getDocs(q);
            console.log('Snapshot received:', snapshot.size);

            // Datos de prueba consistentes
            const datosPrueba = {
                ventas: Array.from({ length: 24 }, (_, i) => ({
                    id: `prueba-${i}`,
                    fecha: new Date(fechaInicio.getTime() + i * 3600000).toISOString(),
                    total: 100000 + (Math.sin(i / 3) * 50000),
                })),
                total: 2500000,
                cantidad: 24,
                promedioVenta: 104166
            };

            return {
                exito: true,
                datos: datosPrueba
            };
        } catch (error) {
            console.error('Error in obtenerVentasDiarias:', error);
            return {
                exito: false,
                mensaje: "Error al obtener ventas diarias",
                error: error.message
            };
        }
    }

    static async registrarVenta(tiendaId, datosVenta) {
        try {
            const metricasRef = collection(db, `tiendas/${tiendaId}/metricas/ventas/registros`);
            
            const nuevaMetrica = {
                compraId: datosVenta.compraId,
                productos: datosVenta.productos.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    cantidad: p.cantidad,
                    precio: p.precio,
                    subtotal: p.precio * p.cantidad
                })),
                total: datosVenta.total,
                fecha: datosVenta.fecha,
                cliente: datosVenta.cliente,
                medioPago: datosVenta.medioPago,
                cantidadProductos: datosVenta.productos.reduce((sum, p) => sum + p.cantidad, 0),
                hora: new Date(datosVenta.fecha).getHours(),
                dia: new Date(datosVenta.fecha).getDay(),
                mes: new Date(datosVenta.fecha).getMonth() + 1,
                año: new Date(datosVenta.fecha).getFullYear()
            };

            await addDoc(metricasRef, nuevaMetrica);

            return {
                exito: true,
                mensaje: "Métricas de venta registradas"
            };
        } catch (error) {
            console.error('Error al registrar métricas de venta:', error);
            return {
                exito: false,
                mensaje: "Error al registrar métricas de venta",
                error: error.message
            };
        }
    }

    static async obtenerProductosMasVendidos(tiendaId, limite = 5) {
        try {
            if (!tiendaId) {
                throw new Error('tiendaId es requerido');
            }

            console.log('Fetching productos más vendidos for:', tiendaId);

            // Datos de prueba estáticos
            const productosPrueba = [
                {
                    id: 'prod1',
                    nombre: 'Producto 1',
                    cantidadVendida: 150,
                    totalVentas: 1500000,
                    porcentaje: 30
                },
                {
                    id: 'prod2',
                    nombre: 'Producto 2',
                    cantidadVendida: 120,
                    totalVentas: 1200000,
                    porcentaje: 25
                },
                {
                    id: 'prod3',
                    nombre: 'Producto 3',
                    cantidadVendida: 100,
                    totalVentas: 1000000,
                    porcentaje: 20
                },
                {
                    id: 'prod4',
                    nombre: 'Producto 4',
                    cantidadVendida: 80,
                    totalVentas: 800000,
                    porcentaje: 15
                },
                {
                    id: 'prod5',
                    nombre: 'Producto 5',
                    cantidadVendida: 50,
                    totalVentas: 500000,
                    porcentaje: 10
                }
            ];

            return {
                exito: true,
                datos: productosPrueba.slice(0, limite)
            };
        } catch (error) {
            console.error('Error in obtenerProductosMasVendidos:', error);
            return {
                exito: false,
                mensaje: "Error al obtener productos más vendidos",
                error: error.message
            };
        }
    }
}

export default VentasMetricasService; 