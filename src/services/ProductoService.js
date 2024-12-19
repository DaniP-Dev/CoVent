'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, doc, addDoc, updateDoc, getDocs, deleteDoc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth } from '@/config/firebase/firebaseConfig';
import TiendaService from './TiendaService';

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

    static async obtenerCategorias(tiendaId) {
        try {
            const productosRef = collection(db, 'tiendas', tiendaId, 'productos');
            const snapshot = await getDocs(productosRef);
            
            // Obtener categorías únicas
            const categorias = new Set();
            snapshot.docs.forEach(doc => {
                const producto = doc.data();
                if (producto.categoria) {
                    categorias.add(producto.categoria);
                }
            });

            return {
                exito: true,
                datos: ['General', ...Array.from(categorias)]
            };
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return {
                exito: false,
                mensaje: 'Error al obtener las categorías',
                error: error.message
            };
        }
    }

    static async agregarCategoria(tiendaId, categoria) {
        // Esta función podría implementarse si necesitas guardar las categorías en un documento separado
        return {
            exito: true,
            datos: ['General', categoria]
        };
    }

    static async obtenerProductos(identificador, tipo = 'uid') {
        try {
            let tiendaId = identificador;
            
            // Si el identificador es un slug, obtener el uid correspondiente
            if (tipo === 'slug') {
                tiendaId = await this.obtenerTiendaIdPorSlug(identificador);
            }

            const productosRef = collection(db, 'tiendas', tiendaId, 'productos');
            const snapshot = await getDocs(productosRef);
            
            const productos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                exito: true,
                datos: productos
            };
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return {
                exito: false,
                mensaje: 'Error al obtener los productos',
                error: error.message
            };
        }
    }

    static async eliminarProducto(tiendaId, productoId) {
        // Verificar que sea una operación administrativa válida
        if (!auth.currentUser || auth.currentUser.uid !== tiendaId) {
            return {
                exito: false,
                mensaje: 'No autorizado para realizar esta operación'
            };
        }

        try {
            const productoRef = doc(db, 'tiendas', tiendaId, 'productos', productoId);
            await deleteDoc(productoRef);

            return {
                exito: true,
                mensaje: 'Producto eliminado correctamente'
            };
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            return {
                exito: false,
                mensaje: 'Error al eliminar el producto',
                error: error.message
            };
        }
    }

    static async obtenerTiendaIdPorSlug(slug) {
        try {
            const resultado = await TiendaService.obtenerTiendaPorSlug(slug);
            if (!resultado.exito) {
                throw new Error(resultado.mensaje);
            }
            return resultado.datos.id;
        } catch (error) {
            console.error('Error al obtener ID de tienda:', error);
            throw error;
        }
    }

    static observarCategorias(tiendaId, callback) {
        try {
            const productosRef = collection(db, 'tiendas', tiendaId, 'productos');
            
            // Crear snapshot para observar cambios en productos
            const unsubscribe = onSnapshot(productosRef, (snapshot) => {
                const categoriasUnicas = new Set(['General']); // Incluir categoría por defecto
                
                snapshot.docs.forEach(doc => {
                    const categoria = doc.data().details?.categoria;
                    if (categoria) {
                        categoriasUnicas.add(categoria);
                    }
                });

                // Convertir Set a Array y ordenar alfabéticamente
                const categorias = Array.from(categoriasUnicas).sort();
                callback(categorias);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error al observar categorías:', error);
            callback(['General']); // Devolver al menos la categoría por defecto en caso de error
            return () => {}; // Devolver función vacía como cleanup
        }
    }

    static observarProductos(tiendaId, callback) {
        try {
            const productosRef = collection(db, 'tiendas', tiendaId, 'productos');
            
            const unsubscribe = onSnapshot(productosRef, (snapshot) => {
                const productos = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(productos);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error al observar productos:', error);
            callback([]);
            return () => {};
        }
    }
}

export default ProductoService;
