import React from 'react';
import BotonComprar from './BotonComprar/BotonComprar';
import BotonCarrito from './BotonCarrito/BotonCarrito';

const Card = ({ producto }) => {
    // Verificar si el producto viene dentro de details
    const detalles = producto.details || producto;
    
    // Extraer los valores con validación
    const nombre = detalles.nombre || 'Sin nombre';
    const precio = detalles.precio || 0;
    const descripcion = detalles.descripcion || 'Sin descripción';
    const imagen = detalles.imagen || '/placeholder.jpg';
    const stock = detalles.stock || 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
            <img 
                src={imagen} 
                alt={nombre}
                className="w-full h-48 object-cover rounded-md mb-4"
            />
            <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{nombre}</h3>
                <p className="text-gray-600 text-sm mb-2">{descripcion}</p>
                <div className="mt-auto">
                    <p className="text-orange-500 font-bold">
                        ${precio.toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm text-gray-500">
                        Stock: {stock}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Card;