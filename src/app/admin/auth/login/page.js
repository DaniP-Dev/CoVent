"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';

const pageLogin = () => {
    const router = useRouter();

    const handleGoogleLogin = async () => {
        try {
            const resultado = await AuthService.loginConGoogle();
            
            if (resultado.exito) {
                if (resultado.tieneTienda) {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/admin/auth/register');
                }
            } else {
                console.error('Error en login:', resultado.mensaje, resultado.error);
            }
        } catch (error) {
            console.error('Error crítico en login:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E7BCB8]/20">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#4C4376]">
                    Admin Login
                </h2>
                
                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-[#4C4376] text-white py-2 px-4 rounded-md 
                        hover:bg-[#3a3359] 
                        active:scale-95
                        transform transition-all duration-200
                        shadow-md hover:shadow-lg"
                >
                    Iniciar sesión con Google
                </button>
            </div>
        </div>
    );
};

export default pageLogin;