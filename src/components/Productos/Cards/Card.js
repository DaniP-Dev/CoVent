import React from 'react';
import BotonComprar from './BotonComprar/BotonComprar';
import BotonCarrito from './BotonCarrito/BotonCarrito';

const Card = ({ producto, tiendaId }) => {
    // Verificar si el producto viene dentro de details
    const detalles = producto.details || producto;
    
    // Extraer los valores con validación
    const nombre = detalles.nombre || 'Sin nombre';
    const precio = detalles.precio || 0;
    const descripcion = detalles.descripcion || 'Sin descripción';
    const imagen = detalles.imagen || '/placeholder.jpg';
    const stock = detalles.stock || 0;

    const formatearPrecio = (valor) => {
        if (!valor && valor !== 0) return '';
        
        // Convertir a string y asegurar que tenga al menos 3 dígitos
        const valorStr = valor.toString().padStart(3, '0');
        
        // Separar los últimos dos dígitos para decimales
        const enteros = valorStr.slice(0, -2);
        const decimales = valorStr.slice(-2);
        
        // Reconstruir el número con el formato correcto
        const numero = parseFloat(`${enteros}.${decimales}`);
        
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
        }).format(numero).replace('COP', '$');
    };

    return (
        <div className="bg-[#E7BCB8]/10 rounded-lg p-4 h-full flex flex-col 
            border border-[#4C4376]/10 
            hover:border-[#4C4376]/30 
            hover:shadow-lg 
            hover:bg-[#E7BCB8]/20 
            hover:transform hover:-translate-y-1 
            transition-all duration-300 ease-in-out 
            cursor-pointer">
            <img 
                src={imagen} 
                alt={nombre}
                className="w-full h-48 object-cover rounded-md mb-4 
                    hover:opacity-90 transition-opacity duration-300"
            />
            <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-[#443054]">{nombre}</h3>
                <p className="text-[#443054]/70 text-sm mb-2">{descripcion}</p>
                <div className="mt-auto">
                    <p className="text-[#AE445A] font-bold">
                        {formatearPrecio(precio)}
                    </p>
                    <p className="text-sm text-[#443054]/60">
                        Stock: {stock}
                    </p>
                    <div className="flex gap-2 mt-2">
                        <BotonCarrito producto={producto} tiendaId={tiendaId} />
                        <BotonComprar producto={producto} tiendaId={tiendaId} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;