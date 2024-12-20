"use client";
import React, { useState, useEffect } from 'react';
import { auth, db } from '@/config/firebase/firebaseConfig';
import { collection, onSnapshot, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import ProductoService from '@/services/ProductoService';
import LoteService from '@/services/LoteService';
import CardER from './cardsER';

const EdicionRapida = () => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [loading, setLoading] = useState(true);
    const productosPorPagina = 8;

    useEffect(() => {
        const usuario = auth.currentUser;
        if (!usuario) return;

        const productosRef = collection(db, 'tiendas', usuario.uid, 'productos');
        
        // Usar onSnapshot para actualizaciones en tiempo real
        const unsubscribe = onSnapshot(productosRef, (snapshot) => {
            const productosData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProductos(productosData);
            setLoading(false);
        }, (error) => {
            console.error("Error al observar productos:", error);
            setLoading(false);
        });

        // Limpiar el snapshot al desmontar
        return () => unsubscribe();
    }, []);

    const handleEditar = (producto) => {
        console.log("Editar producto:", producto);
    };

    const handleEliminar = async (productoId) => {
        if (window.confirm("¿Estás seguro de eliminar este producto?")) {
            const usuario = auth.currentUser;
            if (!usuario) return;

            try {
                // Primero obtenemos el producto para saber su cantidad
                const productoRef = doc(db, 'tiendas', usuario.uid, 'productos', productoId);
                const productoDoc = await getDoc(productoRef);
                const cantidadProducto = productoDoc.data().details.stock || 0;

                // Buscamos el lote correspondiente
                const lotesRef = collection(db, 'tiendas', usuario.uid, 'lotes');
                const q = query(lotesRef, where('nombreProducto', '==', productoDoc.data().details.nombre));
                const lotesSnapshot = await getDocs(q);

                if (!lotesSnapshot.empty) {
                    const loteDoc = lotesSnapshot.docs[0];
                    
                    // Actualizamos el lote con la cantidad del producto eliminado
                    await LoteService.actualizarCantidadLote(
                        usuario.uid,
                        loteDoc.id,
                        cantidadProducto, // cantidad a incrementar
                        "RETORNO PUNTO VENTAS"
                    );
                }

                // Finalmente eliminamos el producto
                await ProductoService.eliminarProducto(usuario.uid, productoId);

            } catch (error) {
                console.error("Error al eliminar producto y actualizar lote:", error);
            }
        }
    };

    const productosFiltrados = productos.filter(producto => {
        const detalles = producto.details || producto;
        const nombre = detalles.nombre || '';
        const categoria = detalles.categoria || '';
        const busquedaMinuscula = busqueda.toLowerCase();
        
        return nombre.toLowerCase().includes(busquedaMinuscula) ||
               categoria.toLowerCase().includes(busquedaMinuscula);
    });

    const indexUltimoProducto = paginaActual * productosPorPagina;
    const indexPrimerProducto = indexUltimoProducto - productosPorPagina;
    const productosActuales = productosFiltrados.slice(indexPrimerProducto, indexUltimoProducto);
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

    return (
        <div className="h-full bg-[#E7BCB8]/30 backdrop-blur-sm rounded-lg
            shadow-[0_4px_20px_rgba(76,67,118,0.25)]
            hover:shadow-[0_8px_25px_rgba(76,67,118,0.35)]
            transition-shadow duration-300">
            <div className="p-4 flex flex-col h-full">
                <div className="mb-2">
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full px-3 py-2 border border-[#4C4376]/20 rounded-md focus:ring-2 focus:ring-[#4C4376]/30 focus:border-[#4C4376]"
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4C4376]"></div>
                            <span className="ml-2 text-[#443054]/70">Cargando productos...</span>
                        </div>
                    ) : productosActuales.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {productosActuales.map(producto => (
                                <CardER
                                    key={producto.id}
                                    producto={producto}
                                    onEditar={handleEditar}
                                    onEliminar={handleEliminar}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-[#443054]/70">No se encontraron productos</div>
                    )}
                </div>

                {totalPaginas > 1 && (
                    <div className="mt-2 flex justify-center space-x-2">
                        <button 
                            onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                            disabled={paginaActual === 1}
                            className="px-4 py-2 border border-[#4C4376]/20 rounded-md disabled:opacity-50 hover:bg-[#E7BCB8]/20 text-[#443054]"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 text-[#443054]">
                            Página {paginaActual} de {totalPaginas}
                        </span>
                        <button 
                            onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                            disabled={paginaActual === totalPaginas}
                            className="px-4 py-2 border border-[#4C4376]/20 rounded-md disabled:opacity-50 hover:bg-[#E7BCB8]/20 text-[#443054]"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EdicionRapida;