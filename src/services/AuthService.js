import { auth, googleProvider, db } from '@/config/firebase/firebaseConfig';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
            
            const tieneTienda = await AuthService.verificarTiendaExistente(resultado.user.uid);
            
            return {
                exito: true,
                usuario: resultado.user,
                token: token,
                tieneTienda: tieneTienda
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
            
            // Estructura básica de la tienda
            const estructuraTienda = {
                ...datosTienda,
                createdAt: new Date(),
                updatedAt: new Date(),
                configuracion: {
                    tema: 'default',
                    moneda: 'COP',
                    impuestos: {
                        iva: 19
                    }
                },
                colecciones: {
                    productos: [],
                    categorias: ['General'],
                    pedidos: [],
                    clientes: []
                }
            };

            await setDoc(tiendaRef, estructuraTienda);

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
}

export default AuthService;