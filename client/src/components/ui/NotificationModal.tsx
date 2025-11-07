import React from 'react';

export type NotificationMode = 'success' | 'error' | 'warning' | 'info';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: NotificationMode;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  mode,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = false,
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const getModalStyles = () => {
    switch (mode) {
      case 'success':
        return {
          backgroundColor: 'var(--parchment)',
          borderColor: 'var(--mocha)',
          iconColor: 'var(--mocha)',
          icon: '✓',
        };
      case 'error':
        return {
          backgroundColor: 'var(--parchment)',
          borderColor: '#dc2626',
          iconColor: '#dc2626',
          icon: '✕',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--parchment)',
          borderColor: '#f59e0b',
          iconColor: '#f59e0b',
          icon: '⚠',
        };
      case 'info':
        return {
          backgroundColor: 'var(--parchment)',
          borderColor: 'var(--arabica-brown)',
          iconColor: 'var(--arabica-brown)',
          icon: 'ℹ',
        };
      default:
        return {
          backgroundColor: 'var(--parchment)',
          borderColor: 'var(--arabica-brown)',
          iconColor: 'var(--arabica-brown)',
          icon: 'ℹ',
        };
    }
  };

  const styles = getModalStyles();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65  backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-md mx-4 rounded-lg shadow-xl border-2 animate-fade-in"
        style={{ 
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor 
        }}
      >
        {/* Header with Icon */}
        <div className="flex items-center p-6 pb-4">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-full mr-4 text-2xl font-bold"
            style={{ 
              backgroundColor: `${styles.iconColor}20`,
              color: styles.iconColor 
            }}
          >
            {styles.icon}
          </div>
          <div className="flex-1">
            <h3 
              className="text-lg font-semibold font-main"
              style={{ color: 'var(--espresso-black)' }}
            >
              {title}
            </h3>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="button-accent text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message Content */}
        <div className="px-6 pb-6">
          <p 
            className="text-sm font-accent leading-relaxed"
            style={{ color: 'var(--coffee-gray)' }}
          >
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          {showCancel && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors font-accent"
              style={{
                borderColor: 'var(--ash-gray)',
                color: 'var(--coffee-gray)',
                backgroundColor: 'var(--white)'
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors font-accent"
            style={{
              backgroundColor: styles.iconColor,
              color: 'var(--white)',
              border: `1px solid ${styles.iconColor}`
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;