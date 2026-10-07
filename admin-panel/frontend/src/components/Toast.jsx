import React from 'react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div>
      {toasts.map(toast => (
        <div key={toast.id} className="toast">
          {toast.message}
          <button onClick={() => onDismiss(toast.id)}>X</button>
        </div>
      ))}
    </div>
  );
}
