"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TiendaService from '@/services/TiendaService';
import AuthService from '@/services/AuthService';

const pageRegister = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

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
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">
                    Registro de Tienda
                </h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Nombre de la tienda"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />

                    <input
                        type="tel"
                        placeholder="Teléfono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Registrar Tienda
                    </button>
                </div>
            </form>
        </div>
    );
};

export default pageRegister;