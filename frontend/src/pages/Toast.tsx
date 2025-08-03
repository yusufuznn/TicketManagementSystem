import React from 'react';

const Toast: React.FC<{ message: string; type?: 'success' | 'error'; onClose: () => void }> = ({ message, type = 'success', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: type === 'success' ? '#4caf50' : '#f44336',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 2000,
      minWidth: 200,
      fontWeight: 500
    }}>
      {message}
    </div>
  );
};

export default Toast; 