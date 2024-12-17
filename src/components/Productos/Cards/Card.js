import React from 'react';
import BotonComprar from './BotonComprar/BotonComprar';
import BotonCarrito from './BotonCarrito/BotonCarrito';

const Card = ({ producto }) => {
    const precioFormateado = producto.precio.toLocaleString('es-CO');

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg h-full flex flex-col">
            <img 
                src={producto.imagen} 
                alt={producto.nombre}
                className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h2 className="text-lg font-bold mb-2 line-clamp-1">{producto.nombre}</h2>
            <p className="text-gray-600 mb-2 text-sm flex-1 line-clamp-2">{producto.descripcion}</p>
            <div className="mt-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <p className="text-lg font-bold order-1">${precioFormateado}</p>
                    <div className="flex gap-2 order-2">
                        <BotonCarrito producto={producto} />
                        <BotonComprar />
                    </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <p>Stock: {producto.stock}</p>
                    <p>{producto.categoria}</p>
                </div>
            </div>
        </div>
    );
};

export default Card;