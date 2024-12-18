import React from 'react';
import AgregarProducto from '@/components/AgregarProducto/AgregarProducto';
import EdicionRapida from '@/components/EdicionRapida/EdicionRapida';

const GestorProduct = () => {
    return (
        <div className="h-full w-full p-4 pl-14 z-30">
            <h1 className="text-2xl font-bold mb-4">Gestor de Productos</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-4rem)]">
                <div className="h-full">
                    <AgregarProducto />
                </div>
                <div className="h-full md:col-span-2">
                    <EdicionRapida />
                </div>
            </div>
        </div>
    );
};

export default GestorProduct;
