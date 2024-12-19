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
                className="bg-[#4C4376] text-white p-2 rounded-md 
                    hover:bg-[#3a3359] 
                    active:scale-95
                    transform transition-all duration-200 
                    shadow-md hover:shadow-lg
                    flex items-center justify-center
                    min-w-[40px]"
            >
                🛒
            </button>
        </div>
    );
};

export default BotonCarrito;