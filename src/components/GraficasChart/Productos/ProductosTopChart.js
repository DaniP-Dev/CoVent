'use client';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import VentasMetricasService from '@/services/metricas/VentasMetricasService';
import { useMetricas } from '../hooks/useMetricas';
import ChartContainer from '../common/ChartContainer';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductosTopChart = ({ tiendaId }) => {
    const { data: productosData, loading, error } = useMetricas(
        (tid) => VentasMetricasService.obtenerProductosMasVendidos(tid, 5),
        tiendaId
    );

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `$${value.toLocaleString()}`,
                    maxTicksLimit: 5
                }
            }
        }
    };

    if (loading) {
        return <ChartContainer title="Productos Más Vendidos">
            <div className="h-full flex items-center justify-center">
                <span className="text-gray-500">Cargando datos...</span>
            </div>
        </ChartContainer>;
    }

    if (!productosData) {
        return <ChartContainer title="Productos Más Vendidos">
            <div className="h-full flex items-center justify-center">
                <span className="text-gray-500">No hay datos disponibles</span>
            </div>
        </ChartContainer>;
    }

    const data = {
        labels: productosData.map(p => p.nombre),
        datasets: [
            {
                data: productosData.map(p => p.totalVentas),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            }
        ]
    };

    return (
        <ChartContainer 
            title="Productos Más Vendidos"
            stats={
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Total productos: {productosData.length}</div>
                    <div>
                        Mayor venta: ${Math.max(...productosData.map(p => p.totalVentas)).toLocaleString()}
                    </div>
                </div>
            }
        >
            <div className="h-full w-full flex items-center justify-center">
                <Bar options={options} data={data} />
            </div>
        </ChartContainer>
    );
};

export default ProductosTopChart; 