'use client';
import { db, auth } from '@/config/firebase/firebaseConfig';
import { collection, doc, addDoc, updateDoc, getDoc, setDoc, query, where, increment, arrayUnion, getDocs } from 'firebase/firestore';

// Clase para validación de lotes
class ValidadorLote {
    static validarLote(lote) {
        const errores = [];
        
        if (!lote.nombreProducto?.trim()) {
            errores.push("El nombre del producto es requerido");
        }
        
        if (lote.cantidad <= 0) {
            errores.push("La cantidad debe ser mayor a 0");
        }
        
        // Validar el precio con el nuevo formato
        const precioLimpio = parseFloat(lote.precioLote.replace(/\./g, '').replace(',', '.'));
        if (isNaN(precioLimpio) || precioLimpio <= 0) {
            errores.push("El precio del lote debe ser mayor a 0");
        }
        
        return {
            esValido: errores.length === 0,
            errores
        };
    }
}

// Clase para manejo de actualizaciones
class ManejadorActualizaciones {
    static crearActualizacion(cantidad, motivo) {
        return {
            fecha: new Date(),
            cantidad,
            motivo,
            usuario: auth.currentUser?.uid || 'sistema'
        };
    }
}

// Clase principal del servicio
class LoteService {
    static async crearLote(tiendaId, datosLote) {
        const validacion = ValidadorLote.validarLote(datosLote);
        
        if (!validacion.esValido) {
            return {
                exito: false,
                mensaje: validacion.errores.join(", ")
            };
        }

        try {
            // Primero crear la metadata si no existe
            const metadataRef = doc(db, 'tiendas', tiendaId, 'lotes', '_metadata');
            const metadataDoc = await getDoc(metadataRef);

            if (!metadataDoc.exists()) {
                await setDoc(metadataRef, {
                    total: 0,
                    ultimaActualizacion: new Date()
                });
            }

            // Luego crear el lote
            const lotesRef = collection(db, 'tiendas', tiendaId, 'lotes');
            const nuevoLote = {
                nombreProducto: datosLote.nombreProducto,
                cantidad: parseInt(datosLote.cantidad),
                precioLote: datosLote.precioLote,
                precioUnidad: datosLote.precioUnidad,
                iva: parseInt(datosLote.iva),
                loteConIva: datosLote.loteConIva,
                fechaCreacion: new Date(),
                proveedor: datosLote.proveedor || 'No especificado',
                estado: parseInt(datosLote.cantidad) > 0 ? 'disponible' : 'agotado',
                actualizaciones: datosLote.actualizaciones
            };

            const docRef = await addDoc(lotesRef, nuevoLote);
            
            // Actualizar metadata
            await updateDoc(metadataRef, {
                total: increment(1),
                ultimaActualizacion: new Date()
            });

            return {
                exito: true,
                mensaje: "Lote creado exitosamente",
                id: docRef.id,
                datos: nuevoLote
            };
            
        } catch (error) {
            console.error('Error detallado:', error);
            return {
                exito: false,
                mensaje: "Error al crear el lote: " + error.message,
                error: error
            };
        }
    }

    static async actualizarCantidadLote(tiendaId, loteId, cantidad, motivo) {
        try {
            const loteRef = doc(db, 'tiendas', tiendaId, 'lotes', loteId);
            
            // Obtener la cantidad actual
            const loteDoc = await getDoc(loteRef);
            const cantidadActual = loteDoc.data().cantidad;
            const nuevaCantidad = cantidadActual + parseInt(cantidad);
            
            // Validar que la cantidad no quede negativa
            if (nuevaCantidad < 0) {
                return {
                    exito: false,
                    mensaje: "La cantidad resultante no puede ser negativa"
                };
            }
            
            const actualizacion = {
                ...ManejadorActualizaciones.crearActualizacion(cantidad, motivo),
                id: new Date().getTime().toString() // Agregar un ID único
            };

            await updateDoc(loteRef, {
                cantidad: increment(cantidad),
                estado: nuevaCantidad > 0 ? 'disponible' : 'agotado',
                actualizaciones: arrayUnion(actualizacion)
            });

            return {
                exito: true,
                mensaje: "Cantidad actualizada correctamente",
                actualizacionId: actualizacion.id
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al actualizar la cantidad",
                error: error.message
            };
        }
    }

    static async obtenerLotes(tiendaId) {
        try {
            const lotesRef = collection(db, 'tiendas', tiendaId, 'lotes');
            const snapshot = await getDocs(lotesRef);
            
            const lotes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                exito: true,
                datos: lotes
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener los lotes",
                error: error.message
            };
        }
    }

    static async eliminarActualizacion(tiendaId, loteId, actualizacionId) {
        try {
            const loteRef = doc(db, 'tiendas', tiendaId, 'lotes', loteId);
            const loteDoc = await getDoc(loteRef);
            const actualizaciones = loteDoc.data().actualizaciones;
            
            // Filtrar la actualización específica
            const nuevasActualizaciones = actualizaciones.filter(
                act => act.id !== actualizacionId
            );
            
            await updateDoc(loteRef, {
                actualizaciones: nuevasActualizaciones
            });

            return {
                exito: true,
                mensaje: "Actualización eliminada correctamente"
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al eliminar la actualización",
                error: error.message
            };
        }
    }
}

export default LoteService; 