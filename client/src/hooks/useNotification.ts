import { useState, useCallback } from 'react';
import type { NotificationMode } from '@/components/ui/NotificationModal';

interface NotificationState {
  isOpen: boolean;
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

const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    mode: 'info',
    title: '',
    message: '',
  });

  const showNotification = useCallback((config: Omit<NotificationState, 'isOpen'>) => {
    setNotification({
      ...config,
      isOpen: true,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((title: string, message: string, options?: Partial<NotificationState>) => {
    showNotification({
      mode: 'success',
      title,
      message,
      autoClose: true,
      autoCloseDelay: 3000,
      ...options,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<NotificationState>) => {
    showNotification({
      mode: 'error',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<NotificationState>) => {
    showNotification({
      mode: 'warning',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<NotificationState>) => {
    showNotification({
      mode: 'info',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void,
    options?: Partial<NotificationState>
  ) => {
    showNotification({
      mode: 'warning',
      title,
      message,
      onConfirm,
      showCancel: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      ...options,
    });
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
};

export default useNotification;