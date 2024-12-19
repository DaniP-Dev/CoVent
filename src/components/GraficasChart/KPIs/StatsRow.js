'use client';
import React, { useEffect, useState } from 'react';
import VentasMetricasService from '@/services/metricas/VentasMetricasService';
import FinanzasMetricasService from '@/services/metricas/FinanzasMetricasService';
import RendimientoMetricasService from '@/services/metricas/RendimientoMetricasService';

const StatCard = ({ title, value, icon, trend }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className={`text-2xl ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {icon}
            </div>
        </div>
        {trend && (
            <div className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
        )}
    </div>
);

const StatsRow = ({ tiendaId }) => {
    const [stats, setStats] = useState({
        ventasHoy: 0,
        promedioVenta: 0,
        margenPromedio: 0,
        roiDiario: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarEstadisticas = async () => {
            try {
                const [ventasHoy, finanzas, rendimiento] = await Promise.all([
                    VentasMetricasService.obtenerVentasDiarias(tiendaId, new Date()),
                    FinanzasMetricasService.obtenerBalanceGeneral(tiendaId),
                    RendimientoMetricasService.obtenerKPIs(tiendaId)
                ]);

                if (ventasHoy.exito && finanzas.exito && rendimiento.exito) {
                    setStats({
                        ventasHoy: ventasHoy.datos.total,
                        promedioVenta: ventasHoy.datos.promedioVenta,
                        margenPromedio: finanzas.datos.resumen.margenPromedioGeneral,
                        roiDiario: rendimiento.datos.ventasTotal
                    });
                }
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarEstadisticas();
        const intervalo = setInterval(cargarEstadisticas, 5 * 60 * 1000);
        
        return () => clearInterval(intervalo);
    }, [tiendaId]);

    if (loading) {
        return (
            <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 h-24 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 gap-4">
            <StatCard
                title="Ventas Hoy"
                value={`$${stats.ventasHoy.toLocaleString()}`}
                icon="💰"
                trend={10}
            />
            <StatCard
                title="Promedio Venta"
                value={`$${stats.promedioVenta.toLocaleString()}`}
                icon="📊"
                trend={5}
            />
            <StatCard
                title="Margen Promedio"
                value={`${stats.margenPromedio.toFixed(1)}%`}
                icon="📈"
                trend={2}
            />
            <StatCard
                title="ROI Diario"
                value={`$${stats.roiDiario.toLocaleString()}`}
                icon="💎"
                trend={8}
            />
        </div>
    );
};

export default StatsRow; 