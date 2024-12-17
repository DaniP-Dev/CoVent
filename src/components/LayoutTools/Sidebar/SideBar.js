"use client";
import React, { useState, useEffect, useRef } from 'react';

const SideBar = () => {
    const [anchoSidebar, setAnchoSidebar] = useState(10);
    const [textoVisible, setTextoVisible] = useState(false);
    const sidebarRef = useRef();

    // estos numeritos son el tamano del menu
    // cuando esta chiquito es 10 y cuando esta grande es 64
    const ANCHO_MINIMO = 10;
    const ANCHO_MAXIMO = 64;

    // esto es pa que se cierre cuando le das click afuera
    // como cuando le das click afuera de cualquier menu
    useEffect(() => {
        const clickFuera = (evento) => {
            if (sidebarRef.current && !sidebarRef.current.contains(evento.target)) {
                cerrarSidebar();
            }
        };

        document.addEventListener('mousedown', clickFuera);
        return () => document.removeEventListener('mousedown', clickFuera);
    }, []);

    // esta funcion hace que el menu se haga grande o chiquito
    // depende de como este ahorita
    const alternarSidebar = () => {
        let nuevoAncho = anchoSidebar === ANCHO_MINIMO ? ANCHO_MAXIMO : ANCHO_MINIMO;
        let mostrarTexto = anchoSidebar === ANCHO_MINIMO ? true : false;

        setAnchoSidebar(nuevoAncho);
        setTextoVisible(mostrarTexto);
    };

    // esta funcion hace que el menu se cierre
    // o sea que se haga chiquito
    const cerrarSidebar = () => {
        setAnchoSidebar(ANCHO_MINIMO);
        setTextoVisible(false);
    };

    // aqui estan los botones que se van a ver en el menu
    // cada uno tiene su dibujito y su nombre
    const botonesMenu = [
        { icono: '🏠', texto: 'Inicio' },
        { icono: '👤', texto: 'Perfil' },
        { icono: '⚙️', texto: 'Configuración' }
    ];

    // esto es lo que se ve en la pantalla
    // es una barrita verde con botones
    return (
        <div ref={sidebarRef} className={`bg-green-500 min-h-full ${anchoSidebar === ANCHO_MINIMO ? 'w-10' : 'w-64'}`}>
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
                        onClick={cerrarSidebar}
                        className={`text-white w-full p-2 hover:bg-green-600 ${textoVisible ? 'text-left px-4' : 'flex justify-center'}`}
                    >
                        {textoVisible === true ? `${boton.icono} ${boton.texto}` : boton.icono}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SideBar;