'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

class RendimientoMetricasService {
    static async actualizarKPIs(tiendaId, datosKPI) {
        try {
            const metricasRef = collection(db, `tiendas/${tiendaId}/metricas/rendimiento/registros`);
            
            const nuevaMetrica = {
                compraId: datosKPI.compraId,
                ventaNueva: datosKPI.ventaNueva,
                productosVendidos: datosKPI.productosVendidos,
                fecha: datosKPI.fecha,
                hora: new Date(datosKPI.fecha).getHours(),
                dia: new Date(datosKPI.fecha).getDay(),
                mes: new Date(datosKPI.fecha).getMonth() + 1,
                año: new Date(datosKPI.fecha).getFullYear()
            };

            await addDoc(metricasRef, nuevaMetrica);

            return {
                exito: true,
                mensaje: "KPIs actualizados"
            };
        } catch (error) {
            console.error('Error al actualizar KPIs:', error);
            return {
                exito: false,
                mensaje: "Error al actualizar KPIs",
                error: error.message
            };
        }
    }

    static async obtenerKPIs(tiendaId, periodo = 30) {
        try {
            const metricasRef = collection(db, `tiendas/${tiendaId}/metricas/rendimiento/registros`);
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() - periodo);

            const q = query(
                metricasRef,
                where('fecha', '>=', fechaInicio.toISOString())
            );

            const snapshot = await getDocs(q);
            const metricas = snapshot.docs.map(doc => doc.data());

            // Calcular KPIs
            const kpis = {
                ventasTotal: metricas.reduce((sum, m) => sum + m.ventaNueva, 0),
                productosVendidos: metricas.reduce((sum, m) => sum + m.productosVendidos, 0),
                promedioVentaDiaria: metricas.length > 0 ? 
                    metricas.reduce((sum, m) => sum + m.ventaNueva, 0) / periodo : 0,
                diasConVentas: new Set(metricas.map(m => m.fecha.split('T')[0])).size,
                ventasPorHora: new Array(24).fill(0)
            };

            // Calcular ventas por hora
            metricas.forEach(m => {
                kpis.ventasPorHora[m.hora] += m.ventaNueva;
            });

            return {
                exito: true,
                datos: kpis
            };
        } catch (error) {
            console.error('Error al obtener KPIs:', error);
            return {
                exito: false,
                mensaje: "Error al obtener KPIs",
                error: error.message
            };
        }
    }
}

export default RendimientoMetricasService; 