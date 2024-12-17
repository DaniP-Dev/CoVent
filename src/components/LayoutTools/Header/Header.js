import React from 'react';
import CarritoHeader from './CarritoHeader/CarritoHeader';
import AddUserHeader from './AddUserHeader/AddUserHeader';
import CerrarSesion from './CerrarSesion/CerrarSesion';

const Header = ({ ruta }) => {
    const mostrarBotonesMarket = ruta === 'market';
    const mostrarBotonesAdmin = ruta === 'admin';

    return (
        <div className="w-full h-16 bg-orange-500 shadow-md">
            <div className="container mx-auto h-full px-4">
                <div className="flex justify-between items-center h-full">
                    <div className="text-white text-xl font-bold">
                        Mi Tienda
                    </div>

                    <div className="flex gap-4">
                        {mostrarBotonesMarket && (
                            <>
                                <CarritoHeader />
                                <AddUserHeader />
                            </>
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
                </div>
            </div>
        </div>
    );
};

export default Header;