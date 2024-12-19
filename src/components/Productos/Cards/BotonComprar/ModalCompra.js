import { createPortal } from 'react-dom';

const ModalCompra = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      style={{ zIndex: 99999 }}
    >
      <div 
        className="fixed inset-0 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white p-6 rounded-lg w-96 relative" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalCompra; 