'use client';
import { useState, useRef, useEffect } from 'react';
import './Emmanuel.css';
import GeminiService from '@/services/GeminiService';

const Emmanuel = ({ tiendaId }) => {
    const [mensajes, setMensajes] = useState([
        {
            tipo: 'bot',
            texto: '¡Hola! Soy Emmanuel, tu asistente virtual. ¿En qué puedo ayudarte hoy?'
        }
    ]);
    const [inputMensaje, setInputMensaje] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const mensajesRef = useRef(null);

    // Auto-scroll al último mensaje
    useEffect(() => {
        if (mensajesRef.current) {
            mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
        }
    }, [mensajes]);

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!inputMensaje.trim() || isLoading) return;

        // Agregar mensaje del usuario
        const nuevoMensajeUsuario = {
            tipo: 'user',
            texto: inputMensaje
        };

        setMensajes(prev => [...prev, nuevoMensajeUsuario]);
        setInputMensaje('');
        setIsLoading(true);

        try {
            const resultado = await GeminiService.generarRespuesta(inputMensaje, tiendaId);
            
            const respuestaBot = {
                tipo: 'bot',
                texto: resultado.exito 
                    ? resultado.respuesta 
                    : 'Lo siento, hubo un error al procesar tu mensaje.'
            };

            setMensajes(prev => [...prev, respuestaBot]);
        } catch (error) {
            console.error('Error:', error);
            setMensajes(prev => [...prev, {
                tipo: 'bot',
                texto: 'Lo siento, ocurrió un error inesperado.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="emmanuel-container">
            {/* Header del Chat */}
            <div className="emmanuel-header">
                <div className="emmanuel-avatar">
                    🤖
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Emmanuel</h1>
                    <p className="text-sm text-[#E7BCB8]/80">Asistente Virtual</p>
                </div>
            </div>

            {/* Área de Mensajes */}
            <div className="messages-container" ref={mensajesRef}>
                <div className="message-list">
                    {mensajes.map((mensaje, index) => (
                        <div key={index} className={`message ${mensaje.tipo}`}>
                            {mensaje.tipo === 'bot' && (
                                <div className="message-avatar bot">
                                    🤖
                                </div>
                            )}
                            <div className={`message-bubble ${mensaje.tipo}`}>
                                <p className="message-text">
                                    {mensaje.texto}
                                </p>
                            </div>
                            {mensaje.tipo === 'user' && (
                                <div className="message-avatar user">
                                    👤
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Área de Input */}
            <div className="input-container">
                <form onSubmit={enviarMensaje} className="input-wrapper">
                    <input 
                        type="text"
                        value={inputMensaje}
                        onChange={(e) => setInputMensaje(e.target.value)}
                        placeholder={isLoading ? "Emmanuel está escribiendo..." : "Escribe un mensaje..."}
                        className="chat-input"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="send-button"
                        disabled={!inputMensaje.trim() || isLoading}
                    >
                        <span>{isLoading ? '...' : 'Enviar'}</span>
                        <span>{isLoading ? '⌛' : '📤'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Emmanuel;

