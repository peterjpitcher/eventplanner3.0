'use client';

import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  className = '' 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Size styles with responsive breakpoints
  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'max-w-full sm:max-w-md';
      break;
    case 'md':
      sizeStyles = 'max-w-full sm:max-w-lg md:max-w-2xl';
      break;
    case 'lg':
      sizeStyles = 'max-w-full sm:max-w-2xl lg:max-w-4xl';
      break;
    case 'xl':
      sizeStyles = 'max-w-full sm:max-w-4xl xl:max-w-6xl';
      break;
  }
  
  return (
    <div 
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full ${sizeStyles} max-h-[85vh] sm:max-h-[90vh] flex flex-col ${className}`}
        style={{ maxHeight: 'calc(100vh - env(safe-area-inset-bottom) - env(safe-area-inset-top))' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-900 pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 rounded-full hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors touch-manipulation"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

export { Modal };
export type { ModalProps };