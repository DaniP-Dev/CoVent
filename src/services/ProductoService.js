import { db } from '@/config/firebase/firebaseConfig';
import { collection, doc, addDoc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';

// Clase base para validación de productos
class ValidadorProducto {
    static validarCampoTexto(texto, longitudMinima) {
        return texto && texto.length >= longitudMinima;
    }

    static validarCampoNumerico(numero, valorMinimo) {
        return numero !== undefined && numero >= valorMinimo;
    }
}

// Clase para manejo de errores
class ManejadorErroresProducto {
    static obtenerMensajeError(campo) {
        const mensajes = {
            nombre: "El nombre debe tener al menos 3 caracteres",
            precio: "El precio debe ser mayor a 0", 
            stock: "El stock no puede ser negativo"
        };
        return mensajes[campo];
    }
}

// Clase para manejo del stock
class ManejadorStock {
    static calcularDisponibilidad(stockActual, cantidadSolicitada) {
        const hayStockSuficiente = stockActual >= cantidadSolicitada;
        
        if (hayStockSuficiente) {
            return {
                hayStock: true,
                stockRestante: stockActual - cantidadSolicitada
            };
        }
        
        return {
            hayStock: false,
            stockFaltante: cantidadSolicitada - stockActual
        };
    }
}

// Clase principal del servicio
class ProductoService {
    static validarProducto(producto) {
        let errores = [];
        let validaciones = [
            {campo: 'nombre', valor: producto.nombre, longitudMinima: 3, tipo: 'texto'},
            {campo: 'precio', valor: producto.precio, valorMinimo: 0, tipo: 'numero'},
            {campo: 'stock', valor: producto.stock, valorMinimo: 0, tipo: 'numero'}
        ];
        
        for (let validacion of validaciones) {
            let esValido = false;
            
            if (validacion.tipo === 'texto') {
                esValido = ValidadorProducto.validarCampoTexto(validacion.valor, validacion.longitudMinima);
            } else if (validacion.tipo === 'numero') {
                esValido = ValidadorProducto.validarCampoNumerico(validacion.valor, validacion.valorMinimo);
            }
            
            if (!esValido) {
                errores.push(ManejadorErroresProducto.obtenerMensajeError(validacion.campo));
            }
        }
        
        return {
            esValido: errores.length === 0,
            errores: errores
        };
    }

    static async crearProducto(tiendaId, datosProducto) {
        const validacion = this.validarProducto(datosProducto);
        
        if (!validacion.esValido) {
            let mensajeError = "";
            for (let i = 0; i < validacion.errores.length; i++) {
                if (i > 0) mensajeError += ", ";
                mensajeError += validacion.errores[i];
            }
            return {
                exito: false,
                mensaje: `Datos inválidos: ${mensajeError}`
            };
        }

        try {
            const productosRef = collection(db, 'tiendas', tiendaId, 'productos');
            const fechaActual = new Date();
            const nuevoProducto = {
                details: {
                    nombre: datosProducto.nombre,
                    precio: datosProducto.precio,
                    stock: datosProducto.stock,
                    categoria: datosProducto.categoria || 'Sin categoría',
                    descripcion: datosProducto.descripcion || '',
                    imagen: datosProducto.imagen || 'default.jpg',
                    fechaCreacion: fechaActual.toISOString()
                }
            };

            const docRef = await addDoc(productosRef, nuevoProducto);
            return {
                exito: true,
                mensaje: "Producto creado exitosamente",
                id: docRef.id,
                datos: nuevoProducto
            };
            
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al crear el producto",
                error: error.message
            };
        }
    }

    static verificarStock(stockActual, cantidadSolicitada) {
        return ManejadorStock.calcularDisponibilidad(stockActual, cantidadSolicitada);
    }

    static async actualizarStock(tiendaId, productoId, cantidad) {
        try {
            const productoRef = doc(db, 'tiendas', tiendaId, 'productos', productoId);
            await updateDoc(productoRef, {
                'details.stock': cantidad
            });
            
            return {
                exito: true,
                mensaje: "Stock actualizado correctamente"
            };
            
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al actualizar el stock",
                error: error.message
            };
        }
    }
}

export default ProductoService;
