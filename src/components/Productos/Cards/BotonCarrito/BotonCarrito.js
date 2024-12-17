"use client";
import React from 'react';
import CarritoService from '@/services/CarritoService';

const BotonCarrito = ({ producto }) => {
    const agregarAlCarrito = () => {
        if (!producto) return;

        const resultado = CarritoService.agregarProducto(producto);
        
        if (resultado.exito) {
            // Aquí podrías agregar una notificación de éxito
        }
    };

    return (
        <div className="relative">
            <button
                onClick={agregarAlCarrito}
                className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
            >
                🛒
            </button>
        </div>
    );
};

export default BotonCarrito;