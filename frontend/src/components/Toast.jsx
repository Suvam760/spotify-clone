import { CheckCircle2, Heart, Info, ListPlus, Sparkles, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    like: <Heart size={16} fill="#ec4899" color="#ec4899" />,
    queue: <ListPlus size={16} color="#38bdf8" />,
    success: <CheckCircle2 size={16} color="#38bdf8" />,
    info: <Info size={16} color="#8b5cf6" />
  };

  return (
    <div className="toast-notification-wrap">
      <div className={`toast-notification-card ${toast.type || 'info'}`}>
        <span className="toast-icon-wrap">{icons[toast.type] || <Sparkles size={16} />}</span>
        <span className="toast-message">{toast.message}</span>
        <button className="toast-close-btn" onClick={onClose} aria-label="Dismiss notification">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
