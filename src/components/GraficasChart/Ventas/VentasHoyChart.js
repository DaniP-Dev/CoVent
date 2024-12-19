'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import VentasMetricasService from '@/services/metricas/VentasMetricasService';
import { useMetricas } from '../hooks/useMetricas';
import ChartContainer from '../common/ChartContainer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const VentasHoyChart = ({ tiendaId }) => {
    const { data: ventasData, loading, error } = useMetricas(
        (tid) => VentasMetricasService.obtenerVentasDiarias(tid, new Date()),
        tiendaId
    );

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Ventas de Hoy'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `$${value.toLocaleString()}`
                }
            }
        }
    };

    if (loading) {
        return <ChartContainer title="Ventas de Hoy">
            <div className="h-full flex items-center justify-center">
                <span className="text-gray-500">Cargando datos...</span>
            </div>
        </ChartContainer>;
    }

    if (!ventasData) {
        return <ChartContainer title="Ventas de Hoy">
            <div className="h-full flex items-center justify-center">
                <span className="text-gray-500">No hay datos disponibles</span>
            </div>
        </ChartContainer>;
    }

    const data = {
        labels: ventasData.ventas.map(v => {
            const hora = new Date(v.fecha).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
            });
            return hora;
        }),
        datasets: [
            {
                label: 'Ventas',
                data: ventasData.ventas.map(v => v.total),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    return (
        <ChartContainer 
            title="Ventas de Hoy"
            stats={
                <div className="grid grid-cols-2 gap-2">
                    <div>Total: ${ventasData.total.toLocaleString()}</div>
                    <div>Promedio: ${ventasData.promedioVenta.toLocaleString()}</div>
                </div>
            }
        >
            <Line options={options} data={data} />
        </ChartContainer>
    );
};

export default VentasHoyChart; 