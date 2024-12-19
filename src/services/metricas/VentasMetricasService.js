'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, doc, getDoc, query, where, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';

class VentasMetricasService {
    static async obtenerVentasDiarias(tiendaId, fecha) {
        try {
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
            const ventas = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                exito: true,
                datos: {
                    ventas,
                    total: ventas.reduce((sum, venta) => sum + venta.total, 0),
                    cantidad: ventas.length,
                    promedioVenta: ventas.length > 0 ? ventas.reduce((sum, venta) => sum + venta.total, 0) / ventas.length : 0
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener ventas diarias",
                error: error.message
            };
        }
    }

    static async obtenerVentasMensuales(tiendaId, mes, año) {
        try {
            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const fechaInicio = new Date(año, mes - 1, 1);
            const fechaFin = new Date(año, mes, 0, 23, 59, 59, 999);

            const q = query(
                pedidosRef,
                where('fecha', '>=', fechaInicio.toISOString()),
                where('fecha', '<=', fechaFin.toISOString())
            );

            const snapshot = await getDocs(q);
            const ventas = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Agrupar ventas por día
            const ventasPorDia = ventas.reduce((acc, venta) => {
                const fecha = new Date(venta.fecha).getDate();
                acc[fecha] = acc[fecha] || { total: 0, cantidad: 0 };
                acc[fecha].total += venta.total;
                acc[fecha].cantidad += 1;
                return acc;
            }, {});

            return {
                exito: true,
                datos: {
                    ventasDiarias: ventasPorDia,
                    totalMes: ventas.reduce((sum, venta) => sum + venta.total, 0),
                    cantidadVentas: ventas.length,
                    promedioVentaDiaria: ventas.length > 0 ? ventas.reduce((sum, venta) => sum + venta.total, 0) / Object.keys(ventasPorDia).length : 0
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener ventas mensuales",
                error: error.message
            };
        }
    }

    static async obtenerProductosMasVendidos(tiendaId, limite = 5) {
        try {
            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const snapshot = await getDocs(pedidosRef);
            
            // Mapa para contar ventas por producto
            const productosVendidos = new Map();
            
            snapshot.docs.forEach(doc => {
                const pedido = doc.data();
                pedido.productos.forEach(producto => {
                    const actual = productosVendidos.get(producto.id) || {
                        id: producto.id,
                        nombre: producto.nombre,
                        cantidadTotal: 0,
                        ventasTotal: 0,
                        ultimaVenta: pedido.fecha
                    };
                    actual.cantidadTotal += producto.cantidad;
                    actual.ventasTotal += producto.precio * producto.cantidad;
                    if (pedido.fecha > actual.ultimaVenta) {
                        actual.ultimaVenta = pedido.fecha;
                    }
                    productosVendidos.set(producto.id, actual);
                });
            });

            // Convertir a array y ordenar
            const ranking = Array.from(productosVendidos.values())
                .sort((a, b) => b.ventasTotal - a.ventasTotal)
                .slice(0, limite);

            return {
                exito: true,
                datos: ranking
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener productos más vendidos",
                error: error.message
            };
        }
    }

    static async obtenerHorariosVenta(tiendaId) {
        try {
            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const snapshot = await getDocs(pedidosRef);
            
            // Agrupar ventas por hora
            const ventasPorHora = new Array(24).fill(0).map(() => ({
                cantidad: 0,
                total: 0
            }));

            snapshot.docs.forEach(doc => {
                const pedido = doc.data();
                const hora = new Date(pedido.fecha).getHours();
                ventasPorHora[hora].cantidad += 1;
                ventasPorHora[hora].total += pedido.total;
            });

            // Encontrar horas pico
            const horasPico = ventasPorHora
                .map((datos, hora) => ({ hora, ...datos }))
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 3);

            return {
                exito: true,
                datos: {
                    ventasPorHora,
                    horasPico,
                    resumen: {
                        horasMasVentas: horasPico.map(h => h.hora),
                        promedioVentasPorHora: snapshot.docs.length / 24
                    }
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener horarios de venta",
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
                // Agregar más métricas específicas
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
}

export default VentasMetricasService; 