"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TiendaService from '@/services/TiendaService';
import CarritoHeader from './CarritoHeader/CarritoHeader';
import AddUserHeader from './AddUserHeader/AddUserHeader';
import CerrarSesion from './CerrarSesion/CerrarSesion';

const Header = ({ ruta }) => {
    const [nombreTienda, setNombreTienda] = useState('Mi Tienda');
    const [menuAbierto, setMenuAbierto] = useState(false);
    const { user } = useAuth();
    const mostrarBotonesMarket = ruta === 'market';
    const mostrarBotonesAdmin = ruta === 'admin';

    useEffect(() => {
        const obtenerNombreTienda = async () => {
            if (user) {
                const resultado = await TiendaService.obtenerNombreTienda(user.uid);
                if (resultado.exito) {
                    setNombreTienda(resultado.nombre);
                }
            }
        };

        obtenerNombreTienda();
    }, [user]);

    return (
        <div className="w-full h-16 bg-orange-500 shadow-md relative">
            <div className="container mx-auto h-full px-4">
                <div className="flex justify-between items-center h-full">
                    <div className="text-white text-xl font-bold">
                        {nombreTienda}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Carrito siempre visible */}
                        {mostrarBotonesMarket && (
                            <CarritoHeader />
                        )}

                        {/* Botón hamburguesa para móviles */}
                        {(mostrarBotonesMarket || mostrarBotonesAdmin) && (
                            <button 
                                className="md:hidden text-white text-2xl"
                                onClick={() => setMenuAbierto(!menuAbierto)}
                            >
                                ☰
                            </button>
                        )}

                        {/* Botones para pantallas medianas y grandes */}
                        <div className="hidden md:flex gap-4">
                            {mostrarBotonesMarket && (
                                <AddUserHeader />
                            )}

                            {mostrarBotonesAdmin && (
                                <>
                                    <button className="bg-white text-orange-500 px-4 py-2 rounded-md">
                                        Inventario
                                    </button>
                                    <button className="bg-white text-orange-500 px-4 py-2 rounded-md">
                                        Ventas
                                    </button>
                                    <CerrarSesion />
                                </>
                            )}
                        </div>

                        {/* Menú móvil */}
                        {menuAbierto && (
                            <div className="absolute top-16 right-0 bg-orange-500 shadow-lg rounded-b-lg p-4 md:hidden w-full sm:w-64 z-50">
                                <div className="flex flex-col gap-3">
                                    {mostrarBotonesMarket && (
                                        <div className="flex justify-center">
                                            <AddUserHeader />
                                        </div>
                                    )}

                                    {mostrarBotonesAdmin && (
                                        <>
                                            <button className="bg-white text-orange-500 px-4 py-2 rounded-md w-full">
                                                Inventario
                                            </button>
                                            <button className="bg-white text-orange-500 px-4 py-2 rounded-md w-full">
                                                Ventas
                                            </button>
                                            <CerrarSesion />
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;