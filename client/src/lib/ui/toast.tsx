import React from 'react';

// Extremely lightweight toast system (in-memory) - replace with a more robust solution later.
// Usage: toast.success('Saved'); toast.error('Failed');

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
  timeout?: number;
}

let listeners: React.Dispatch<React.SetStateAction<ToastMessage[]>>[] = [];
let counter = 0;

function push(message: Omit<ToastMessage, 'id'>) {
  const toast: ToastMessage = { id: ++counter, timeout: 4000, ...message };
  listeners.forEach(l => l(prev => [...prev, toast]));
  if (toast.timeout) {
    setTimeout(() => {
      listeners.forEach(l => l(prev => prev.filter(t => t.id !== toast.id)));
    }, toast.timeout);
  }
}

export const toast = {
  success(text: string) { push({ type: 'success', text }); },
  error(text: string) { push({ type: 'error', text, timeout: 6000 }); },
  info(text: string) { push({ type: 'info', text }); }
};

export const ToastViewport: React.FC = () => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  React.useEffect(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter(l => l !== setToasts); };
  }, []);
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#7f1d1d' : t.type === 'success' ? '#065f46' : '#374151',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 14,
          boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
        }}>
          {t.text}
        </div>
      ))}
    </div>
  );
};
