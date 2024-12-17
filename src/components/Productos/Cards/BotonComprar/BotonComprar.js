"use client";
import React, { useState } from 'react';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const BotonComprar = ({ esCarrito = false, onCompraExitosa = () => {} }) => {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [medioPago, setMedioPago] = useState('');
    const [error, setError] = useState('');
    const [exitoso, setExitoso] = useState(false);
    const [mostrarNotificacion, setMostrarNotificacion] = useState(false);

    const mediosPago = ["Efectivo", "Tarjeta", "Nequi", "PSE"];

    const handleComprar = async () => {
        if (!correo) {
            setError('Escribe tu correo');
            return;
        }
        if (!contrasena) {
            setError('Escribe tu contraseña');
            return;
        }
        if (!medioPago) {
            setError('Selecciona forma de pago');
            return;
        }

        try {
            let carritoGuardado = localStorage.getItem('carrito');
            if (!carritoGuardado) {
                setError('El carrito está vacío');
                return;
            }

            let productos = JSON.parse(carritoGuardado);
            let total = 0;
            for (let i = 0; i < productos.length; i++) {
                total = total + (productos[i].precio * productos[i].cantidad);
            }

            let datosCompra = {
                cliente: {
                    correo: correo
                },
                productos: productos,
                total: total,
                medioPago: medioPago,
                fecha: new Date().toISOString(),
                estado: 'pendiente'
            };

            let ordenesRef = collection(db, 'ordenes');
            let resultado = await addDoc(ordenesRef, datosCompra);

            if (resultado) {
                setError('');
                setExitoso(true);
                localStorage.removeItem('carrito');
                setMostrarNotificacion(true);
                
                // Cerrar el formulario y mostrar notificación
                setMostrarFormulario(false);
                
                // Esperar 1 segundo y luego limpiar todo
                setTimeout(() => {
                    setMostrarNotificacion(false);
                    onCompraExitosa();
                }, 1000);
            }

        } catch (error) {
            setError('Error al procesar la compra');
            console.error('Error:', error);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setMostrarFormulario(true)}
                className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 w-full"
            >
                {esCarrito ? '💸Comprar Carrito💸' : '💸'}
            </button>

            {mostrarFormulario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
                     style={{ zIndex: 1000 }}>
                    <div className="bg-white p-6 rounded-lg w-96 relative">
                        <h2 className="text-xl font-bold mb-4">Datos de Compra</h2>
                        
                        {error && (
                            <p className="text-red-500 mb-4">{error}</p>
                        )}
                        
                        <div className="space-y-4">
                            <input 
                                type="email"
                                placeholder="Tu correo"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                            
                            <input 
                                type="password"
                                placeholder="Tu contraseña"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                            
                            <select
                                value={medioPago}
                                onChange={(e) => setMedioPago(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Selecciona forma de pago</option>
                                {mediosPago.map((medio, index) => (
                                    <option key={index} value={medio}>
                                        {medio}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-2 justify-end mt-4">
                                <button 
                                    onClick={() => setMostrarFormulario(false)}
                                    className="px-4 py-2 bg-gray-200 rounded"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleComprar}
                                    className="px-4 py-2 bg-orange-500 text-white rounded"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notificación flotante */}
            {mostrarNotificacion && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
                    ¡Compra realizada con éxito! 🎉
                </div>
            )}
        </div>
    );
};

export default BotonComprar;