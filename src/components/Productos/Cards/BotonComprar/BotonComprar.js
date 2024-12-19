"use client";
import React, { useState } from 'react';
import PedidoService from '@/services/PedidoService';
import CarritoService from '@/services/CarritoService';

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
      className="w-full p-2 border rounded"
    />
    
    <input 
      type="password"
      placeholder="Tu contraseña"
      value={contrasena}
      onChange={(e) => setContrasena(e.target.value)}
      className="w-full p-2 border rounded"
    />
    
    <select
      value={medioPago}
      onChange={(e) => setMedioPago(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="">Selecciona forma de pago</option>
      {["Efectivo", "Tarjeta", "Nequi", "PSE"].map((medio, index) => (
        <option key={index} value={medio}>{medio}</option>
      ))}
    </select>

    {error && <p className="text-red-500">{error}</p>}

    <div className="flex gap-2 justify-end mt-4">
      <button 
        onClick={onCancelar}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Cancelar
      </button>
      <button 
        onClick={onConfirmar}
        className="px-4 py-2 bg-orange-500 text-white rounded"
      >
        Confirmar
      </button>
    </div>
  </div>
);

// Componente principal que orquesta todo
const BotonComprar = ({ esCarrito = false, onCompraExitosa = () => {} }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [correo, setCorreo] = useState(CORREO_DEFAULT);
  const [contrasena, setContrasena] = useState(CONTRASEÑA_DEFAULT);
  const [medioPago, setMedioPago] = useState('');
  const [error, setError] = useState('');
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);

  const handleComprar = async () => {
    const validacion = PedidoService.validarPedido({
      cliente: { correo, contrasena },
      medioPago
    });

    if (!validacion.esValido) {
      setError(validacion.errores[0]);
      return;
    }

    try {
      const carrito = CarritoService.obtenerCarrito();
      if (!carrito || carrito.length === 0) {
        setError('El carrito está vacío');
        return;
      }

      const resultado = await PedidoService.crearPedido('tienda1', {
        cliente: { correo },
        productos: carrito,
        medioPago
      });

      if (resultado.exito) {
        CarritoService.limpiarCarrito();
        setMostrarNotificacion(true);
        setMostrarFormulario(false);
        
        setTimeout(() => {
          setMostrarNotificacion(false);
          onCompraExitosa();
        }, 1000);
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
        className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 w-full"
      >
        {esCarrito ? '💸Comprar Carrito💸' : '💸'}
      </button>

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
             style={{ zIndex: 1000 }}>
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <h2 className="text-xl font-bold mb-4">Datos de Compra</h2>
            
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
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          ¡Compra realizada con éxito! 🎉
        </div>
      )}
    </div>
  );
};

export default BotonComprar;