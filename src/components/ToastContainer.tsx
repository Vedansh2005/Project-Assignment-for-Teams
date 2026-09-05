import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let icon = <CheckCircle size={18} color="#10b981" />;
        if (toast.type === 'warning') icon = <AlertTriangle size={18} color="#f59e0b" />;
        if (toast.type === 'error') icon = <XCircle size={18} color="#f43f5e" />;
        if (toast.type === 'info') icon = <Info size={18} color="#6366f1" />;

        return (
          <div key={toast.id} className="toast">
            {icon}
            <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500 }}>
              {toast.title}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                padding: '0.2rem'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
