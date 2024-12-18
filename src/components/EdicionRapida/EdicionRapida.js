"use client";
import React from 'react';

const EdicionRapida = () => {
    return (
        <div className="h-full bg-white shadow-lg rounded-lg">
            <div className="p-4 flex flex-col h-full">
                {/* Barra de búsqueda */}
                <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                {/* Grid de productos */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Ejemplo de una tarjeta de producto */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-medium text-xl mb-2 truncate">
                                Nombre del Producto
                            </h3>
                            <p className="text-gray-600 text-base line-clamp-2">
                                Descripción del producto
                            </p>
                            <div className="flex justify-center space-x-1 mt-4">
                                <button className="bg-blue-500 text-white px-3 py-1 rounded">
                                    Editar
                                </button>
                                <button className="bg-red-500 text-white px-3 py-1 rounded">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Paginación */}
                <div className="mt-2 flex justify-center space-x-2">
                    <button className="px-4 py-2 border rounded-md disabled:opacity-50">
                        Anterior
                    </button>
                    <span className="px-4 py-2">
                        Página 1 de 1
                    </span>
                    <button className="px-4 py-2 border rounded-md disabled:opacity-50">
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EdicionRapida;