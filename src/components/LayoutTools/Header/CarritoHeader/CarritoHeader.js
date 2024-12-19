"use client";
import React, { useState, useEffect } from 'react';
import BotonComprar from '@/components/Productos/Cards/BotonComprar/BotonComprar';
import CarritoService from '@/services/CarritoService';

// Componente para formatear precios
const FormatoPrecio = ({ precio }) => {
    const precioFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(precio);

    return <span>{precioFormateado}</span>;
};

// Componente para el contador de cantidad
const ContadorCantidad = ({ cantidad, onCambio }) => {
    return (
        <div className="flex items-center gap-2 my-2">
            <button
                onClick={() => onCambio(cantidad - 1)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
                -
            </button>
            <input
                type="number"
                value={cantidad}
                onChange={(e) => onCambio(parseInt(e.target.value))}
                className="w-16 text-center border rounded p-1"
                min="1"
                max="10"
            />
            <button
                onClick={() => onCambio(cantidad + 1)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
                +
            </button>
        </div>
    );
};

// Componente para cada item del carrito
const ItemCarrito = ({ item, index, onActualizarCantidad, onEliminar }) => {
    return (
        <div className="flex items-center gap-4 mb-4 p-2 border rounded">
            <img src={item.imagen}
                alt={item.nombre}
                className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
                <h3 className="font-bold">{item.nombre}</h3>
                <p className="text-orange-500">
                    <FormatoPrecio precio={item.precio} />
                </p>
                <ContadorCantidad
                    cantidad={item.cantidad}
                    onCambio={(nuevaCantidad) => onActualizarCantidad(index, nuevaCantidad)}
                />
                <p className="text-sm text-gray-500">
                    Subtotal: <FormatoPrecio precio={item.precio * item.cantidad} />
                </p>
            </div>
            <button onClick={() => onEliminar(index)}
                className="text-red-500">
                🗑️
            </button>
        </div>
    );
};

// Componente principal
const CarritoHeader = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);
    const [cantidadTotal, setCantidadTotal] = useState(0);

    const actualizarEstadoCarrito = (productosCarrito) => {
        const totales = CarritoService.calcularTotales(productosCarrito);
        setProductos(productosCarrito);
        setTotal(totales.suma);
        setCantidadTotal(totales.cantidad);
    };

    useEffect(() => {
        const intervalo = setInterval(() => {
            const productosCarrito = CarritoService.obtenerCarrito();
            actualizarEstadoCarrito(productosCarrito);
        }, 500);

        return () => clearInterval(intervalo);
    }, []);

    const actualizarCantidad = (index, nuevaCantidad) => {
        if (nuevaCantidad < 1 || nuevaCantidad > 10) return;

        const productosActuales = [...productos];
        productosActuales[index].cantidad = nuevaCantidad;
        CarritoService.agregarProducto(productosActuales[index], 0);
        actualizarEstadoCarrito(productosActuales);
    };

    const eliminarProducto = (index) => {
        const productosActuales = [...productos];
        productosActuales.splice(index, 1);
        localStorage.setItem('carrito', JSON.stringify(productosActuales));
        actualizarEstadoCarrito(productosActuales);
    };

    const onCompraExitosa = () => {
        CarritoService.limpiarCarrito();
        setProductos([]);
        setTotal(0);
        setMostrarModal(false);
        setCantidadTotal(0);
    };

    return (
        <>
            <button onClick={() => setMostrarModal(true)}
                className="bg-[#E7BCB8] text-[#443054] px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#E7BCB8]/90 transition-colors">
                <span className="text-xl">🛒</span>
                {cantidadTotal > 0 && (
                    <span className="bg-[#AE445A] text-white text-xs rounded-full px-2">
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
                                    <ItemCarrito
                                        key={index}
                                        item={item}
                                        index={index}
                                        onActualizarCantidad={actualizarCantidad}
                                        onEliminar={eliminarProducto}
                                    />
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
                                    <FormatoPrecio precio={total} />
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