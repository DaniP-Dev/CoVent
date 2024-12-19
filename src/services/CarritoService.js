'use client';
// Clase base para validación de carrito
class ValidadorCarrito {
    static validarProducto(producto) {
        let esValido = true;
        
        if (!producto) {
            esValido = false;
        } else if (!producto.id) {
            esValido = false;
        } else if (!producto.nombre) {
            esValido = false;
        } else if (!producto.precio || producto.precio <= 0) {
            esValido = false;
        }
        
        return esValido;
    }

    static validarCantidad(cantidadActual, cantidadNueva) {
        let cantidadTotal = cantidadActual + cantidadNueva;
        return cantidadTotal <= 10;
    }
}

// Clase para persistencia de datos
class AlmacenCarrito {
    static guardar(productos) {
        try {
            localStorage.setItem('carrito', JSON.stringify(productos));
            return true;
        } catch (error) {
            console.error("Error al guardar el carrito:", error);
            return false;
        }
    }

    static obtener() {
        let carrito = [];
        let carritoGuardado = localStorage.getItem('carrito');
        
        if (carritoGuardado) {
            try {
                carrito = JSON.parse(carritoGuardado);
            } catch (error) {
                console.error("Error al parsear el carrito:", error);
            }
        }
        
        return carrito;
    }

    static limpiar() {
        localStorage.removeItem('carrito');
    }
}

// Clase para cálculos matemáticos
class CalculadoraCarrito {
    static calcularTotales(productos) {
        let i = 0;
        let cantidadTotal = 0;
        let sumaTotal = 0;
        
        while (i < productos.length) {
            let producto = productos[i];
            if (producto.cantidad > 0 && producto.precio > 0) {
                cantidadTotal = cantidadTotal + producto.cantidad;
                sumaTotal = sumaTotal + (producto.precio * producto.cantidad);
            }
            i = i + 1;
        }
        
        return {
            cantidad: cantidadTotal,
            suma: sumaTotal
        };
    }
}

// Clase principal del servicio
class CarritoService {
    static STORAGE_KEY = 'carrito';

    static agregarProducto(producto) {
        try {
            // Obtener carrito actual
            const carritoActual = this.obtenerCarrito();
            
            // Buscar si el producto ya existe
            const index = carritoActual.findIndex(item => item.id === producto.id);
            
            if (index >= 0) {
                // Si existe, actualizar cantidad (máximo 10)
                if (carritoActual[index].cantidad < 10) {
                    carritoActual[index].cantidad += 1;
                }
            } else {
                // Si no existe, agregar nuevo producto
                carritoActual.push({
                    id: producto.id,
                    nombre: producto.details?.nombre || producto.nombre,
                    precio: producto.details?.precio || producto.precio,
                    imagen: producto.details?.imagen || producto.imagen,
                    cantidad: 1
                });
            }

            // Guardar en localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(carritoActual));

            return {
                exito: true,
                mensaje: 'Producto agregado al carrito'
            };
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            return {
                exito: false,
                mensaje: 'Error al agregar al carrito'
            };
        }
    }

    static obtenerCarrito() {
        try {
            const carrito = localStorage.getItem(this.STORAGE_KEY);
            return carrito ? JSON.parse(carrito) : [];
        } catch (error) {
            console.error('Error al obtener carrito:', error);
            return [];
        }
    }

    static calcularTotales(productos) {
        return productos.reduce((acc, item) => ({
            suma: acc.suma + (item.precio * item.cantidad),
            cantidad: acc.cantidad + item.cantidad
        }), { suma: 0, cantidad: 0 });
    }

    static limpiarCarrito() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

export default CarritoService;
