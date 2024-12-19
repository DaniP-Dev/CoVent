'use client';
import { db } from '@/config/firebase/firebaseConfig';
import VentasMetricasService from './VentasMetricasService';
import InventarioMetricasService from './InventarioMetricasService';
import ClientesMetricasService from './ClientesMetricasService';
import RendimientoMetricasService from './RendimientoMetricasService';
import FinanzasMetricasService from './FinanzasMetricasService';

class DashboardMetricasService {
    static async obtenerResumenGeneral(tiendaId) {
        try {
            // Obtener todas las métricas en paralelo
            const [
                ventasDiarias,
                ventasMensuales,
                productosMasVendidos,
                horariosVenta,
                rendimientoGeneral,
                clientesTop,
                finanzas
            ] = await Promise.all([
                VentasMetricasService.obtenerVentasDiarias(tiendaId, new Date()),
                VentasMetricasService.obtenerVentasMensuales(tiendaId, new Date().getMonth() + 1, new Date().getFullYear()),
                VentasMetricasService.obtenerProductosMasVendidos(tiendaId, 5),
                VentasMetricasService.obtenerHorariosVenta(tiendaId),
                RendimientoMetricasService.obtenerRendimientoGeneral(tiendaId),
                ClientesMetricasService.obtenerClientesTop(tiendaId, 5),
                FinanzasMetricasService.obtenerBalanceGeneral(tiendaId)
            ]);

            return {
                exito: true,
                datos: {
                    ventas: {
                        hoy: ventasDiarias.datos,
                        mes: ventasMensuales.datos,
                        productosMasVendidos: productosMasVendidos.datos,
                        horariosVenta: horariosVenta.datos
                    },
                    rendimiento: rendimientoGeneral.datos,
                    clientes: {
                        top: clientesTop.datos
                    },
                    finanzas: finanzas.datos,
                    ultimaActualizacion: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener resumen general",
                error: error.message
            };
        }
    }

    static async obtenerMetricasPersonalizadas(tiendaId, metricas = []) {
        try {
            const metricasDisponibles = {
                ventasDiarias: () => VentasMetricasService.obtenerVentasDiarias(tiendaId, new Date()),
                ventasMensuales: () => VentasMetricasService.obtenerVentasMensuales(tiendaId, new Date().getMonth() + 1, new Date().getFullYear()),
                productosMasVendidos: () => VentasMetricasService.obtenerProductosMasVendidos(tiendaId),
                horariosVenta: () => VentasMetricasService.obtenerHorariosVenta(tiendaId),
                rendimiento: () => RendimientoMetricasService.obtenerRendimientoGeneral(tiendaId),
                clientesTop: () => ClientesMetricasService.obtenerClientesTop(tiendaId),
                finanzas: () => FinanzasMetricasService.obtenerBalanceGeneral(tiendaId)
            };

            const metricasSeleccionadas = metricas.filter(m => metricasDisponibles[m]);
            const resultados = await Promise.all(
                metricasSeleccionadas.map(m => metricasDisponibles[m]())
            );

            const datos = metricasSeleccionadas.reduce((acc, metrica, index) => {
                acc[metrica] = resultados[index].datos;
                return acc;
            }, {});

            return {
                exito: true,
                datos: {
                    ...datos,
                    ultimaActualizacion: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener métricas personalizadas",
                error: error.message
            };
        }
    }

    static async generarReporteExportable(tiendaId, tipo = 'completo', formato = 'json') {
        try {
            let datos;
            const fecha = new Date();

            switch (tipo) {
                case 'ventas':
                    const [ventasDiarias, ventasMensuales] = await Promise.all([
                        VentasMetricasService.obtenerVentasDiarias(tiendaId, fecha),
                        VentasMetricasService.obtenerVentasMensuales(tiendaId, fecha.getMonth() + 1, fecha.getFullYear())
                    ]);
                    datos = {
                        ventas: {
                            diarias: ventasDiarias.datos,
                            mensuales: ventasMensuales.datos
                        }
                    };
                    break;

                case 'rendimiento':
                    const rendimiento = await RendimientoMetricasService.obtenerRendimientoGeneral(tiendaId);
                    datos = rendimiento.datos;
                    break;

                case 'clientes':
                    const clientes = await ClientesMetricasService.obtenerClientesTop(tiendaId, 20);
                    datos = {
                        clientesTop: clientes.datos
                    };
                    break;

                case 'finanzas':
                    const finanzas = await FinanzasMetricasService.obtenerBalanceGeneral(tiendaId);
                    datos = finanzas.datos;
                    break;

                case 'completo':
                default:
                    const resumenGeneral = await this.obtenerResumenGeneral(tiendaId);
                    datos = resumenGeneral.datos;
                    break;
            }

            // Formatear datos según el formato solicitado
            let datosFormateados;
            switch (formato) {
                case 'csv':
                    datosFormateados = this.convertirACSV(datos);
                    break;
                case 'pdf':
                    datosFormateados = await this.generarPDF(datos);
                    break;
                case 'json':
                default:
                    datosFormateados = JSON.stringify(datos, null, 2);
                    break;
            }

            return {
                exito: true,
                datos: {
                    tipo,
                    formato,
                    fechaGeneracion: new Date().toISOString(),
                    contenido: datosFormateados
                }
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al generar reporte",
                error: error.message
            };
        }
    }

    static async obtenerMetricasEnTiempoReal(tiendaId, callback) {
        try {
            // Implementar lógica de suscripción a cambios en tiempo real
            const unsubscribe = db.collection('tiendas').doc(tiendaId)
                .onSnapshot(async (doc) => {
                    if (doc.exists) {
                        const resumen = await this.obtenerResumenGeneral(tiendaId);
                        callback(resumen.datos);
                    }
                });

            return unsubscribe;
        } catch (error) {
            console.error("Error en métricas en tiempo real:", error);
            return () => {};
        }
    }

    // Métodos auxiliares para formateo de datos
    static convertirACSV(datos) {
        // Implementar conversión a CSV
        return 'Implementación pendiente';
    }

    static async generarPDF(datos) {
        // Implementar generación de PDF
        return 'Implementación pendiente';
    }
}

export default DashboardMetricasService; 