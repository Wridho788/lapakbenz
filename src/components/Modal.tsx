import React from 'react';
import { MdClose } from 'react-icons/md';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  open, 
  onClose, 
  children, 
  maxWidth = '400px',
  maxHeight = '80vh'
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        style={{ 
          maxWidth,
          maxHeight,
          overflowY: 'auto',
          scrollBehavior: 'smooth'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-close-btn" onClick={onClose}>
          <MdClose color="#fff" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;