"use client";
import React from 'react';

const AgregarProducto = () => {
    return (
        <div className="h-full bg-white/30 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="p-4 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-3">Agregar Nuevo Producto</h2>
                
                <div className="flex-1 overflow-y-auto">
                    <div className="mb-4 bg-white/40 p-3 rounded-lg">
                        <h3 className="text-md font-semibold mb-2">Información del Lote</h3>
                        <div className="space-y-3">
                            <select className="w-full p-1.5 border rounded text-sm">
                                <option>Seleccionar Lote</option>
                            </select>
                            <input type="number" placeholder="Cantidad" className="w-full p-1.5 border rounded text-sm" />
                            <select className="w-full p-1.5 border rounded text-sm">
                                <option value="0">IVA 0%</option>
                                <option value="19">IVA 19%</option>
                            </select>
                            <input type="number" placeholder="% Ganancia" className="w-full p-1.5 border rounded text-sm" />
                            <input type="number" placeholder="Precio Final" className="w-full p-1.5 border rounded text-sm" disabled />
                        </div>
                    </div>

                    <div className="bg-white/40 p-3 rounded-lg">
                        <h3 className="text-md font-semibold mb-2">Detalles del Producto</h3>
                        <div className="space-y-3">
                            <input type="file" className="w-full p-1.5 border rounded text-sm" accept="image/*" />
                            <select className="w-full p-1.5 border rounded text-sm">
                                <option>Seleccionar Categoría</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgregarProducto;
