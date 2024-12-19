'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import FinanzasMetricasService from '@/services/metricas/FinanzasMetricasService';
import { useMetricas } from '../hooks/useMetricas';
import ChartContainer from '../common/ChartContainer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const BalanceChart = ({ tiendaId }) => {
    const { data: balanceData, loading, error } = useMetricas(
        (tid) => FinanzasMetricasService.obtenerBalanceGeneral(tid),
        tiendaId
    );

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: {
                position: 'top',
                display: true,
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `$${value.toLocaleString()}`,
                    maxTicksLimit: 5
                }
            },
            x: {
                ticks: {
                    maxTicksLimit: 5
                }
            }
        }
    };

    if (loading) {
        return <ChartContainer title="Balance General">
            <div className="h-full flex items-center justify-center">
                <span className="text-gray-500">Cargando datos...</span>
            </div>
        </ChartContainer>;
    }

    if (!balanceData) {
        return <ChartContainer title="Balance General">
            <div className="h-full flex items-center justify-center">
                <span className="text-gray-500">No hay datos disponibles</span>
            </div>
        </ChartContainer>;
    }

    // Limitar la cantidad de datos a mostrar
    const datosLimitados = {
        labels: balanceData.margenes.slice(0, 5).map(m => m.nombre),
        datasets: [
            {
                label: 'Margen',
                data: balanceData.margenes.slice(0, 5).map(m => m.margenPromedio),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                fill: true,
            }
        ]
    };

    return (
        <ChartContainer 
            title="Balance General"
            stats={
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Margen: {balanceData.resumen.margenPromedioGeneral}%</div>
                    <div>ROI: {balanceData.resumen.roiMensual}%</div>
                </div>
            }
        >
            <div className="h-full w-full flex items-center justify-center">
                <Line options={options} data={datosLimitados} />
            </div>
        </ChartContainer>
    );
};

export default BalanceChart; 