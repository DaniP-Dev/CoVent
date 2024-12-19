"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TiendaService from '@/services/TiendaService';
import AuthService from '@/services/AuthService';

const RegisterPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verificarUsuario = async () => {
            const usuario = await AuthService.obtenerUsuarioActual();
            if (!usuario) {
                router.push('/admin/auth/login');
            }
        };

        verificarUsuario();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const usuario = await AuthService.obtenerUsuarioActual();
            if (!usuario) {
                router.push('/admin/auth/login');
                return;
            }

            const resultado = await TiendaService.crearTienda({
                id: usuario.uid,
                nombre: formData.nombre,
                email: usuario.email,
                telefono: formData.telefono
            });

            if (resultado.exito) {
                router.push('/admin/dashboard');
            } else {
                setError(resultado.mensaje);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E7BCB8]/20">
            <form onSubmit={handleSubmit}>
                <div className="bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(76,67,118,0.15)] w-96">
                    <h2 className="text-2xl font-bold mb-6 text-center text-[#4C4376]">
                        Registrar Tienda
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#443054]">
                                Nombre de la Tienda
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full p-2 border border-[#4C4376]/20 rounded-md 
                                    focus:ring-2 focus:ring-[#4C4376]/30 focus:border-[#4C4376] 
                                    outline-none transition-all
                                    placeholder:text-[#443054]/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#443054]">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="w-full p-2 border border-[#4C4376]/20 rounded-md 
                                    focus:ring-2 focus:ring-[#4C4376]/30 focus:border-[#4C4376] 
                                    outline-none transition-all
                                    placeholder:text-[#443054]/50"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-[#AE445A] text-sm bg-[#AE445A]/10 p-2 rounded-md border border-[#AE445A]/20 text-center">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#4C4376] text-white py-2 px-4 rounded-md 
                                ${loading 
                                    ? 'bg-[#443054]/50 cursor-not-allowed' 
                                    : 'hover:bg-[#3a3359] active:scale-95'
                                }
                                transform transition-all duration-200
                                shadow-md hover:shadow-lg`}
                        >
                            {loading ? 'Registrando...' : 'Registrar Tienda'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;