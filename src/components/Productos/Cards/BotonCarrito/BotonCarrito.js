"use client";
import React, { useState } from 'react';

const BotonCarrito = ({ producto }) => {
    const [mostrarNotificacion, setMostrarNotificacion] = useState(false);

    const agregarAlCarrito = () => {
        if (!producto) return;

        // Obtener carrito actual del localStorage
        let carritoGuardado = localStorage.getItem('carrito');
        let carrito = [];

        // Si hay algo en el carrito, lo convertimos a array
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
        }

        // Crear objeto del producto
        let productoNuevo = {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        };

        // Agregar al array
        carrito.push(productoNuevo);

        // Guardar en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));

        // Mostrar notificación
        setMostrarNotificacion(true);
        setTimeout(() => {
            setMostrarNotificacion(false);
        }, 2000);
    };

    return (
        <div className="relative">
            <button 
                onClick={agregarAlCarrito}
                className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
            >
                🛒
            </button>

            {mostrarNotificacion && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-green-500 text-white px-4 py-2 rounded-md text-sm">
                    ¡Agregado al carrito!
                </div>
            )}
        </div>
    );
};

export default BotonCarrito;