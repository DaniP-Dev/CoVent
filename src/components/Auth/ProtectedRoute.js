"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';

const ProtectedRoute = ({ children }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

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

                setAuthorized(true);
            } catch (error) {
                router.push('/admin/auth/login');
            } finally {
                setLoading(false);
            }
        };

        verificarAutenticacion();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return authorized ? children : null;
};

export default ProtectedRoute;
