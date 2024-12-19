'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export const useMetricas = (fetchFunction, tiendaId, interval = 5 * 60 * 1000) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Usar useRef para mantener una referencia estable de la función
    const fetchFunctionRef = useRef(fetchFunction);
    fetchFunctionRef.current = fetchFunction;

    // Memoizar la función de fetch
    const fetchData = useCallback(async () => {
        if (!tiendaId) return;
        
        try {
            setLoading(true);
            const resultado = await fetchFunctionRef.current(tiendaId);
            
            if (resultado.exito) {
                setData(resultado.datos);
                setError(null);
            } else {
                setError(resultado.mensaje || 'Error al cargar datos');
            }
        } catch (err) {
            console.error('Error in useMetricas:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [tiendaId]); // Solo depende de tiendaId

    useEffect(() => {
        fetchData(); // Carga inicial

        // Solo configurar el intervalo si tenemos un tiendaId
        const intervalId = tiendaId ? setInterval(fetchData, interval) : null;
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchData, interval, tiendaId]);

    return { 
        data, 
        loading, 
        error,
        refetch: fetchData
    };
}; 