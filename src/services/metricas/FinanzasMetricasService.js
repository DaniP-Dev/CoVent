'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

class FinanzasMetricasService {
    static async obtenerBalanceGeneral(tiendaId) {
        try {
            if (!tiendaId) {
                throw new Error('tiendaId es requerido');
            }

            // Datos de prueba estáticos
            const datosPrueba = {
                margenes: [
                    {
                        nombre: 'Producto 1',
                        margenPromedio: 35,
                        ventasTotal: 1000000,
                        costoTotal: 650000,
                        unidadesVendidas: 100
                    },
                    {
                        nombre: 'Producto 2',
                        margenPromedio: 33,
                        ventasTotal: 900000,
                        costoTotal: 585000,
                        unidadesVendidas: 90
                    },
                    {
                        nombre: 'Producto 3',
                        margenPromedio: 31,
                        ventasTotal: 800000,
                        costoTotal: 520000,
                        unidadesVendidas: 80
                    },
                    {
                        nombre: 'Producto 4',
                        margenPromedio: 29,
                        ventasTotal: 700000,
                        costoTotal: 455000,
                        unidadesVendidas: 70
                    },
                    {
                        nombre: 'Producto 5',
                        margenPromedio: 27,
                        ventasTotal: 600000,
                        costoTotal: 390000,
                        unidadesVendidas: 60
                    }
                ],
                roi: {
                    periodo: 'mes',
                    inversionTotal: 5000000,
                    ingresosTotales: 8000000,
                    gananciaNeta: 3000000,
                    roi: 60
                },
                resumen: {
                    margenPromedioGeneral: 35,
                    roiMensual: 60,
                    ingresosMensuales: 8000000
                }
            };

            return {
                exito: true,
                datos: datosPrueba
            };
        } catch (error) {
            console.error('Error in obtenerBalanceGeneral:', error);
            return {
                exito: false,
                mensaje: "Error al obtener balance general",
                error: error.message
            };
        }
    }
}

export default FinanzasMetricasService; 