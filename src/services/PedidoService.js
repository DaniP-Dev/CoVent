import { db } from '@/config/firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

// Clase base para validación de pedidos
class ValidadorPedido {
    static validarCliente(cliente) {
        return cliente !== undefined && cliente !== null;
    }

    static validarProductos(productos) {
        return productos && Array.isArray(productos) && productos.length > 0;
    }

    static validarTotal(total) {
        return total > 0;
    }
}

// Clase para cálculos matemáticos
class CalculadoraPedido {
    static sumarTotales(productos) {
        let sumaPrecio = 0;
        let sumaCantidad = 0;
        let i = 0;
        
        while (i < productos.length) {
            const producto = productos[i];
            if (producto.precio > 0 && producto.cantidad > 0) {
                sumaPrecio = sumaPrecio + (producto.precio * producto.cantidad);
                sumaCantidad = sumaCantidad + producto.cantidad;
            }
            i = i + 1;
        }
        
        return {
            total: sumaPrecio,
            cantidadProductos: sumaCantidad
        };
    }
}

// Clase para manejo de estados
class ManejadorEstados {
    static estados = {
        PENDIENTE: 'pendiente',
        PREPARANDO: 'preparando', 
        ENVIADO: 'enviado',
        ENTREGADO: 'entregado',
        CANCELADO: 'cancelado'
    };

    static esEstadoValido(estado) {
        let estadosValidos = Object.values(this.estados);
        let i = 0;
        let encontrado = false;
        
        while (i < estadosValidos.length && !encontrado) {
            if (estadosValidos[i] === estado) {
                encontrado = true;
            }
            i = i + 1;
        }
        
        return encontrado;
    }
}

// Clase principal del servicio
class PedidoService {
    static validarPedido(datosPedido) {
        let errores = [];
        
        if (!ValidadorPedido.validarCliente(datosPedido.cliente)) {
            errores.push("Se requieren datos del cliente");
        }
        
        if (!ValidadorPedido.validarProductos(datosPedido.productos)) {
            errores.push("El pedido debe tener al menos un producto");
        }
        
        const totales = CalculadoraPedido.sumarTotales(datosPedido.productos);
        if (!ValidadorPedido.validarTotal(totales.total)) {
            errores.push("El total del pedido debe ser mayor a 0");
        }
        
        return {
            esValido: errores.length === 0,
            errores: errores,
            totales: totales
        };
    }

    static async crearPedido(tiendaId, datosPedido) {
        const validacion = this.validarPedido(datosPedido);
        
        if (!validacion.esValido) {
            let mensajeError = "";
            let i = 0;
            
            while (i < validacion.errores.length) {
                if (i > 0) {
                    mensajeError = mensajeError + ", ";
                }
                mensajeError = mensajeError + validacion.errores[i];
                i = i + 1;
            }
            
            return {
                exito: false,
                mensaje: `Pedido inválido: ${mensajeError}`
            };
        }

        try {
            const pedidosRef = collection(db, 'tiendas', tiendaId, 'pedidos');
            const fechaActual = new Date();
            const nuevoPedido = {
                cliente: datosPedido.cliente,
                productos: datosPedido.productos,
                total: validacion.totales.total,
                cantidadProductos: validacion.totales.cantidadProductos,
                estado: ManejadorEstados.estados.PENDIENTE,
                fecha: fechaActual.toISOString()
            };

            const docRef = await addDoc(pedidosRef, nuevoPedido);
            return {
                exito: true,
                mensaje: "Pedido creado exitosamente",
                id: docRef.id,
                datos: nuevoPedido
            };
            
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al crear el pedido",
                error: error.message
            };
        }
    }

    static async cambiarEstadoPedido(tiendaId, pedidoId, nuevoEstado) {
        if (!ManejadorEstados.esEstadoValido(nuevoEstado)) {
            return {
                exito: false,
                mensaje: "Estado no válido"
            };
        }

        try {
            const pedidoRef = doc(db, 'tiendas', tiendaId, 'pedidos', pedidoId);
            const fechaActual = new Date();
            
            await updateDoc(pedidoRef, {
                estado: nuevoEstado,
                fechaActualizacion: fechaActual.toISOString()
            });
            
            return {
                exito: true,
                mensaje: `Estado actualizado a: ${nuevoEstado}`
            };
            
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al actualizar el estado",
                error: error.message
            };
        }
    }
}

export default PedidoService;
