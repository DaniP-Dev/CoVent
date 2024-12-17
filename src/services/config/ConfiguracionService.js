import { db } from '@/config/firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Clase para validación de configuraciones
class ValidadorConfiguracion {
    static validarImpuestos(impuestos) {
        return (
            impuestos &&
            typeof impuestos.iva === 'number' &&
            typeof impuestos.retencionFuente === 'number' &&
            typeof impuestos.retencionICA === 'number'
        );
    }

    static validarNotificaciones(notificaciones) {
        return (
            notificaciones &&
            typeof notificaciones.stockBajo === 'boolean' &&
            typeof notificaciones.nuevoPedido === 'boolean' &&
            typeof notificaciones.ventaRealizada === 'boolean'
        );
    }
}

// Clase para manejo de configuraciones
class ManejadorConfiguracion {
    static obtenerConfiguracionPredeterminada() {
        return {
            moneda: 'COP',
            impuestos: {
                iva: 19,
                retencionFuente: 0,
                retencionICA: 0
            },
            notificaciones: {
                stockBajo: true,
                nuevoPedido: true,
                ventaRealizada: true
            }
        };
    }
}

// Clase principal del servicio
class ConfiguracionService {
    static async obtenerConfiguracion(tiendaId) {
        try {
            const tiendaRef = doc(db, 'tiendas', tiendaId);
            const tiendaDoc = await getDoc(tiendaRef);

            if (!tiendaDoc.exists()) {
                throw new Error('Tienda no encontrada');
            }

            const configuracion = tiendaDoc.data().configuracion ||
                ManejadorConfiguracion.obtenerConfiguracionPredeterminada();

            return {
                exito: true,
                datos: configuracion
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al obtener configuración",
                error: error.message
            };
        }
    }

    static async actualizarConfiguracion(tiendaId, nuevaConfiguracion) {
        try {
            // Validar configuración
            if (!ValidadorConfiguracion.validarImpuestos(nuevaConfiguracion.impuestos)) {
                throw new Error('Configuración de impuestos inválida');
            }

            if (!ValidadorConfiguracion.validarNotificaciones(nuevaConfiguracion.notificaciones)) {
                throw new Error('Configuración de notificaciones inválida');
            }

            const tiendaRef = doc(db, 'tiendas', tiendaId);
            await updateDoc(tiendaRef, {
                'configuracion': nuevaConfiguracion
            });

            return {
                exito: true,
                mensaje: "Configuración actualizada exitosamente"
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al actualizar configuración",
                error: error.message
            };
        }
    }

    static async actualizarImpuestos(tiendaId, nuevosImpuestos) {
        try {
            if (!ValidadorConfiguracion.validarImpuestos(nuevosImpuestos)) {
                throw new Error('Configuración de impuestos inválida');
            }

            const tiendaRef = doc(db, 'tiendas', tiendaId);
            await updateDoc(tiendaRef, {
                'configuracion.impuestos': nuevosImpuestos
            });

            return {
                exito: true,
                mensaje: "Impuestos actualizados exitosamente"
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al actualizar impuestos",
                error: error.message
            };
        }
    }

    static async actualizarNotificaciones(tiendaId, nuevasNotificaciones) {
        try {
            if (!ValidadorConfiguracion.validarNotificaciones(nuevasNotificaciones)) {
                throw new Error('Configuración de notificaciones inválida');
            }

            const tiendaRef = doc(db, 'tiendas', tiendaId);
            await updateDoc(tiendaRef, {
                'configuracion.notificaciones': nuevasNotificaciones
            });

            return {
                exito: true,
                mensaje: "Notificaciones actualizadas exitosamente"
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al actualizar notificaciones",
                error: error.message
            };
        }
    }
}

export default ConfiguracionService;