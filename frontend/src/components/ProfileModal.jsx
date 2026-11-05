import { useState } from 'react';
import { Check, Moon, Sun, Sparkles, X, ShieldCheck } from 'lucide-react';

export const ProfileModal = ({
  user,
  onUpdateUser,
  theme,
  onSelectTheme,
  isOpen,
  onClose
}) => {
  const [name, setName] = useState(user?.name || 'Music Lover');
  const [handle, setHandle] = useState(user?.handle || '@musiclover');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80'
  ];

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: name.trim(),
      handle: handle.trim(),
      avatar
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-card-sleek" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="modal-header-row">
          <div>
            <h3 className="modal-heading">Account & Profile</h3>
            <p className="modal-subheading">Personalize your identity and preferences</p>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close profile">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSave} className="profile-edit-form">
          {/* Avatar Picker */}
          <div className="profile-avatar-select-block">
            <img src={avatar || user?.avatar} alt="" className="current-profile-avatar" />
            <div>
              <span className="avatar-pick-label">Select Avatar</span>
              <div className="avatar-thumbs-row">
                {sampleAvatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className={`avatar-choice-thumb ${avatar === url ? 'selected' : ''}`}
                    onClick={() => setAvatar(url)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="profile-inputs-block">
            <label className="input-field-label">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="modal-text-input"
              required
            />

            <label className="input-field-label">User Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="modal-text-input"
              required
            />
          </div>

          {/* Theme Selector */}
          <div className="theme-select-block">
            <label className="input-field-label">UI Theme</label>
            <div className="theme-buttons-row">
              <button
                type="button"
                className={`theme-pill ${theme === 'dark-neon' ? 'active' : ''}`}
                onClick={() => onSelectTheme('dark-neon')}
              >
                <Sparkles size={14} color="#a855f7" />
                <span>Midnight Violet</span>
              </button>
              <button
                type="button"
                className={`theme-pill ${theme === 'cyber-pink' ? 'active' : ''}`}
                onClick={() => onSelectTheme('cyber-pink')}
              >
                <Moon size={14} color="#ec4899" />
                <span>Cyberpunk</span>
              </button>
              <button
                type="button"
                className={`theme-pill ${theme === 'light' ? 'active' : ''}`}
                onClick={() => onSelectTheme('light')}
              >
                <Sun size={14} color="#f59e0b" />
                <span>Clean Light</span>
              </button>
            </div>
          </div>

          {/* Membership Badge */}
          <div className="membership-box">
            <ShieldCheck size={18} color="#a855f7" />
            <div>
              <h5>Nexa Premium · Lossless Hi-Fi</h5>
              <p>Unlimited high bitrate streaming, zero ads, synchronized lyrics.</p>
            </div>
          </div>

          <div className="profile-actions-row">
            <button type="submit" className="btn-accent-pill">
              {saved ? <Check size={16} /> : null}
              <span>{saved ? 'Saved!' : 'Save Changes'}</span>
            </button>
            <button type="button" className="btn-outline-pill" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
