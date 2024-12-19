"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';
import VentasHoyChart from '@/components/GraficasChart/Ventas/VentasHoyChart';
import ProductosTopChart from '@/components/GraficasChart/Productos/ProductosTopChart';
import BalanceChart from '@/components/GraficasChart/Finanzas/BalanceChart';
import ClientesTopChart from '@/components/GraficasChart/Clientes/ClientesTopChart';

const DashboardPage = () => {
    const router = useRouter();
    const [tiendaId, setTiendaId] = useState(null);

    useEffect(() => {
        const verificarAutenticacion = async () => {
            try {
                const usuario = await AuthService.obtenerUsuarioActual();
                if (!usuario) {
                    router.push('/admin/auth/login');
                    return;
                }

                const tieneTienda = await AuthService.verificarTiendaExistente(usuario.uid);
                if (!tieneTienda) {
                    router.push('/admin/auth/register');
                    return;
                }

                setTiendaId(usuario.uid);
            } catch (error) {
                console.error('Error en verificación:', error);
            }
        };

        verificarAutenticacion();
    }, [router]);

    if (!tiendaId) {
        return <div className="p-4">Cargando...</div>;
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
            {/* KPIs Row - Responsive y Compacto */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-2">
                <div className="bg-white p-2 rounded-lg shadow">
                    <h3 className="text-xs font-semibold text-gray-600">Ventas Hoy</h3>
                    <p className="text-base lg:text-lg font-bold">$2.500.000</p>
                    <span className="text-xs text-green-500">↑ 10%</span>
                </div>
                <div className="bg-white p-2 rounded-lg shadow">
                    <h3 className="text-xs font-semibold text-gray-600">Promedio Venta</h3>
                    <p className="text-base lg:text-lg font-bold">$104.166</p>
                    <span className="text-xs text-green-500">↑ 5%</span>
                </div>
                <div className="bg-white p-2 rounded-lg shadow">
                    <h3 className="text-xs font-semibold text-gray-600">Margen Promedio</h3>
                    <p className="text-base lg:text-lg font-bold">35.0%</p>
                    <span className="text-xs text-green-500">↑ 2%</span>
                </div>
                <div className="bg-white p-2 rounded-lg shadow">
                    <h3 className="text-xs font-semibold text-gray-600">ROI Diario</h3>
                    <p className="text-base lg:text-lg font-bold">$0</p>
                    <span className="text-xs text-green-500">↑ 8%</span>
                </div>
            </div>

            {/* Gráficos Grid - Optimizado para laptop */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 p-2 min-h-0">
                <div className="h-[250px] lg:h-full">
                    <VentasHoyChart tiendaId={tiendaId} />
                </div>
                <div className="h-[250px] lg:h-full">
                    <ProductosTopChart tiendaId={tiendaId} />
                </div>
                <div className="h-[250px] lg:h-full">
                    <BalanceChart tiendaId={tiendaId} />
                </div>
                <div className="h-[250px] lg:h-full">
                    <ClientesTopChart tiendaId={tiendaId} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;