'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

class FinanzasMetricasService {
    static async obtenerMargenesGanancia(tiendaId) {
        try {
            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const lotesRef = collection(db, 'tiendas', tiendaId, 'lotes');
            
            // Obtener pedidos y lotes
            const [pedidosSnapshot, lotesSnapshot] = await Promise.all([
                getDocs(pedidosRef),
                getDocs(lotesRef)
            ]);

            const pedidos = pedidosSnapshot.docs.map(doc => doc.data());
            const lotes = lotesSnapshot.docs.map(doc => doc.data());

            // Calcular márgenes por producto
            const margenes = new Map();

            pedidos.forEach(pedido => {
                pedido.productos.forEach(producto => {
                    // Buscar el lote correspondiente
                    const lote = lotes.find(l => l.nombreProducto === producto.nombre);
                    if (lote) {
                        const costoUnitario = parseFloat(lote.precioUnidad.replace(/[^\d.,]/g, ''));
                        const precioVenta = producto.precio;
                        const margen = ((precioVenta - costoUnitario) / precioVenta) * 100;

                        const datosProducto = margenes.get(producto.id) || {
                            id: producto.id,
                            nombre: producto.nombre,
                            ventasTotal: 0,
                            costoTotal: 0,
                            unidadesVendidas: 0
                        };

                        datosProducto.ventasTotal += precioVenta * producto.cantidad;
                        datosProducto.costoTotal += costoUnitario * producto.cantidad;
                        datosProducto.unidadesVendidas += producto.cantidad;
                        datosProducto.margenPromedio = ((datosProducto.ventasTotal - datosProducto.costoTotal) / datosProducto.ventasTotal) * 100;

                        margenes.set(producto.id, datosProducto);
                    }
                });
            });

            return {
                exito: true,
                datos: Array.from(margenes.values())
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al calcular márgenes de ganancia",
                error: error.message
            };
        }
    }

    static async obtenerROI(tiendaId, periodo = 'mes') {
        try {
            const fechaInicio = new Date();
            if (periodo === 'mes') {
                fechaInicio.setMonth(fechaInicio.getMonth() - 1);
            } else if (periodo === 'año') {
                fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
            }

            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const lotesRef = collection(db, 'tiendas', tiendaId, 'lotes');

            // Obtener pedidos del período
            const q = query(
                pedidosRef,
                where('fecha', '>=', fechaInicio.toISOString())
            );

            const [pedidosSnapshot, lotesSnapshot] = await Promise.all([
                getDocs(q),
                getDocs(lotesRef)
            ]);

            const pedidos = pedidosSnapshot.docs.map(doc => doc.data());
            const lotes = lotesSnapshot.docs.map(doc => doc.data());

            // Calcular inversión total (costo de productos)
            const inversionTotal = lotes.reduce((total, lote) => {
                const costoLote = parseFloat(lote.precioLote.replace(/[^\d.,]/g, ''));
                return total + costoLote;
            }, 0);

            // Calcular ingresos totales
            const ingresosTotales = pedidos.reduce((total, pedido) => {
                return total + pedido.total;
            }, 0);

            // Calcular ROI
            const gananciaNeta = ingresosTotales - inversionTotal;
            const roi = (gananciaNeta / inversionTotal) * 100;

            return {
                exito: true,
                datos: {
                    periodo,
                    inversionTotal,
                    ingresosTotales,
                    gananciaNeta,
                    roi,
                    fechaInicio: fechaInicio.toISOString(),
                    fechaFin: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al calcular ROI",
                error: error.message
            };
        }
    }

    static async obtenerBalanceGeneral(tiendaId) {
        try {
            const [margenes, roi] = await Promise.all([
                this.obtenerMargenesGanancia(tiendaId),
                this.obtenerROI(tiendaId, 'mes')
            ]);

            return {
                exito: true,
                datos: {
                    margenes: margenes.datos,
                    roi: roi.datos,
                    resumen: {
                        margenPromedioGeneral: margenes.datos.reduce((sum, p) => sum + p.margenPromedio, 0) / margenes.datos.length,
                        roiMensual: roi.datos.roi,
                        ingresosMensuales: roi.datos.ingresosTotales
                    }
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener balance general",
                error: error.message
            };
        }
    }
}

export default FinanzasMetricasService; 