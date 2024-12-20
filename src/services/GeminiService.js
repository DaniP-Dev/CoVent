'use client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import VentasMetricasService from './metricas/VentasMetricasService';
import FinanzasMetricasService from './metricas/FinanzasMetricasService';
import ClientesMetricasService from './metricas/ClientesMetricasService';
import ProductoService from './ProductoService';

class GeminiService {
    static genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    static model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 500,
        }
    });

    static async obtenerContextoTienda(tiendaId) {
        try {
            if (!tiendaId) {
                throw new Error('tiendaId es requerido');
            }

            // Obtener solo los datos de servicios existentes
            const [
                ventas,
                finanzas,
                clientes,
                productosResult,
            ] = await Promise.all([
                VentasMetricasService.obtenerVentasDiarias(tiendaId, new Date()),
                FinanzasMetricasService.obtenerBalanceGeneral(tiendaId),
                ClientesMetricasService.obtenerClientesTop(tiendaId),
                ProductoService.obtenerProductos(tiendaId),
            ]);

            // Validar y asegurar que los datos sean arrays o tengan valores por defecto
            const ventasData = ventas?.datos || { total: 0, promedioVenta: 0, cantidad: 0 };
            const finanzasData = finanzas?.datos || { 
                resumen: { margenPromedioGeneral: 0, roiMensual: 0, ingresosMensuales: 0 } 
            };
            const clientesData = Array.isArray(clientes?.datos) ? clientes.datos : [];
            const productos = Array.isArray(productosResult?.datos) ? productosResult.datos : [];

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
                - Valor promedio por cliente: ${clientesData.length > 0 
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
                Eres Emmanuel, un asistente virtual especializado en análisis de datos.
                REGLAS IMPORTANTES:
                1. Responde SOLO con datos exactos del contexto proporcionado
                2. NO hagas suposiciones ni especulaciones
                3. Si un dato no está en el contexto, di "No tengo ese dato"
                4. Usa números específicos, no aproximaciones
                5. Mantén las respuestas breves y directas
                6. No des recomendaciones a menos que se soliciten específicamente

                CONTEXTO ACTUAL:
                ${contexto}

                FORMATO DE RESPUESTA:
                - Usa viñetas para listar datos
                - Incluye las unidades específicas (%, $, unidades)
                - Separa claramente las diferentes métricas
                - No uses lenguaje florido ni explicaciones innecesarias

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