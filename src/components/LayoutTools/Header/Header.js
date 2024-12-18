"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TiendaService from '@/services/TiendaService';
import CarritoHeader from './CarritoHeader/CarritoHeader';
import AddUserHeader from './AddUserHeader/AddUserHeader';
import CerrarSesion from './CerrarSesion/CerrarSesion';

const Header = ({ ruta }) => {
    const router = useRouter();
    const [nombreTienda, setNombreTienda] = useState('Mi Tienda');
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);
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

    useEffect(() => {
        const handleClickFuera = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAbierto(false);
            }
        };

        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    return (
        <div className="w-full h-16 bg-orange-500 shadow-md relative">
            <div className="container mx-auto h-full px-4">
                <div className="flex justify-between items-center h-full">
                    <div className="text-white text-xl font-bold">
                        {nombreTienda}
                    </div>

                    <div className="flex items-center gap-4">
                        {mostrarBotonesMarket && (
                            <CarritoHeader />
                        )}

                        {(mostrarBotonesMarket || mostrarBotonesAdmin) && (
                            <button
                                className="md:hidden text-white text-2xl"
                                onClick={() => setMenuAbierto(!menuAbierto)}
                            >
                                ☰
                            </button>
                        )}

                        <div className="hidden md:flex gap-4">
                            {mostrarBotonesMarket && (
                                <AddUserHeader />
                            )}

                            {mostrarBotonesAdmin && (
                                <>
                                    <button className="bg-white text-orange-500 px-4 py-2 rounded-md">
                                        Inventario
                                    </button>
                                    <button
                                        onClick={() => window.open('/market', '_blank')}
                                        className="bg-white text-orange-500 px-4 py-2 rounded-md"
                                    >
                                        Ver tienda
                                    </button>
                                    <CerrarSesion />
                                </>
                            )}
                        </div>

                        {menuAbierto && (
                            <div 
                                ref={menuRef}
                                className="absolute top-16 right-0 bg-orange-500 shadow-lg rounded-b-lg p-4 md:hidden w-full sm:w-64 z-50"
                            >
                                <div className="flex flex-col gap-3">
                                    {mostrarBotonesMarket && (
                                        <div className="flex justify-center" onClick={() => setMenuAbierto(false)}>
                                            <AddUserHeader />
                                        </div>
                                    )}

                                    {mostrarBotonesAdmin && (
                                        <>
                                            <button 
                                                className="bg-white text-orange-500 px-4 py-2 rounded-md w-full"
                                                onClick={() => setMenuAbierto(false)}
                                            >
                                                Inventario
                                            </button>
                                            <button
                                                onClick={() => {
                                                    window.open('/market', '_blank');
                                                    setMenuAbierto(false);
                                                }}
                                                className="bg-white text-orange-500 px-4 py-2 rounded-md w-full"
                                            >
                                                Ver tienda
                                            </button>
                                            <CerrarSesion className="w-full" />
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