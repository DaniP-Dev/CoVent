import React from 'react';

const CardER = ({ producto, onEditar, onEliminar }) => {
    return (
        <div className="border rounded-lg p-4 bg-white/50 backdrop-blur-sm hover:shadow-md transition-all">
            <h3 className="font-medium text-xl mb-2 truncate">
                {producto.nombre}
            </h3>
            <div className="flex justify-between items-center mb-2">
                <span className="text-orange-500 font-semibold">
                    ${producto.precio?.toLocaleString() || '0'}
                </span>
                <span className="text-gray-600">
                    Stock: {producto.stock || 0}
                </span>
            </div>
            <p className="text-gray-600 text-base line-clamp-2 mb-2">
                {producto.descripcion || 'Sin descripción'}
            </p>
            <div className="text-sm text-gray-500 mb-3">
                Categoría: {producto.categoria || 'Sin categoría'}
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
