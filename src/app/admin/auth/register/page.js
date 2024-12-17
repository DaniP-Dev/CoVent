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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">
                    Registro de Tienda
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la tienda
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Ej: Mi Super Tienda"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                            minLength={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            name="telefono"
                            placeholder="Ej: 3001234567"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                            minLength={7}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Registrando...' : 'Registrar Tienda'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;