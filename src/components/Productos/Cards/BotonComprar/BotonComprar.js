"use client";
import React, { useState } from 'react';
import CompraService from '@/services/CompraService';
import CarritoService from '@/services/CarritoService';
import ProductoService from '@/services/ProductoService';
import VentasMetricasService from '@/services/metricas/VentasMetricasService';

// Valores por defecto
const CORREO_DEFAULT = 'prueba@prueba.com';
const CONTRASEÑA_DEFAULT = '123456';

// Componente de formulario
const FormularioCompra = ({ 
  correo,
  setCorreo,
  contrasena,
  setContrasena,
  medioPago,
  setMedioPago,
  error,
  onCancelar,
  onConfirmar
}) => (
  <div className="space-y-4">
    <input 
      type="email"
      placeholder="Tu correo"
      value={correo}
      onChange={(e) => setCorreo(e.target.value)}
      className="w-full p-2 border border-[#4C4376]/20 rounded-md 
        focus:ring-2 focus:ring-[#4C4376]/30 focus:border-[#4C4376] 
        outline-none transition-all
        placeholder:text-[#443054]/50"
    />
    
    <input 
      type="password"
      placeholder="Tu contraseña"
      value={contrasena}
      onChange={(e) => setContrasena(e.target.value)}
      className="w-full p-2 border border-[#4C4376]/20 rounded-md 
        focus:ring-2 focus:ring-[#4C4376]/30 focus:border-[#4C4376] 
        outline-none transition-all
        placeholder:text-[#443054]/50"
    />
    
    <select
      value={medioPago}
      onChange={(e) => setMedioPago(e.target.value)}
      className="w-full p-2 border border-[#4C4376]/20 rounded-md 
        focus:ring-2 focus:ring-[#4C4376]/30 focus:border-[#4C4376] 
        outline-none transition-all
        text-[#443054]
        bg-white"
    >
      <option value="">Selecciona forma de pago</option>
      {["Efectivo", "Tarjeta", "Nequi", "PSE"].map((medio, index) => (
        <option key={index} value={medio}>{medio}</option>
      ))}
    </select>

    {error && (
      <p className="text-[#AE445A] text-sm bg-[#AE445A]/10 p-2 rounded-md border border-[#AE445A]/20">
        ⚠️ {error}
      </p>
    )}

    <div className="flex gap-2 justify-end mt-4">
      <button 
        onClick={onCancelar}
        className="px-4 py-2 bg-[#E7BCB8]/20 text-[#443054] rounded-md
          hover:bg-[#E7BCB8]/30 transition-colors"
      >
        Cancelar
      </button>
      <button 
        onClick={onConfirmar}
        className="px-4 py-2 bg-[#4C4376] text-white rounded-md
          hover:bg-[#3a3359] transition-colors"
      >
        Confirmar
      </button>
    </div>
  </div>
);

// Componente principal que orquesta todo
const BotonComprar = ({ esCarrito = false, onCompraExitosa = () => {}, tiendaId }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [correo, setCorreo] = useState(CORREO_DEFAULT);
  const [contrasena, setContrasena] = useState(CONTRASEÑA_DEFAULT);
  const [medioPago, setMedioPago] = useState('');
  const [error, setError] = useState('');
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);

  const handleComprar = async () => {
    try {
      // Verificaciones iniciales
      const carrito = CarritoService.obtenerCarrito();
      if (!carrito || carrito.length === 0) {
        setError('El carrito está vacío');
        return;
      }

      const totalCompra = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

      // Validación
      const validacion = CompraService.validarCompra({
        cliente: { correo, contrasena },
        medioPago,
        productos: carrito,
        total: totalCompra
      });

      if (!validacion.esValido) {
        setError(validacion.errores[0]);
        return;
      }

      // Crear la compra
      const resultado = await CompraService.crearCompra(tiendaId, {
        cliente: { correo },
        productos: carrito,
        medioPago,
        total: totalCompra
      });

      if (resultado.exito) {
        try {
          await Promise.all([
            // Actualizar stock
            ...carrito.map(item => 
              ProductoService.actualizarStock(resultado.tiendaId, item.id, -item.cantidad)
            ),
            
            // Registrar métricas de venta
            VentasMetricasService.registrarVenta(tiendaId, {
              compraId: resultado.id,
              productos: carrito,
              total: totalCompra,
              fecha: new Date(),
              cliente: { correo },
              medioPago
            })
          ]);

          CarritoService.limpiarCarrito();
          setMostrarNotificacion(true);
          setMostrarFormulario(false);

          setTimeout(() => {
            setMostrarNotificacion(false);
            onCompraExitosa();
          }, 1000);
        } catch (error) {
          console.error('Error actualizando métricas:', error);
          setError('Compra realizada pero hubo un error actualizando algunas métricas');
        }
      } else {
        setError(resultado.mensaje);
      }
    } catch (error) {
      setError('Error al procesar la compra');
      console.error('Error:', error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setMostrarFormulario(true)}
        className="bg-[#AE445A] text-white p-2 rounded-md w-full
          hover:bg-[#963a4d]
          active:scale-95
          transform transition-all duration-200
          shadow-md hover:shadow-lg
          flex items-center justify-center gap-2"
      >
        <span className="text-lg">💸</span>
        {esCarrito && <span>Comprar Carrito</span>}
      </button>

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
             style={{ zIndex: 1000 }}>
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <h2 className="text-xl font-bold mb-4 text-[#4C4376]">Datos de Compra</h2>
            
            <FormularioCompra
              correo={correo}
              setCorreo={setCorreo}
              contrasena={contrasena}
              setContrasena={setContrasena}
              medioPago={medioPago}
              setMedioPago={setMedioPago}
              error={error}
              onCancelar={() => setMostrarFormulario(false)}
              onConfirmar={handleComprar}
            />
          </div>
        </div>
      )}

      {mostrarNotificacion && (
        <div className="fixed top-4 right-4 bg-[#4C4376] text-white 
          px-6 py-3 rounded-lg shadow-lg 
          transform transition-all duration-300 
          animate-slide-down">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            ¡Compra realizada con éxito! 🎉
          </div>
        </div>
      )}
    </div>
  );
};

export default BotonComprar;