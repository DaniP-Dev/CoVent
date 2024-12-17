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
    static agregarProducto(producto, cantidad = 1) {
        if (!ValidadorCarrito.validarProducto(producto)) {
            return {
                exito: false,
                mensaje: "Producto no válido"
            };
        }

        let carrito = AlmacenCarrito.obtener();
        let i = 0;
        let productoExistente = null;
        
        while (i < carrito.length && !productoExistente) {
            if (carrito[i].id === producto.id) {
                productoExistente = carrito[i];
            }
            i = i + 1;
        }

        if (productoExistente) {
            if (!ValidadorCarrito.validarCantidad(productoExistente.cantidad, cantidad)) {
                return {
                    exito: false,
                    mensaje: "No puedes agregar más de 10 unidades del mismo producto"
                };
            }
            productoExistente.cantidad = productoExistente.cantidad + cantidad;
        } else {
            let nuevoProducto = {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: cantidad
            };
            carrito.push(nuevoProducto);
        }

        AlmacenCarrito.guardar(carrito);
        return {
            exito: true,
            mensaje: "Producto agregado al carrito",
            carrito: carrito
        };
    }

    static obtenerCarrito() {
        return AlmacenCarrito.obtener();
    }

    static calcularTotales(productos) {
        return CalculadoraCarrito.calcularTotales(productos);
    }

    static limpiarCarrito() {
        AlmacenCarrito.limpiar();
        return {
            exito: true,
            mensaje: "Carrito limpiado exitosamente"
        };
    }
}

export default CarritoService;
