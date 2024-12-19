"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';
import VentasHoyChart from '@/components/GraficasChart/Ventas/VentasHoyChart';
import ProductosTopChart from '@/components/GraficasChart/Productos/ProductosTopChart';
import BalanceChart from '@/components/GraficasChart/Finanzas/BalanceChart';
import ClientesTopChart from '@/components/GraficasChart/Clientes/ClientesTopChart';
import './grafias.css';

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
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="dashboard-container">
            {/* KPIs */}
            <div className="kpis-grid">
                <div className="kpi-card">
                    <h3 className="kpi-title">Ventas Hoy</h3>
                    <p className="kpi-value">$2.500.000</p>
                    <span className="kpi-trend">↑ 10%</span>
                </div>
                <div className="kpi-card">
                    <h3 className="kpi-title">Promedio Venta</h3>
                    <p className="kpi-value">$104.166</p>
                    <span className="kpi-trend">↑ 5%</span>
                </div>
                <div className="kpi-card">
                    <h3 className="kpi-title">Margen Promedio</h3>
                    <p className="kpi-value">35.0%</p>
                    <span className="kpi-trend">↑ 2%</span>
                </div>
                <div className="kpi-card">
                    <h3 className="kpi-title">ROI Diario</h3>
                    <p className="kpi-value">$0</p>
                    <span className="kpi-trend">↑ 8%</span>
                </div>
            </div>

            {/* Gráficos */}
            <div className="charts-grid">
                <div className="chart-container">
                    <VentasHoyChart tiendaId={tiendaId} />
                </div>
                <div className="chart-container">
                    <ProductosTopChart tiendaId={tiendaId} />
                </div>
                <div className="chart-container">
                    <BalanceChart tiendaId={tiendaId} />
                </div>
                <div className="chart-container">
                    <ClientesTopChart tiendaId={tiendaId} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;