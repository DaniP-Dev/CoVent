"use client";
import React, { useState, useEffect } from 'react';
import LoteService from '@/services/LoteService';
import { auth } from '@/config/firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase/firebaseConfig';

const Inventario = () => {
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [notificacion, setNotificacion] = useState({ mensaje: '', tipo: '', visible: false });
    const [formData, setFormData] = useState({
        nombreProducto: '',
        cantidad: '1',
        iva: '0',
        precioLote: '0',
        precioUnidad: '',
        loteConIva: 0,
        proveedor: '',
        actualizaciones: []
    });
    const [lotes, setLotes] = useState([]);
    const [modo, setModo] = useState('nuevo'); // 'nuevo' o 'actualizar'
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);
    const [cantidadActualizar, setCantidadActualizar] = useState('1');
    const [toastFlotante, setToastFlotante] = useState({ visible: false, mensaje: '' });
    const [inputActivo, setInputActivo] = useState(false);

    const formatearPrecio = (valor) => {
        if (valor === null || valor === undefined || valor === '') {
            return '';
        }

        const numero = parseFloat(valor.toString().replace(/[^\d]/g, ''));
        
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
        }).format(numero);
    };

    const desformatearPrecio = (valor) => {
        if (valor === null || valor === undefined) {
            return '0,00';
        }

        // Mantener el formato con puntos y comas
        return valor.toString()
            .replace(/[^\d.,]/g, '') // Mantener solo números, puntos y comas
            .replace(/\s/g, ''); // Eliminar espacios
    };

    const calcularLoteConIva = (precioLote, iva) => {
        // Convertir el precio manteniendo el formato
        const precioBase = parseFloat(precioLote.replace(/\./g, '').replace(',', '.'));
        const ivaValue = parseInt(iva) / 100;
        const montoIva = precioBase * ivaValue;
        const total = precioBase + montoIva;
        
        // Devolver el resultado formateado
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
        }).format(total);
    };

    const calcularPrecioMinimo = (loteConIva, cantidad) => {
        const cantidadNumerica = parseInt(cantidad) || 1;
        
        if (!loteConIva || loteConIva === '0,00') return '0,00';
        
        // Convertir el precio manteniendo el formato
        const precioLimpio = parseFloat(loteConIva.replace(/\./g, '').replace(',', '.'));
        const precioMinimo = precioLimpio / cantidadNumerica;
        
        // Devolver el resultado formateado
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
        }).format(precioMinimo);
    };

    useEffect(() => {
        // Recalcular loteConIva cuando cambie precio lote o IVA
        const nuevoLoteConIva = calcularLoteConIva(formData.precioLote, formData.iva);
        
        // Recalcular precio mínimo con el nuevo loteConIva
        const nuevoPrecioMinimo = calcularPrecioMinimo(nuevoLoteConIva, formData.cantidad);
        
        setFormData(prev => ({
            ...prev,
            loteConIva: nuevoLoteConIva,
            precioUnidad: nuevoPrecioMinimo
        }));
    }, [formData.precioLote, formData.iva]);

    useEffect(() => {
        // Recalcular precio mínimo cuando cambie la cantidad
        const nuevoPrecioMinimo = calcularPrecioMinimo(formData.loteConIva, formData.cantidad);
        
        setFormData(prev => ({
            ...prev,
            precioUnidad: nuevoPrecioMinimo
        }));
    }, [formData.cantidad]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newData = { ...prev };

            if (name === 'precioLote') {
                // Permitir solo números mientras se escribe
                const soloNumeros = value.replace(/\D/g, '');
                newData.precioLote = soloNumeros;
            } else {
                newData[name] = value;
            }

            return newData;
        });
    };

    const handleInputBlur = (e) => {
        const { name, value } = e.target;
        setInputActivo(false);

        if (name === 'precioLote' && value) {
            setFormData(prev => ({
                ...prev,
                precioLote: formatearPrecio(value)
            }));
        }
    };

    const handleInputFocus = () => {
        setInputActivo(true);
        // Cuando el input recibe el foco, mostrar solo los números
        setFormData(prev => ({
            ...prev,
            precioLote: prev.precioLote.replace(/[^\d]/g, '')
        }));
    };

    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo, visible: true });
        setTimeout(() => {
            setNotificacion(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Función para mostrar el toast flotante
    const mostrarToastFlotante = (mensaje) => {
        setToastFlotante({ visible: true, mensaje });
        setTimeout(() => {
            setToastFlotante({ visible: false, mensaje: '' });
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const usuario = auth.currentUser;
            if (!usuario) {
                mostrarNotificacion('No hay usuario autenticado', 'error');
                return;
            }

            const datosParaEnviar = {
                ...formData,
                // Guardar los precios manteniendo el formato con puntos y comas
                precioLote: formData.precioLote.replace(/[^\d.,]/g, ''),
                precioUnidad: formData.precioUnidad.replace(/[^\d.,]/g, ''),
                cantidad: parseInt(formData.cantidad),
                iva: parseInt(formData.iva),
                fechaCreacion: new Date(),
                actualizaciones: [{
                    fecha: new Date(),
                    cantidad: parseInt(formData.cantidad),
                    tipo: 'INICIAL',
                    usuario: usuario.uid
                }]
            };

            const resultado = await LoteService.crearLote(usuario.uid, datosParaEnviar);

            if (resultado.exito) {
                setMostrarModal(false);
                mostrarToastFlotante(`¡Lote "${datosParaEnviar.nombreProducto}" agregado!`);
                setFormData({
                    nombreProducto: '',
                    cantidad: '1',
                    iva: '0',
                    precioLote: '0',
                    precioUnidad: '',
                    loteConIva: 0,
                    proveedor: '',
                    actualizaciones: []
                });
            } else {
                mostrarNotificacion(resultado.mensaje, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al guardar el lote', 'error');
        }
    };

    const puedeEditarIva = formData.precioLote && formData.cantidad;

    // Suscripción al snapshot de lotes
    useEffect(() => {
        if (!mostrarModal) return;

        const usuario = auth.currentUser;
        if (!usuario) return;

        // Crear la suscripción
        const lotesRef = collection(db, 'tiendas', usuario.uid, 'lotes');
        const unsubscribe = onSnapshot(lotesRef, (snapshot) => {
            const lotesActualizados = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLotes(lotesActualizados);
        }, (error) => {
            console.error("Error en snapshot:", error);
        });

        // Limpiar la suscripción cuando se cierre el modal
        return () => unsubscribe();
    }, [mostrarModal]);

    const handleLoteSeleccionado = (e) => {
        const loteId = e.target.value;
        if (loteId === 'nuevo') {
            setModo('nuevo');
            setLoteSeleccionado(null);
            setFormData({
                nombreProducto: '',
                cantidad: '1',
                iva: '0',
                precioLote: '0',
                precioUnidad: '',
                loteConIva: 0,
                proveedor: '',
                actualizaciones: []
            });
        } else {
            const lote = lotes.find(l => l.id === loteId);
            setModo('actualizar');
            setLoteSeleccionado(lote);
            setCantidadActualizar('1');
        }
    };

    const handleActualizarCantidad = async (e) => {
        e.preventDefault();
        try {
            const usuario = auth.currentUser;
            if (!usuario || !loteSeleccionado) return;

            const resultado = await LoteService.actualizarCantidadLote(
                usuario.uid,
                loteSeleccionado.id,
                parseInt(cantidadActualizar),
                'Actualización de inventario'
            );

            if (resultado.exito) {
                setMostrarModal(false);
                mostrarToastFlotante(`¡${cantidadActualizar} unidades agregadas a "${loteSeleccionado.nombreProducto}"!`);
                setCantidadActualizar('1');
                setLoteSeleccionado(null);
                setModo('nuevo');
            } else {
                mostrarNotificacion(resultado.mensaje, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al actualizar la cantidad', 'error');
        }
    };

    // Agregar esta función para manejar el foco en el input de cantidad
    const handleCantidadFocus = () => {
        setFormData(prev => ({
            ...prev,
            cantidad: ''  // Limpiar el campo cuando recibe el foco
        }));
    };

    return (
        <>
            <button 
                onClick={() => setMostrarModal(true)}
                className="bg-[#E7BCB8] text-[#443054] px-4 py-2 rounded-md w-full hover:bg-[#E7BCB8]/90 transition-colors"
            >
                Inventario
            </button>

            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[#4C4376]">Nuevo Lote</h2>
                            <button 
                                onClick={() => setMostrarModal(false)}
                                className="text-gray-500 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {notificacion.visible && (
                            <div className={`mb-4 p-3 rounded-md ${
                                notificacion.tipo === 'error' 
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-green-100 text-green-700 border border-green-200'
                            }`}>
                                {notificacion.mensaje}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar Producto
                            </label>
                            <select
                                onChange={handleLoteSeleccionado}
                                value={loteSeleccionado?.id || 'nuevo'}
                                className="w-full rounded-md border border-gray-300 p-2"
                            >
                                <option value="nuevo">-- Nuevo Producto --</option>
                                {lotes.map(lote => (
                                    <option key={lote.id} value={lote.id}>
                                        {lote.nombreProducto} ({lote.estado === 'disponible' ? '✓' : '✗'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {modo === 'actualizar' ? (
                            <form onSubmit={handleActualizarCantidad} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cantidad a Agregar
                                    </label>
                                    <input
                                        type="number"
                                        value={cantidadActualizar}
                                        onChange={(e) => setCantidadActualizar(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="text-sm space-y-2">
                                    <p>Producto: {loteSeleccionado?.nombreProducto}</p>
                                    <div className="flex items-center justify-between">
                                        <p>Cantidad actual: {loteSeleccionado?.cantidad}</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            loteSeleccionado?.estado === 'disponible' 
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {loteSeleccionado?.estado === 'disponible' ? 'Disponible' : 'Agotado'}
                                        </span>
                                    </div>
                                    <p>Proveedor: {loteSeleccionado?.proveedor}</p>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#4C4376] text-white py-2 px-4 rounded-md hover:bg-[#3a3359] transition-colors"
                                >
                                    Actualizar Cantidad
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nombre del Producto
                                    </label>
                                    <input
                                        type="text"
                                        name="nombreProducto"
                                        value={formData.nombreProducto}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            name="cantidad"
                                            value={formData.cantidad}
                                            onChange={handleInputChange}
                                            onFocus={handleCantidadFocus}
                                            min="1"
                                            placeholder="Cantidad"
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Precio del Lote
                                        </label>
                                        <input
                                            type="text"
                                            name="precioLote"
                                            value={formData.precioLote}
                                            onChange={handleInputChange}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                            placeholder="Precio del lote"
                                            className="w-full p-1.5 border rounded text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            IVA
                                        </label>
                                        <select
                                            name="iva"
                                            value={formData.iva}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md border border-gray-300 p-2 ${!puedeEditarIva ? 'bg-gray-100' : ''}`}
                                            disabled={!puedeEditarIva}
                                        >
                                            <option value="0">0%</option>
                                            <option value="19">19%</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            $Precio Minimo
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.precioUnidad}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-gray-100 text-gray-700 [&>span]:text-gray-400"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Proveedor
                                    </label>
                                    <input
                                        type="text"
                                        name="proveedor"
                                        value={formData.proveedor}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                        placeholder="Nombre del proveedor"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#4C4376] text-white py-2 px-4 rounded-md hover:bg-[#3a3359] transition-colors"
                                >
                                    Guardar Lote
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Toast flotante */}
            {toastFlotante.visible && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up">
                    <div className="flex items-center space-x-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{toastFlotante.mensaje}</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default Inventario;
