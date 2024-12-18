"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SideBar = () => {
    const [anchoSidebar, setAnchoSidebar] = useState(10);
    const [textoVisible, setTextoVisible] = useState(false);
    const sidebarRef = useRef();
    const router = useRouter();

    const ANCHO_MINIMO = 10;
    const ANCHO_MAXIMO = 64;

    useEffect(() => {
        const handleScroll = () => {
            const headerHeight = 64; // altura del header
            const scrollTop = window.scrollY;
            const sidebarPlaceholder = document.getElementById('sidebarPlaceholder');
            const sidebarExpanded = document.getElementById('sidebarExpanded');
            
            // Calculamos la posición progresiva
            const newTop = Math.max(0, headerHeight - scrollTop);
            
            if (sidebarPlaceholder) {
                if (scrollTop > 0) {
                    sidebarPlaceholder.style.position = 'fixed';
                    sidebarPlaceholder.style.top = `${newTop}px`;
                } else {
                    sidebarPlaceholder.style.position = '';
                    sidebarPlaceholder.style.top = '';
                }
            }

            if (sidebarExpanded) {
                sidebarExpanded.style.top = `${newTop}px`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const clickFuera = (evento) => {
        if (sidebarRef.current && !sidebarRef.current.contains(evento.target)) {
            cerrarSidebar();
        }
    };

    document.addEventListener('mousedown', clickFuera);

    const alternarSidebar = () => {
        let nuevoAncho = anchoSidebar === ANCHO_MINIMO ? ANCHO_MAXIMO : ANCHO_MINIMO;
        let mostrarTexto = anchoSidebar === ANCHO_MINIMO ? true : false;

        setAnchoSidebar(nuevoAncho);
        setTextoVisible(mostrarTexto);
    };

    const cerrarSidebar = () => {
        setAnchoSidebar(ANCHO_MINIMO);
        setTextoVisible(false);
    };

    const navegarA = (ruta) => {
        cerrarSidebar();
        router.push(ruta);
    };

    const botonesMenu = [
        { icono: '🏠', texto: 'Inicio', ruta: '/admin/dashboard/' },
        { icono: '👤', texto: 'Perfil' },
        { icono: '📦', texto: 'Productos', ruta: '/admin/dashboard/productos' },
        { icono: '⚙️', texto: 'Configuración' }
    ];

    return (
        <>
            {/* Sidebar placeholder - mantiene el espacio */}
            <div id="sidebarPlaceholder" className="w-10 h-full bg-green-500">
                <button
                    onClick={alternarSidebar}
                    className="text-white w-full p-2 hover:bg-green-600 flex justify-center"
                >
                    ☰
                </button>
                <div>
                    {botonesMenu.map((boton, indice) => (
                        <button
                            key={indice}
                            onClick={() => boton.ruta ? navegarA(boton.ruta) : cerrarSidebar()}
                            className="text-white w-full p-2 hover:bg-green-600 flex justify-center"
                        >
                            {boton.icono}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sidebar expandible */}
            {anchoSidebar !== ANCHO_MINIMO && (
                <div 
                    id="sidebarExpanded"
                    ref={sidebarRef}
                    className="fixed left-0 top-[64px] bottom-0 w-64 bg-green-500 z-50"
                >
                    <button
                        onClick={alternarSidebar}
                        className="text-white w-full p-2 hover:bg-green-600 flex justify-center"
                    >
                        ☰
                    </button>

                    <div>
                        {botonesMenu.map((boton, indice) => (
                            <button
                                key={indice}
                                onClick={() => boton.ruta ? navegarA(boton.ruta) : cerrarSidebar()}
                                className="text-white w-full p-2 hover:bg-green-600 text-left px-4"
                            >
                                {`${boton.icono} ${boton.texto}`}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default SideBar;