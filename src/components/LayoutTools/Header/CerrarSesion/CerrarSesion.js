"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';

const CerrarSesion = () => {
    const router = useRouter();

    const handleCerrarSesion = async () => {
        try {
            const resultado = await AuthService.cerrarSesion();
            if (resultado.exito) {
                router.push('/admin/auth/login');
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <button 
            onClick={handleCerrarSesion}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
            Cerrar sesión
        </button>
    );
};

export default CerrarSesion;
