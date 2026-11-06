import { useState } from 'react';
import { Check, Moon, Sun, Sparkles, X, ShieldCheck, LogOut, KeyRound, Camera } from 'lucide-react';
import { ProfilePictureModal } from './ProfilePictureModal';

export const ProfileModal = ({
  user,
  onUpdateUser,
  theme,
  onSelectTheme,
  isOpen,
  onClose,
  onOpenAuth,
  onLogout
}) => {
  const [name, setName] = useState(user?.name || 'Music Lover');
  const [handle, setHandle] = useState(user?.handle || '@musiclover');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saved, setSaved] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

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
            <div
              className="current-profile-avatar-wrap"
              onClick={() => setIsAvatarPickerOpen(true)}
              title="Click to open Avatar Studio & Upload"
            >
              <img src={avatar || user?.avatar} alt="" className="current-profile-avatar" />
              <div className="avatar-change-overlay">
                <Camera size={18} />
                <span>Change</span>
              </div>
            </div>
            <div className="avatar-select-info">
              <div className="avatar-label-row">
                <span className="avatar-pick-label">Profile Avatar</span>
                <button
                  type="button"
                  className="avatar-edit-badge-btn"
                  onClick={() => setIsAvatarPickerOpen(true)}
                >
                  <Camera size={13} />
                  <span>Avatar Studio & Upload</span>
                </button>
              </div>
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

          {/* Membership & Auth Badge */}
          <div className="membership-box">
            <ShieldCheck size={18} color="#a855f7" />
            <div>
              <h5>{user?.isLoggedIn ? 'Nexa Verified Hi-Fi Member' : 'Guest Listener'}</h5>
              <p>
                {user?.isLoggedIn
                  ? `Authenticated session active (${user.phone || user.email || user.handle})`
                  : 'Sign in with your phone or email OTP for persistent cloud playlists.'}
              </p>
            </div>
          </div>

          <div className="profile-actions-row">
            <button type="submit" className="btn-accent-pill">
              {saved ? <Check size={16} /> : null}
              <span>{saved ? 'Saved!' : 'Save Changes'}</span>
            </button>
            {user?.isLoggedIn ? (
              <button
                type="button"
                className="btn-outline-pill profile-logout-btn"
                onClick={() => {
                  onClose();
                  onLogout?.();
                }}
                title="Log out from this device"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-outline-pill profile-signin-btn"
                onClick={() => {
                  onClose();
                  onOpenAuth?.();
                }}
              >
                <KeyRound size={15} color="#a855f7" />
                <span>Sign In (OTP)</span>
              </button>
            )}
            <button type="button" className="btn-outline-pill" onClick={onClose}>
              Close
            </button>
          </div>
        </form>

        {/* Dedicated Profile Picture Selection & Upload Modal */}
        <ProfilePictureModal
          isOpen={isAvatarPickerOpen}
          onClose={() => setIsAvatarPickerOpen(false)}
          currentAvatar={avatar || user?.avatar}
          userName={name}
          onSelectAvatar={(newUrl) => {
            setAvatar(newUrl);
          }}
        />
      </div>
    </div>
  );
};
