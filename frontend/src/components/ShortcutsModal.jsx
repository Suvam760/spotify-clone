import { Keyboard, X } from 'lucide-react';

export const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause music' },
    { key: '→ / ←', desc: 'Seek 5s forward / backward' },
    { key: '↑ / ↓', desc: 'Volume up / down (5%)' },
    { key: 'M', desc: 'Mute / Unmute sound' },
    { key: 'L', desc: 'Like / Save current song' },
    { key: 'Q', desc: 'Toggle Playback Queue' },
    { key: 'C', desc: 'Toggle Karaoke Lyrics' },
    { key: 'V', desc: 'Toggle Music Video screen' },
    { key: 'Ctrl + K', desc: 'Focus Search bar' },
    { key: 'Esc', desc: 'Close any modal / drawer' }
  ];

  return (
    <div className="shortcuts-modal-backdrop" onClick={onClose}>
      <div
        className="shortcuts-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shortcuts-modal-header">
          <div className="shortcuts-title-wrap">
            <Keyboard size={20} className="shortcuts-icon" />
            <div>
              <h3>Keyboard Shortcuts</h3>
              <p>Quick desktop controls for seamless listening</p>
            </div>
          </div>
          <button className="close-shortcuts-btn" onClick={onClose} aria-label="Close shortcuts">
            <X size={20} />
          </button>
        </div>

        <div className="shortcuts-list-grid">
          {shortcuts.map((s) => (
            <div key={s.key} className="shortcut-row">
              <span className="shortcut-desc">{s.desc}</span>
              <kbd className="shortcut-key-badge">{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
