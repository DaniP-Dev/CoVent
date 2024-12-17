"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';

const DashboardPage = () => {
    const router = useRouter();

    useEffect(() => {
        const verificarAutenticacion = async () => {
            const usuario = await AuthService.obtenerUsuarioActual();
            if (!usuario) {
                router.push('/admin/auth/login');
                return;
            }

            const tieneTienda = await AuthService.verificarTiendaExistente(usuario.uid);
            if (!tieneTienda) {
                router.push('/admin/auth/register');
            }
        };

        verificarAutenticacion();
    }, [router]);

    return (
        <div>
            <h1>Dashboard</h1>
            {/* Contenido del dashboard */}
        </div>
    );
};

export default DashboardPage;