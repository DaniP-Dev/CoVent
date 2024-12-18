'use client';
import { db } from '@/config/firebase/firebaseConfig';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

// Clase base para validación
class ValidadorTienda {
    static validarCampo(valor, longitudMinima, tipo) {
        if (!valor) return false;
        
        switch(tipo) {
            case 'texto':
                return valor.length >= longitudMinima;
            case 'email':
                return valor.includes('@');
            case 'telefono':
                return valor.length >= longitudMinima && !isNaN(valor);
            default:
                return false;
        }
    }
}

// Clase para manejo de errores
class ManejadorErrores {
    static crearMensajeError(campo, razon) {
        const mensajes = {
            nombre: "El nombre debe tener al menos 3 caracteres",
            email: "El email no es válido",
            telefono: "El teléfono debe tener al menos 7 dígitos"
        };
        return mensajes[campo] || razon;
    }
}

// Clase principal del servicio
class TiendaService {
    static validarDatosTienda(datos) {
        let errores = [];
        let validaciones = [
            {campo: 'nombre', longitud: 3, tipo: 'texto'},
            {campo: 'email', longitud: 0, tipo: 'email'},
            {campo: 'telefono', longitud: 7, tipo: 'telefono'}
        ];
        
        for (let validacion of validaciones) {
            if (!ValidadorTienda.validarCampo(datos[validacion.campo], validacion.longitud, validacion.tipo)) {
                errores.push(ManejadorErrores.crearMensajeError(validacion.campo));
            }
        }
        
        return {
            esValido: errores.length === 0,
            errores: errores
        };
    }

    static async crearTienda(datosBasicos) {
        const validacion = this.validarDatosTienda(datosBasicos);
        
        if (!validacion.esValido) {
            let mensajeError = "";
            for (let i = 0; i < validacion.errores.length; i++) {
                if (i > 0) mensajeError += ", ";
                mensajeError += validacion.errores[i];
            }
            throw new Error(`Datos inválidos: ${mensajeError}`);
        }

        try {
            const tiendaRef = doc(db, 'tiendas', datosBasicos.id);
            const fechaActual = new Date();
            const datosTienda = {
                info: {
                    nombre: datosBasicos.nombre,
                    email: datosBasicos.email,
                    telefono: datosBasicos.telefono,
                    fechaCreacion: fechaActual.toISOString(),
                    activo: true
                }
            };

            let resultado = {
                exito: false,
                mensaje: "",
                datos: null
            };

            await setDoc(tiendaRef, datosTienda);
            
            resultado.exito = true;
            resultado.mensaje = "Tienda creada exitosamente";
            resultado.datos = datosTienda;
            
            return resultado;
            
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al crear la tienda",
                error: error.message
            };
        }
    }

    static async obtenerTienda(tiendaId) {
        let resultado = {
            exito: false,
            mensaje: "",
            datos: null
        };

        if (!tiendaId || tiendaId.length === 0) {
            resultado.mensaje = "ID de tienda no proporcionado";
            return resultado;
        }

        try {
            const tiendaRef = doc(db, 'tiendas', tiendaId);
            const tiendaDoc = await getDoc(tiendaRef);
            
            if (!tiendaDoc.exists()) {
                resultado.mensaje = "Tienda no encontrada";
                return resultado;
            }

            resultado.exito = true;
            resultado.datos = tiendaDoc.data();
            return resultado;
            
        } catch (error) {
            resultado.mensaje = "Error al obtener la tienda";
            resultado.error = error.message;
            return resultado;
        }
    }

    static async verificarExistencia(uid) {
        try {
            const tiendaRef = doc(db, 'tiendas', uid);
            const tiendaDoc = await getDoc(tiendaRef);
            return tiendaDoc.exists();
        } catch (error) {
            console.error('Error al verificar tienda:', error);
            return false;
        }
    }

    static async obtenerNombreTienda(uid) {
        try {
            const tiendaRef = doc(db, 'tiendas', uid);
            const tiendaDoc = await getDoc(tiendaRef);
            
            if (!tiendaDoc.exists()) {
                return {
                    exito: false,
                    mensaje: "Tienda no encontrada"
                };
            }

            const datosTienda = tiendaDoc.data();
            return {
                exito: true,
                nombre: datosTienda.info.nombre
            };
        } catch (error) {
            console.error('Error al obtener nombre de tienda:', error);
            return {
                exito: false,
                mensaje: "Error al obtener nombre de tienda",
                error: error.message
            };
        }
    }
}

export default TiendaService;
