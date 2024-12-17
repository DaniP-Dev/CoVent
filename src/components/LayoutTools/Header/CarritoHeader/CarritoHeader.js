"use client";
import React, { useState, useEffect } from 'react';
import BotonComprar from '@/components/Productos/Cards/BotonComprar/BotonComprar';

const CarritoHeader = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);
    const [cantidadTotal, setCantidadTotal] = useState(0);

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(precio);
    };

    const onCompraExitosa = () => {
        setProductos([]);
        setTotal(0);
        setMostrarModal(false);
        setCantidadTotal(0);
    };

    // Verificar carrito cada 500ms
    useEffect(() => {
        const intervalo = setInterval(() => {
            let carritoGuardado = localStorage.getItem('carrito');
            
            if (carritoGuardado) {
                let productosCarrito = JSON.parse(carritoGuardado);
                let cantidad = 0;
                let suma = 0;

                // Sumar cantidades y total
                for (let i = 0; i < productosCarrito.length; i++) {
                    if (productosCarrito[i].cantidad) {
                        cantidad = cantidad + productosCarrito[i].cantidad;
                        suma = suma + (productosCarrito[i].precio * productosCarrito[i].cantidad);
                    }
                }

                setProductos(productosCarrito);
                setTotal(suma);
                setCantidadTotal(cantidad);
            } else {
                setProductos([]);
                setTotal(0);
                setCantidadTotal(0);
            }
        }, 500);

        return () => clearInterval(intervalo);
    }, []);

    const actualizarCantidad = (index, nuevaCantidad) => {
        if (nuevaCantidad < 1 || nuevaCantidad > 10) {
            return;
        }

        let productosActuales = [...productos];
        productosActuales[index].cantidad = nuevaCantidad;
        
        let suma = 0;
        let cantidad = 0;
        
        for (let i = 0; i < productosActuales.length; i++) {
            suma = suma + (productosActuales[i].precio * productosActuales[i].cantidad);
            cantidad = cantidad + productosActuales[i].cantidad;
        }

        localStorage.setItem('carrito', JSON.stringify(productosActuales));
        setProductos(productosActuales);
        setTotal(suma);
        setCantidadTotal(cantidad);
    };

    const eliminarProducto = (index) => {
        let productosActuales = [...productos];
        productosActuales.splice(index, 1);

        let suma = 0;
        let cantidad = 0;
        
        for (let i = 0; i < productosActuales.length; i++) {
            suma = suma + (productosActuales[i].precio * productosActuales[i].cantidad);
            cantidad = cantidad + productosActuales[i].cantidad;
        }

        localStorage.setItem('carrito', JSON.stringify(productosActuales));
        setProductos(productosActuales);
        setTotal(suma);
        setCantidadTotal(cantidad);
    };

    return (
        <>
            <button onClick={() => setMostrarModal(true)}
                className="bg-white text-orange-500 px-4 py-2 rounded-md flex items-center gap-2">
                <span className="text-xl">🛒</span>
                {cantidadTotal > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2">
                        {cantidadTotal}
                    </span>
                )}
            </button>

            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-11/12 max-w-4xl h-[90vh] rounded-lg shadow-xl flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-orange-500">Carrito 🛒</h2>
                            <button onClick={() => setMostrarModal(false)}
                                className="text-gray-500 text-2xl">&times;</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {productos.length > 0 ? (
                                productos.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 mb-4 p-2 border rounded">
                                        <img src={item.imagen}
                                            alt={item.nombre}
                                            className="w-20 h-20 object-cover rounded" />
                                        <div className="flex-1">
                                            <h3 className="font-bold">{item.nombre}</h3>
                                            <p className="text-orange-500">
                                                {formatearPrecio(item.precio)}
                                            </p>
                                            <div className="flex items-center gap-2 my-2">
                                                <button 
                                                    onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                                                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                                >
                                                    -
                                                </button>
                                                <input 
                                                    type="number"
                                                    value={item.cantidad}
                                                    onChange={(e) => actualizarCantidad(index, parseInt(e.target.value))}
                                                    className="w-16 text-center border rounded p-1"
                                                    min="1"
                                                    max="10"
                                                />
                                                <button 
                                                    onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                                                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Subtotal: {formatearPrecio(item.precio * item.cantidad)}
                                            </p>
                                        </div>
                                        <button onClick={() => eliminarProducto(index)}
                                            className="text-red-500">
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 mt-10">
                                    El carrito está vacío
                                </p>
                            )}
                        </div>

                        <div className="border-t p-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-bold">Total:</span>
                                <span className="text-2xl text-orange-500 font-bold">
                                    {formatearPrecio(total)}
                                </span>
                            </div>
                            <BotonComprar esCarrito={true} onCompraExitosa={onCompraExitosa} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CarritoHeader; 