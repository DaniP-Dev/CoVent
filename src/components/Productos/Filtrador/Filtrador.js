"use client";
import React, { useState, useEffect } from 'react';
import Card from '../Cards/Card';
import datos from '../datos.json';
import { useParams } from 'next/navigation';
import ProductoService from '@/services/ProductoService';

const Filtrador = () => {
    const params = useParams(); // Obtener el slug de la URL
    const [productos, setProductos] = useState([]);
    
    useEffect(() => {
        const cargarProductos = async () => {
            const resultado = await ProductoService.obtenerProductos(params.slug, 'slug');
            if (resultado.exito) {
                setProductos(resultado.datos);
            }
        };
        
        cargarProductos();
    }, [params.slug]);

    // Estados para manejar la búsqueda y la paginación
    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [precioMinimo, setPrecioMinimo] = useState('');
    const [precioMaximo, setPrecioMaximo] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    
    // Constantes para la paginación
    const PRODUCTOS_POR_PAGINA = 10;

    // Sacar todas las categorías únicas del JSON
    const CATEGORIAS = [...new Set(datos.map(producto => producto.categoria))];

    // Filtrar productos
    const productosFiltrados = productos.filter(producto => {
        // Filtro por texto de búsqueda
        let pasaTexto = true;
        if (textoBusqueda !== '') {
            pasaTexto = producto.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
        }

        // Filtro por categoría
        let pasaCategoria = true;
        if (categoriaSeleccionada !== '') {
            pasaCategoria = producto.categoria === categoriaSeleccionada;
        }

        // Filtro por precio mínimo
        let pasaPrecioMin = true;
        if (precioMinimo !== '') {
            pasaPrecioMin = producto.precio >= Number(precioMinimo);
        }

        // Filtro por precio máximo
        let pasaPrecioMax = true;
        if (precioMaximo !== '') {
            pasaPrecioMax = producto.precio <= Number(precioMaximo);
        }

        return pasaTexto && pasaCategoria && pasaPrecioMin && pasaPrecioMax;
    });

    // Calcular productos para la página actual
    const indiceInicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const indiceFin = indiceInicio + PRODUCTOS_POR_PAGINA;
    const productosActuales = productosFiltrados.slice(indiceInicio, indiceFin);

    // Función para cerrar filtros
    const cerrarFiltros = (evento) => {
        let elementoActual = evento.target;
        let estaEnFiltros = false;
        
        while (elementoActual != null) {
            if (elementoActual.id === 'filtros-movil') {
                estaEnFiltros = true;
                break;
            }
            elementoActual = elementoActual.parentElement;
        }
        
        if (estaEnFiltros === false) {
            setMostrarFiltros(false);
        }
    };

    // Cerrar al hacer scroll
    useEffect(() => {
        const cerrarAlScroll = () => {
            if (mostrarFiltros === true) {
                setMostrarFiltros(false);
            }
        };

        // Agregar listeners
        document.addEventListener('click', cerrarFiltros);
        window.addEventListener('scroll', cerrarAlScroll);

        // Limpiar listeners
        return () => {
            document.removeEventListener('click', cerrarFiltros);
            window.removeEventListener('scroll', cerrarAlScroll);
        };
    }, [mostrarFiltros]);

    // Función simple para manejar scroll
    const manejarScroll = (evento) => {
        let scrollArriba = false;
        
        // Detectar dirección del scroll de manera simple
        if (evento.deltaY < 0) {
            scrollArriba = true;
        }

        // Si es scroll hacia arriba, ir al inicio
        if (scrollArriba === true) {
            // Usar scroll simple
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-orange-500">
            {/* Barra de filtros */}
            <div className="border-b w-full">
                {/* Vista móvil */}
                <div className="md:hidden p-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMostrarFiltros(!mostrarFiltros);
                        }}
                        className="w-full p-2 bg-white rounded-md text-sm flex items-center justify-between"
                    >
                        <span>Filtros y Búsqueda</span>
                        <span>{mostrarFiltros ? '▽' : '▷'}</span>
                    </button>

                    {mostrarFiltros && (
                        <div id="filtros-movil" className="mt-2 space-y-2">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={textoBusqueda}
                                onChange={(e) => setTextoBusqueda(e.target.value)}
                                className="w-full p-2 border rounded-md text-sm"
                            />
                            <select
                                value={categoriaSeleccionada}
                                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                                className="w-full p-2 border rounded-md text-sm"
                            >
                                <option value="">Categorías</option>
                                {CATEGORIAS.map((categoria) => (
                                    <option key={categoria} value={categoria}>
                                        {categoria}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Precio min"
                                    value={precioMinimo}
                                    onChange={(e) => setPrecioMinimo(e.target.value)}
                                    className="w-1/2 p-2 border rounded-md text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Precio max"
                                    value={precioMaximo}
                                    onChange={(e) => setPrecioMaximo(e.target.value)}
                                    className="w-1/2 p-2 border rounded-md text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Vista desktop */}
                <div className="hidden md:block p-4">
                    <div className="grid grid-cols-4 gap-4 max-w-6xl mx-auto">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={textoBusqueda}
                            onChange={(e) => setTextoBusqueda(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                        <select
                            value={categoriaSeleccionada}
                            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Todas las categorías</option>
                            {CATEGORIAS.map((categoria) => (
                                <option key={categoria} value={categoria}>
                                    {categoria}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Precio mínimo"
                            value={precioMinimo}
                            onChange={(e) => setPrecioMinimo(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                        <input
                            type="number"
                            placeholder="Precio máximo"
                            value={precioMaximo}
                            onChange={(e) => setPrecioMaximo(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>
            </div>

            {/* Contenedor principal con scroll */}
            <div 
                className="flex-1 overflow-y-auto"
                onWheel={manejarScroll}
            >
                {/* Contenedor de productos con padding para el footer */}
                <div className="p-4 pb-20">
                    {/* Grid de productos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {productosActuales.map(producto => (
                            <div key={producto.id} className="h-full">
                                <Card producto={producto} />
                            </div>
                        ))}
                    </div>

                    {productosActuales.length === 0 && (
                        <div className="text-center text-white p-4">
                            No se encontraron productos
                        </div>
                    )}
                </div>
            </div>

            {/* Footer de paginación */}
            <div className="flex-none fixed bottom-0 left-0 right-0 bg-orange-500 border-t shadow-lg">
                <div className="flex justify-center items-center p-4 gap-4">
                    <button
                        onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                        disabled={paginaActual === 1}
                        className="px-4 py-2 bg-white rounded-md disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="text-white">
                        Página {paginaActual} de {Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA)}
                    </span>
                    <button
                        onClick={() => setPaginaActual(prev => Math.min(Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA), prev + 1))}
                        disabled={paginaActual >= Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA)}
                        className="px-4 py-2 bg-white rounded-md disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Filtrador;