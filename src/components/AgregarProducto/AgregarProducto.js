"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '@/config/firebase/firebaseConfig';
import LoteService from '@/services/LoteService';
import ProductoService from '@/services/ProductoService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';

const AgregarProducto = () => {
    const [lotes, setLotes] = useState([]);
    const [categorias, setCategorias] = useState(['General']);
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [formData, setFormData] = useState({
        loteId: '',
        cantidad: '',
        ganancia: '',
        gananciaMonetaria: '',
        iva: '0',
        precioFinal: '',
        categoria: '',
        imagen: null
    });
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [toastFlotante, setToastFlotante] = useState({ visible: false, mensaje: '' });
    const [notificacion, setNotificacion] = useState({ mensaje: '', tipo: '', visible: false });
    const [inputActivo, setInputActivo] = useState(false);
    const [modoNuevaCategoria, setModoNuevaCategoria] = useState(false);
    const router = useRouter();

    // Cargar lotes con snapshot
    useEffect(() => {
        const usuario = auth.currentUser;
        if (!usuario) return;

        const lotesRef = collection(db, 'tiendas', usuario.uid, 'lotes');
        const unsubscribe = onSnapshot(lotesRef, (snapshot) => {
            const lotesActualizados = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(lote => lote.nombreProducto && lote.nombreProducto.toLowerCase() !== 'stock');

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

    // Validar autenticación
    useEffect(() => {
        const usuario = auth.currentUser;
        if (!usuario) {
            router.push('/login'); // O tu ruta de autenticación
            return;
        }
    }, [router]);

    const formatearPrecio = (valor) => {
        if (valor === null || valor === undefined || valor === '') {
            return '';
        }

        let numero = 0;
        if (typeof valor === 'string') {
            // Si es string, limpiar y convertir
            const valorLimpio = valor.replace(/[^\d]/g, '');
            numero = parseFloat(valorLimpio);
        } else {
            numero = valor;
        }

        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
        }).format(numero);
    };

    const parsearPrecio = (valor) => {
        if (!valor) return 0;
        
        // Si es un número, devolverlo directamente
        if (typeof valor === 'number') return valor;
        
        // Si es string, convertir de "53.550,00" a número
        try {
        return parseFloat(valor.replace(/\./g, '').replace(',', '.'));
        } catch (error) {
            console.warn('Error al parsear precio:', error);
            return 0;
        }
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
        
        if (lote) {
            try {
            // Convertir el precio del lote al formato correcto
            const precioBase = parsearPrecio(lote.precioUnidad);
            setFormData(prev => ({
                ...prev,
                loteId,
                cantidad: lote.cantidad.toString(),
                precioFinal: formatearPrecio(precioBase)
            }));
            } catch (error) {
                console.error('Error al procesar el lote seleccionado:', error);
                mostrarNotificacion('Error al procesar el precio del lote', 'error');
            }
        } else {
            setFormData(prev => ({
                ...prev,
                loteId: '',
                cantidad: '',
                precioFinal: ''
            }));
        }
    };

    const calcularPrecioFinal = (precioBase, ganancia, iva) => {
        const precioConGanancia = precioBase * (1 + (ganancia / 100));
        const precioFinal = precioConGanancia * (1 + (iva / 100));
        return formatearPrecioMinimo(precioFinal);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (!loteSeleccionado) return;
        
        setFormData(prev => {
            const newData = { ...prev };
            const precioBase = parsearPrecio(loteSeleccionado.precioUnidad);

            if (name === 'iva') {
                newData.iva = value;
                // Recalcular precio final con el nuevo IVA
                const gananciaMonetaria = parsearPrecio(newData.gananciaMonetaria) || 0;
                const precioConGanancia = precioBase + gananciaMonetaria;
                const iva = parseFloat(value) || 0;
                const precioFinal = precioConGanancia * (1 + iva/100);
                newData.precioFinal = formatearPrecio(precioFinal);
            } 
            else if (name === 'ganancia') {
                // Usuario está escribiendo el porcentaje
                newData.ganancia = value;
                if (value.trim() !== '') {
                    const porcentaje = parseFloat(value) || 0;
                    const montoGanancia = (precioBase * porcentaje) / 100;
                    newData.gananciaMonetaria = formatearPrecio(montoGanancia);
                    
                    // Calcular precio final sumando la ganancia
                    const gananciaDecimal = porcentaje / 100;
                    const iva = parseFloat(newData.iva) || 0;
                    const precioFinal = precioBase + montoGanancia;
                    newData.precioFinal = formatearPrecio(precioFinal * (1 + iva/100));
                }
            } 
            else if (name === 'gananciaMonetaria') {
                // Permitir solo números mientras se escribe
                const soloNumeros = value.replace(/\D/g, '');
                newData.gananciaMonetaria = soloNumeros;
                
                if (soloNumeros.trim() !== '') {
                    const montoGanancia = parseInt(soloNumeros) || 0;
                    const porcentaje = (montoGanancia * 100) / precioBase;
                    newData.ganancia = porcentaje.toFixed(1);
                    
                    // Calcular precio final sumando la ganancia directamente
                    const iva = parseFloat(newData.iva) || 0;
                    const precioFinal = precioBase + montoGanancia;
                    newData.precioFinal = formatearPrecio(precioFinal * (1 + iva/100));
                }
            } 
            else {
                newData[name] = value;
            }

            return newData;
        });
    };

    const handleGananciaMonetariaFocus = () => {
        setInputActivo(true);
        setFormData(prev => ({
            ...prev,
            gananciaMonetaria: prev.gananciaMonetaria.replace(/[^\d]/g, '')
        }));
    };

    const handleGananciaMonetariaBlur = (e) => {
        setInputActivo(false);
        const { value } = e.target;
        if (value) {
            setFormData(prev => ({
                ...prev,
                gananciaMonetaria: formatearPrecio(value)
            }));
        }
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

    // Función para mostrar el toast flotante
    const mostrarToastFlotante = (mensaje) => {
        setToastFlotante({ visible: true, mensaje });
        setTimeout(() => {
            setToastFlotante({ visible: false, mensaje: '' });
        }, 1000);
    };

    // Función para mostrar notificación
    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo, visible: true });
        setTimeout(() => {
            setNotificacion(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Modificar handleSubmit para usar las nuevas notificaciones
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const usuario = auth.currentUser;
            if (!usuario) {
                mostrarNotificacion('No hay usuario autenticado', 'error');
                return;
            }

            // Validar campos requeridos
            if (!formData.loteId || !formData.cantidad || !formData.categoria) {
                mostrarNotificacion('Por favor completa todos los campos requeridos', 'error');
                return;
            }

            // Verificar que la cantidad no exceda el stock del lote
            if (parseInt(formData.cantidad) > loteSeleccionado.cantidad) {
                mostrarNotificacion('La cantidad excede el stock disponible', 'error');
                return;
            }

            // 1. Crear el producto
            const nuevoProducto = {
                nombre: loteSeleccionado.nombreProducto,
                precio: parseFloat(formData.precioFinal.replace(/[^\d.-]/g, '')),
                stock: parseInt(formData.cantidad),
                categoria: formData.categoria,
                imagen: formData.imagen || 'default.jpg',
                descripcion: loteSeleccionado.descripcion || '',
                fechaCreacion: new Date().toISOString()
            };

            const resultadoProducto = await ProductoService.crearProducto(usuario.uid, nuevoProducto);

            if (resultadoProducto.exito) {
                // 2. Actualizar el lote restando la cantidad usada
                const cantidadARestar = -parseInt(formData.cantidad); // Negativo para restar
                const resultadoLote = await LoteService.actualizarCantidadLote(
                    usuario.uid,
                    formData.loteId,
                    cantidadARestar,
                    `Cantidad transferida a producto: ${resultadoProducto.id}`
                );

                if (resultadoLote.exito) {
                    mostrarToastFlotante(`¡Producto "${nuevoProducto.nombre}" creado!`);
                    // Resetear formulario
                    setFormData({
                        loteId: '',
                        cantidad: '',
                        ganancia: '',
                        gananciaMonetaria: '',
                        iva: '0',
                        precioFinal: '',
                        categoria: '',
                        imagen: null
                    });
                    setLoteSeleccionado(null);
                } else {
                    // Si falla la actualización del lote, deberíamos eliminar el producto creado
                    // TODO: Implementar rollback del producto
                    mostrarNotificacion('Error al actualizar el inventario', 'error');
                }
            } else {
                mostrarNotificacion(resultadoProducto.mensaje, 'error');
            }

        } catch (error) {
            mostrarNotificacion(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoriaChange = (e) => {
        const value = e.target.value;
        if (value === 'nueva') {
            setModoNuevaCategoria(true);
            setFormData(prev => ({ ...prev, categoria: '' }));
        } else {
            setFormData(prev => ({ ...prev, categoria: value }));
        }
    };

    return (
        <div className="h-full bg-white/30 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="p-4 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-3">Agregar Nuevo Producto</h2>
                
                {/* Notificación de error/éxito */}
                {notificacion.visible && (
                    <div className={`mb-4 p-3 rounded-md ${
                        notificacion.tipo === 'error' 
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                        {notificacion.mensaje}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
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

                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div>
                                    <input 
                                        type="number"
                                        name="cantidad"
                                        value={formData.cantidad}
                                        onChange={handleInputChange}
                                        placeholder="Cantidad"
                                        max={loteSeleccionado?.cantidad || 0}
                                        className="w-full p-1.5 border rounded text-sm"
                                    />
                                </div>
                                <div className="text-sm text-gray-600">
                                    Existencias disponibles del lote: {loteSeleccionado?.cantidad || 0}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ganancia %
                                    </label>
                                    <input
                                        type="text"
                                        name="ganancia"
                                        value={formData.ganancia}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        className="w-full p-1.5 border rounded text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ganancia $
                                    </label>
                                    <input
                                        type="text"
                                        name="gananciaMonetaria"
                                        value={formData.gananciaMonetaria}
                                        onChange={handleInputChange}
                                        onFocus={handleGananciaMonetariaFocus}
                                        onBlur={handleGananciaMonetariaBlur}
                                        placeholder="$0"
                                        className="w-full p-1.5 border rounded text-sm"
                                    />
                                </div>
                            </div>

                            <select
                                name="iva"
                                value={formData.iva}
                                onChange={handleInputChange}
                                className="w-full p-1.5 border rounded text-sm"
                            >
                                <option value="0">IVA 0%</option>
                                <option value="19">IVA 19%</option>
                            </select>

                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div>
                                    <input 
                                        type="text"
                                        value={formData.precioFinal}
                                        placeholder="Precio Final"
                                        className="w-full p-1.5 border rounded text-sm bg-gray-100"
                                        disabled
                                    />
                                </div>
                                <div className="text-sm text-gray-600">
                                    Precio para la venta
                                </div>
                            </div>
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
                            
                            {!modoNuevaCategoria ? (
                                <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleCategoriaChange}
                                    className="w-full p-1.5 border rounded text-sm"
                                >
                                    <option value="">Seleccionar Categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    <option value="nueva">+ Nueva Categoría</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                                    placeholder="Escribir nueva categoría"
                                    className="w-full p-1.5 border rounded text-sm"
                                />
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-2 rounded text-white ${
                            loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                    >
                        {loading ? 'Creando producto...' : 'Crear Producto'}
                    </button>
                </form>
            </div>

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
        </div>
    );
};

export default AgregarProducto;
