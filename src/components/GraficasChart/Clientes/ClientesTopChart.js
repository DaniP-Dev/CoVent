'use client';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import ClientesMetricasService from '@/services/metricas/ClientesMetricasService';
import { useMetricas } from '../hooks/useMetricas';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ClientesTopChart = ({ tiendaId }) => {
    const { data: clientesData, loading, error } = useMetricas(
        (tid) => ClientesMetricasService.obtenerClientesTop(tid, 5),
        tiendaId
    );

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Clientes Top'
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const cliente = clientesData[context.dataIndex];
                        return [
                            `Cliente: ${cliente.correo}`,
                            `Total: $${cliente.totalCompras.toLocaleString()}`,
                            `Compras: ${cliente.cantidadCompras}`
                        ];
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">Cargando datos...</span>
            </div>
        );
    }

    if (!clientesData || clientesData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">No hay datos disponibles</span>
            </div>
        );
    }

    const data = {
        labels: clientesData.map(c => c.correo.split('@')[0]), // Solo mostrar parte inicial del correo
        datasets: [
            {
                data: clientesData.map(c => c.totalCompras),
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
        <div className="h-full min-h-0 p-4 bg-white rounded-lg shadow flex flex-col">
            <div className="flex-1 min-h-0">
                <Doughnut options={options} data={data} />
            </div>
            <div className="flex-none mt-2 text-sm text-gray-600">
                <div>Total clientes: {clientesData.length}</div>
                <div>
                    Mayor compra: ${Math.max(...clientesData.map(c => c.totalCompras)).toLocaleString()}
                </div>
            </div>
        </div>
    );
};

export default ClientesTopChart; 