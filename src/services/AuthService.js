import { auth, googleProvider, db } from '@/config/firebase/firebaseConfig';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import TiendaService from '@/services/TiendaService';

class AuthService {
    static async verificarConfiguracion() {
        if (!auth || !googleProvider) {
            console.error('Firebase Auth no está inicializado correctamente');
            return false;
        }
        return true;
    }

    static async verificarTiendaExistente(uid) {
        try {
            const tiendaRef = doc(db, 'tiendas', uid);
            const tiendaDoc = await getDoc(tiendaRef);
            return tiendaDoc.exists();
        } catch (error) {
            console.error('Error al verificar tienda:', error);
            return false;
        }
    }

    static async loginConGoogle() {
        try {
            if (!auth || !googleProvider) {
                throw new Error('Firebase Auth no está inicializado correctamente');
            }

            const resultado = await signInWithPopup(auth, googleProvider);
            const token = await resultado.user.getIdToken();
            
            document.cookie = `auth_token=${token}; path=/; max-age=3600; secure; samesite=strict`;
            
            // Verificar si el usuario ya tiene una tienda
            const tieneTienda = await AuthService.verificarTiendaExistente(resultado.user.uid);
            
            // Si es nuevo usuario, crear estructura de tienda
            if (!tieneTienda) {
                const datosTienda = {
                    nombre: resultado.user.displayName || 'Mi Tienda',
                    email: resultado.user.email,
                    telefono: '',  // Se puede actualizar después
                    id: resultado.user.uid
                };

                await AuthService.crearEstructuraTienda(resultado.user.uid, datosTienda);
            }
            
            return {
                exito: true,
                usuario: resultado.user,
                token: token,
                tieneTienda: true  // Ahora siempre será true porque se crea automáticamente
            };
        } catch (error) {
            console.error('Error de autenticación:', error);
            return {
                exito: false,
                mensaje: "Error al iniciar sesión con Google",
                error: error.message
            };
        }
    }

    static async cerrarSesion() {
        try {
            await signOut(auth);
            // Eliminar cookie
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            return {
                exito: true,
                mensaje: "Sesión cerrada exitosamente"
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: "Error al cerrar sesión",
                error: error.message
            };
        }
    }

    static obtenerUsuarioActual() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged((usuario) => {
                resolve(usuario);
            });
        });
    }

    static async crearEstructuraTienda(uid, datosTienda) {
        try {
            const tiendaRef = doc(db, 'tiendas', uid);
            
            // Estructura base completa de la tienda
            const estructuraTienda = {
                info: {
                    nombre: datosTienda.nombre,
                    email: datosTienda.email,
                    telefono: datosTienda.telefono,
                    fechaCreacion: new Date(),
                    activo: true
                },
                configuracion: {
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
                },
                metricas: {
                    ventas: {
                        total: 0,
                        mes: 0,
                        dia: 0
                    },
                    productos: {
                        total: 0,
                        activos: 0,
                        agotados: 0
                    },
                    clientes: {
                        total: 0,
                        activos: 0
                    }
                }
            };

            // Crear documento principal de la tienda
            await setDoc(tiendaRef, estructuraTienda);

            // Crear colecciones base
            await this.crearColeccionesBase(uid);

            return {
                exito: true,
                mensaje: "Estructura de tienda creada exitosamente"
            };
        } catch (error) {
            console.error('Error al crear estructura de tienda:', error);
            return {
                exito: false,
                mensaje: "Error al crear estructura de tienda",
                error: error.message
            };
        }
    }

    static async crearColeccionesBase(uid) {
        const colecciones = [
            {
                nombre: 'lotes',
                documentoInicial: {
                    total: 0,
                    ultimaActualizacion: new Date()
                }
            },
            {
                nombre: 'productos',
                documentoInicial: {
                    total: 0,
                    categorias: ['General'],
                    ultimaActualizacion: new Date()
                }
            },
            {
                nombre: 'pedidos',
                documentoInicial: {
                    total: 0,
                    pendientes: 0,
                    ultimaActualizacion: new Date()
                }
            },
            {
                nombre: 'clientes',
                documentoInicial: {
                    total: 0,
                    ultimaActualizacion: new Date()
                }
            },
            {
                nombre: 'metricas',
                documentoInicial: {
                    ventas: {
                        diarias: [],
                        mensuales: [],
                        anuales: []
                    },
                    ultimaActualizacion: new Date()
                }
            }
        ];

        for (const coleccion of colecciones) {
            const coleccionRef = collection(db, 'tiendas', uid, coleccion.nombre);
            const metadataRef = doc(coleccionRef, '_metadata');
            await setDoc(metadataRef, coleccion.documentoInicial);
        }
    }
}

export default AuthService;