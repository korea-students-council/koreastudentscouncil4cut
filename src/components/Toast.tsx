import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'info' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000, type = 'success' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-emerald-600',
      icon: '✓',
    },
    info: {
      bg: 'bg-blue-600',
      icon: 'ℹ',
    },
    error: {
      bg: 'bg-red-600',
      icon: '✕',
    },
  }[type];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down px-4 max-w-sm w-full">
      <div className={`${styles.bg} text-white rounded-xl shadow-lg`}>
        <div className="flex items-start gap-2 px-3 py-2.5">
          <div className="flex items-center justify-center flex-shrink-0 pt-0.5">
            <span className="text-base font-bold">{styles.icon}</span>
          </div>
          <p className="text-xs font-medium leading-snug flex-1" style={{ wordBreak: 'keep-all' }}>
            {message.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < message.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Toast;
