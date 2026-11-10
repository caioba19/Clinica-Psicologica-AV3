import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'danger';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  confirmAction: (message: string, onConfirm: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });

  const showToast = (message: string, type: ToastType = 'info', duration: number = 3200) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const confirmAction = (message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      message,
      onConfirm
    });
  };

  const handleConfirm = () => {
    confirmModal.onConfirm();
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const iconFor = (type: ToastType) => {
    if (type === 'success') return 'bi-check-circle';
    if (type === 'error' || type === 'danger') return 'bi-exclamation-circle';
    if (type === 'warning') return 'bi-exclamation-triangle';
    return 'bi-info-circle';
  };

  return (
    <ToastContext.Provider value={{ showToast, confirmAction }}>
      {children}

      {/* Toast Stack */}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`app-toast ${toast.type} show`} role="status">
            <i className={`bi ${iconFor(toast.type)}`} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="modal-backdrop-custom open" onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}>
          <div className="modal-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirmar ação</h2>
              <button
                className="action-btn"
                type="button"
                aria-label="Fechar"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {confirmModal.message || 'Deseja continuar?'}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-ghost"
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Cancelar
              </button>
              <button className="btn-accent" type="button" onClick={handleConfirm}>
                <i className="bi bi-check-lg me-1"></i> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
