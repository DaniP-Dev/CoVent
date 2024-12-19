'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

class CompraService {
    static validarCompra(datosCompra) {
        const errores = [];

        if (!datosCompra.cliente?.correo) {
            errores.push("El correo del cliente es requerido");
        }

        if (!datosCompra.productos?.length) {
            errores.push("No hay productos en el carrito");
        }

        if (!datosCompra.total || datosCompra.total <= 0) {
            errores.push("El total de la compra debe ser mayor a 0");
        }

        if (!datosCompra.medioPago) {
            errores.push("Seleccione un medio de pago");
        }

        return {
            esValido: errores.length === 0,
            errores
        };
    }

    static async crearCompra(tiendaId, datosCompra) {
        try {
            const validacion = this.validarCompra(datosCompra);
            
            if (!validacion.esValido) {
                return {
                    exito: false,
                    mensaje: validacion.errores.join(", ")
                };
            }

            // Crear la compra en la colección compras
            const comprasRef = collection(db, `tiendas/${tiendaId}/compras`);
            
            const nuevaCompra = {
                cliente: datosCompra.cliente,
                productos: datosCompra.productos,
                total: datosCompra.total,
                medioPago: datosCompra.medioPago,
                estado: 'Comprado',
                fecha: new Date().toISOString()
            };

            const docRef = await addDoc(comprasRef, nuevaCompra);

            return {
                exito: true,
                mensaje: "Compra registrada exitosamente",
                id: docRef.id,
                tiendaId,
                datos: nuevaCompra
            };
        } catch (error) {
            console.error('Error al crear compra:', error);
            return {
                exito: false,
                mensaje: "Error al procesar la compra",
                error: error.message
            };
        }
    }

    static async obtenerCompras(tiendaId) {
        try {
            const comprasRef = collection(db, `tiendas/${tiendaId}/compras`);
            const snapshot = await getDocs(comprasRef);
            
            const compras = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                exito: true,
                datos: compras
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener compras",
                error: error.message
            };
        }
    }

    static async obtenerComprasCliente(tiendaId, correoCliente) {
        try {
            const comprasRef = collection(db, `tiendas/${tiendaId}/compras`);
            const q = query(comprasRef, where('cliente.correo', '==', correoCliente));
            const snapshot = await getDocs(q);
            
            const compras = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                exito: true,
                datos: compras
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener compras del cliente",
                error: error.message
            };
        }
    }
}

export default CompraService; 