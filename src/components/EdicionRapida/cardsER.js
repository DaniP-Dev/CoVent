import React from 'react';

const CardER = ({ producto, onEditar, onEliminar }) => {
    // Extraer los detalles del producto
    const detalles = producto.details || producto;

    return (
        <div className="border rounded-lg p-4 bg-white/50 backdrop-blur-sm hover:shadow-md transition-all">
            <h3 className="font-medium text-xl mb-2 truncate">
                {detalles.nombre || 'Sin nombre'}
            </h3>
            <div className="flex justify-between items-center mb-2">
                <span className="text-orange-500 font-semibold">
                    ${(detalles.precio || 0).toLocaleString('es-CO')}
                </span>
                <span className="text-gray-600">
                    Stock: {detalles.stock || 0}
                </span>
            </div>
            <p className="text-gray-600 text-base line-clamp-2 mb-2">
                {detalles.descripcion || 'Sin descripción'}
            </p>
            <div className="text-sm text-gray-500 mb-3">
                Categoría: {detalles.categoria || 'Sin categoría'}
            </div>
            <div className="flex justify-center space-x-1 mt-4">
                <button 
                    onClick={() => onEditar(producto)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                    Editar
                </button>
                <button 
                    onClick={() => onEliminar(producto.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
};

export default CardER;
