"use client";
import React, { useState, useEffect } from 'react';
import { auth } from '@/config/firebase/firebaseConfig';
import LoteService from '@/services/LoteService';
import ProductoService from '@/services/ProductoService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase/firebaseConfig';

const AgregarProducto = () => {
    const [lotes, setLotes] = useState([]);
    const [categorias, setCategorias] = useState(['General']);
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [formData, setFormData] = useState({
        loteId: '',
        cantidad: '',
        ganancia: '',
        iva: '0',
        precioFinal: '',
        categoria: '',
        imagen: null
    });
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);

    // Cargar lotes con snapshot
    useEffect(() => {
        const usuario = auth.currentUser;
        if (!usuario) return;

        const lotesRef = collection(db, 'tiendas', usuario.uid, 'lotes');
        const unsubscribe = onSnapshot(lotesRef, (snapshot) => {
            const lotesActualizados = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLotes(lotesActualizados);
        });

        return () => unsubscribe();
    }, []);

    // Cargar categorías
    useEffect(() => {
        const cargarCategorias = async () => {
            const usuario = auth.currentUser;
            if (!usuario) return;

            const resultado = await ProductoService.obtenerCategorias(usuario.uid);
            if (resultado.exito) {
                setCategorias(resultado.datos);
            }
        };

        cargarCategorias();
    }, []);

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

    const formatearPrecioMinimo = (valor) => {
        if (!valor && valor !== 0) return '';
        
        const numero = parseFloat(valor);
        
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numero);
    };

    const handleLoteSeleccionado = (e) => {
        const loteId = e.target.value;
        const lote = lotes.find(l => l.id === loteId);
        setLoteSeleccionado(lote);
        setFormData(prev => ({
            ...prev,
            loteId,
            cantidad: lote ? lote.cantidad.toString() : '',
            precioFinal: lote ? formatearPrecioMinimo(lote.precioUnidad) : ''
        }));
    };

    const calcularPrecioFinal = (precioBase, ganancia, iva) => {
        const precioConGanancia = precioBase * (1 + (ganancia / 100));
        const precioFinal = precioConGanancia * (1 + (iva / 100));
        return formatearPrecioMinimo(precioFinal);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev };
            newData[name] = value;

            if (loteSeleccionado && (name === 'ganancia' || name === 'iva')) {
                const ganancia = parseFloat(newData.ganancia) || 0;
                const iva = parseFloat(newData.iva) || 0;
                newData.precioFinal = calcularPrecioFinal(
                    loteSeleccionado.precioUnidad,
                    ganancia,
                    iva
                );
            }

            // Validar que la cantidad no exceda el stock disponible
            if (name === 'cantidad') {
                const cantidad = parseInt(value) || 0;
                if (cantidad > loteSeleccionado?.cantidad) {
                    newData.cantidad = loteSeleccionado.cantidad.toString();
                }
            }

            return newData;
        });
    };

    const handleNuevaCategoria = async () => {
        if (!nuevaCategoria.trim()) return;

        const usuario = auth.currentUser;
        if (!usuario) return;

        const resultado = await ProductoService.agregarCategoria(usuario.uid, nuevaCategoria.trim());
        if (resultado.exito) {
            setCategorias(resultado.datos);
            setFormData(prev => ({ ...prev, categoria: nuevaCategoria.trim() }));
            setNuevaCategoria('');
        }
    };

    return (
        <div className="h-full bg-white/30 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="p-4 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-3">Agregar Nuevo Producto</h2>
                
                <div className="flex-1 overflow-y-auto">
                    <div className="mb-4 bg-white/40 p-3 rounded-lg">
                        <h3 className="text-md font-semibold mb-2">Información del Lote</h3>
                        <div className="space-y-3">
                            <select 
                                name="loteId"
                                value={formData.loteId}
                                onChange={handleLoteSeleccionado}
                                className="w-full p-1.5 border rounded text-sm"
                            >
                                <option value="">Seleccionar Lote</option>
                                {lotes.map(lote => (
                                    <option key={lote.id} value={lote.id}>
                                        {lote.nombreProducto} - Stock: {lote.cantidad}
                                    </option>
                                ))}
                            </select>

                            <input 
                                type="number"
                                name="cantidad"
                                value={formData.cantidad}
                                onChange={handleInputChange}
                                placeholder="Cantidad"
                                max={loteSeleccionado?.cantidad || 0}
                                className="w-full p-1.5 border rounded text-sm"
                            />

                            <input 
                                type="number"
                                name="ganancia"
                                value={formData.ganancia}
                                onChange={handleInputChange}
                                placeholder="% Ganancia"
                                className="w-full p-1.5 border rounded text-sm"
                            />

                            <select
                                name="iva"
                                value={formData.iva}
                                onChange={handleInputChange}
                                className="w-full p-1.5 border rounded text-sm"
                            >
                                <option value="0">IVA 0%</option>
                                <option value="19">IVA 19%</option>
                            </select>

                            <input 
                                type="text"
                                value={formData.precioFinal}
                                placeholder="Precio Final"
                                className="w-full p-1.5 border rounded text-sm bg-gray-100"
                                disabled
                            />
                        </div>
                    </div>

                    <div className="bg-white/40 p-3 rounded-lg">
                        <h3 className="text-md font-semibold mb-2">Detalles del Producto</h3>
                        <div className="space-y-3">
                            <input 
                                type="file"
                                className="w-full p-1.5 border rounded text-sm"
                                accept="image/*"
                            />
                            
                            <div className="flex gap-2">
                                <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleInputChange}
                                    className="flex-1 p-1.5 border rounded text-sm"
                                >
                                    <option value="">Seleccionar Categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        value={nuevaCategoria}
                                        onChange={(e) => setNuevaCategoria(e.target.value)}
                                        placeholder="Nueva categoría"
                                        className="p-1.5 border rounded text-sm"
                                    />
                                    <button
                                        onClick={handleNuevaCategoria}
                                        className="px-3 bg-orange-500 text-white rounded hover:bg-orange-600"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgregarProducto;
