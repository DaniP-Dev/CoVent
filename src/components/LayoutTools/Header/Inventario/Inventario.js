"use client";
import React, { useState, useEffect } from 'react';

const Inventario = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [formData, setFormData] = useState({
        nombreProducto: '',
        cantidad: '1',
        iva: '0',
        precioLote: '0',
        precioUnidad: '',
        loteConIva: 0
    });

    const formatearPrecio = (valor) => {
        if (valor === null || valor === undefined || valor === '') {
            return '';
        }

        let numero = 0;
        
        const valorLimpio = valor.toString().replace(/[^\d]/g, '');
        
        if (valorLimpio.length > 0) {
            numero = parseFloat(valorLimpio);
        }

        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numero);
    };

    const desformatearPrecio = (valor) => {
        if (valor === null || valor === undefined) {
            return '0';
        }

        const numeroLimpio = valor.toString().replace(/[^\d]/g, '');
        
        if (numeroLimpio.length === 0) {
            return '0';
        }

        return numeroLimpio;
    };

    const calcularLoteConIva = (precioLote, iva) => {
        const precioBase = parseInt(desformatearPrecio(precioLote));
        const ivaValue = parseInt(iva) / 100;
        const montoIva = precioBase * ivaValue;
        return precioBase + montoIva;
    };

    const calcularPrecioMinimo = (loteConIva, cantidad) => {
        const cantidadNumerica = parseInt(cantidad) || 1;
        if (loteConIva <= 0) return formatearPrecioMinimo(0);
        
        const precioMinimo = loteConIva / cantidadNumerica;
        return formatearPrecioMinimo(precioMinimo);
    };

    const formatearPrecioMinimo = (valor) => {
        if (!valor && valor !== 0) return '';
        
        // Convertir a número y manejar decimales
        const numero = parseFloat(valor);
        
        // Formatear con 2 decimales
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numero);
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

            switch (name) {
                case 'precioLote': {
                    const precioLimpio = desformatearPrecio(value);
                    newData.precioLote = formatearPrecio(precioLimpio);
                    break;
                }
                
                case 'cantidad': {
                    const cantidadValida = Math.max(parseInt(value) || 1, 1);
                    newData.cantidad = cantidadValida.toString();
                    break;
                }
                
                case 'iva': {
                    newData.iva = value;
                    break;
                }
                
                default:
                    newData[name] = value;
            }
            
            return newData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const datosParaEnviar = {
            ...formData,
            precioLote: parseInt(desformatearPrecio(formData.precioLote)),
            precioUnidad: parseInt(desformatearPrecio(formData.precioUnidad)),
            cantidad: parseInt(formData.cantidad),
            iva: parseInt(formData.iva)
        };
        console.log(datosParaEnviar);
        setMostrarModal(false);
    };

    const puedeEditarIva = formData.precioLote && formData.cantidad;

    return (
        <>
            <button 
                onClick={() => setMostrarModal(true)}
                className="bg-white text-orange-500 px-4 py-2 rounded-md w-full"
            >
                Inventario
            </button>

            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-orange-500">Nuevo Lote</h2>
                            <button 
                                onClick={() => setMostrarModal(false)}
                                className="text-gray-500 text-2xl"
                            >
                                ×
                            </button>
                        </div>

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
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                        required
                                        min="1"
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
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                        required
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
                                    {!puedeEditarIva && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Ingrese cantidad y precio del lote primero
                                        </p>
                                    )}
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

                            <button
                                type="submit"
                                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
                            >
                                Guardar Lote
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Inventario;
