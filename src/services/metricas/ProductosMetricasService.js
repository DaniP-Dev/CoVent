static async obtenerProductosMasVendidos(tiendaId, limite = 5) {
    try {
        if (!tiendaId) {
            throw new Error('tiendaId es requerido');
        }

        console.log('Fetching productos top for:', tiendaId);

        // Datos de prueba consistentes
        const productosPrueba = Array.from({ length: limite }, (_, i) => ({
            id: `prod-${i + 1}`,
            nombre: `Producto ${i + 1}`,
            cantidadTotal: 100 - (i * 15),
            ventasTotal: 1000000 - (i * 150000),
            ultimaVenta: new Date().toISOString()
        }));

        return {
            exito: true,
            datos: productosPrueba
        };
    } catch (error) {
        console.error('Error in obtenerProductosMasVendidos:', error);
        return {
            exito: false,
            mensaje: "Error al obtener productos más vendidos",
            error: error.message
        };
    }
} 