'use client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import VentasMetricasService from './metricas/VentasMetricasService';
import FinanzasMetricasService from './metricas/FinanzasMetricasService';
import ClientesMetricasService from './metricas/ClientesMetricasService';
import ProductoService from './ProductoService';

class GeminiService {
    static genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    static model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    static async obtenerContextoTienda(tiendaId) {
        try {
            if (!tiendaId) {
                throw new Error('tiendaId es requerido');
            }

            // Obtener datos de diferentes servicios
            const [ventas, finanzas, clientes, productosResult] = await Promise.all([
                VentasMetricasService.obtenerVentasDiarias(tiendaId, new Date()),
                FinanzasMetricasService.obtenerBalanceGeneral(tiendaId),
                ClientesMetricasService.obtenerClientesTop(tiendaId),
                ProductoService.obtenerProductos(tiendaId)
            ]);

            // Asegurar que todos los datos sean arrays o tengan valores por defecto
            const ventasData = ventas?.datos || { total: 0, promedioVenta: 0, cantidad: 0 };
            const finanzasData = finanzas?.datos || { 
                resumen: { 
                    margenPromedioGeneral: 0, 
                    roiMensual: 0, 
                    ingresosMensuales: 0 
                } 
            };
            const clientesData = Array.isArray(clientes?.datos) ? clientes.datos : [];
            const productos = Array.isArray(productosResult) ? productosResult : [];

            // Crear contexto estructurado
            return `
                Contexto de la tienda:
                
                VENTAS:
                - Ventas totales hoy: ${ventasData.total}
                - Promedio de venta: ${ventasData.promedioVenta}
                - Cantidad de ventas: ${ventasData.cantidad}

                FINANZAS:
                - Margen promedio: ${finanzasData.resumen.margenPromedioGeneral}%
                - ROI mensual: ${finanzasData.resumen.roiMensual}%
                - Ingresos mensuales: ${finanzasData.resumen.ingresosMensuales}

                CLIENTES:
                - Total clientes activos: ${clientesData.length}
                - Cliente con más compras: ${clientesData[0]?.correo || 'No hay clientes'}
                - Valor promedio por cliente: ${
                    clientesData.length > 0 
                    ? clientesData.reduce((acc, c) => acc + c.totalCompras, 0) / clientesData.length 
                    : 0}

                PRODUCTOS:
                - Total productos: ${productos.length}
                - Categorías: ${[...new Set(productos.map(p => p.details?.categoria || 'Sin categoría'))].join(', ') || 'Sin categorías'}
                - Stock total: ${productos.reduce((acc, p) => acc + (p.details?.stock || 0), 0)}
            `;
        } catch (error) {
            console.error('Error al obtener contexto:', error);
            return `
                No se pudieron obtener todos los datos de la tienda.
                Error: ${error.message}
                
                Puedo ayudarte con consultas generales o podemos intentar obtener datos específicos.
            `;
        }
    }

    static async generarRespuesta(mensaje, tiendaId) {
        try {
            const contexto = await this.obtenerContextoTienda(tiendaId);
            
            const prompt = `
                Eres Emmanuel, un asistente virtual especializado en análisis de datos y métricas de negocio.
                Tienes acceso a toda la información de la tienda y puedes responder preguntas sobre:
                - Ventas y métricas de rendimiento
                - Finanzas y balances
                - Clientes y comportamiento
                - Productos e inventario

                CONTEXTO ACTUAL:
                ${contexto}

                INSTRUCCIONES:
                - Responde de manera profesional y clara
                - Usa datos específicos cuando estén disponibles
                - Si no tienes un dato exacto, indícalo
                - Sugiere acciones basadas en los datos

                Usuario: ${mensaje}
            `;
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            
            return {
                exito: true,
                respuesta: response.text()
            };
        } catch (error) {
            console.error('Error al generar respuesta:', error);
            return {
                exito: false,
                error: error.message
            };
        }
    }
}

export default GeminiService; 