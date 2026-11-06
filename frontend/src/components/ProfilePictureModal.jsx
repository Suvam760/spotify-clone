import { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link,
  Sparkles,
  Check,
  Camera,
  Image as ImageIcon,
  Palette
} from 'lucide-react';

const CURATED_AVATARS = [
  {
    category: 'Cyberpunk & Music',
    avatars: [
      { id: 'cp-1', name: 'Neon Glow', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { id: 'cp-2', name: 'Headphones Vibe', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80' },
      { id: 'cp-3', name: 'Retro Synth', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80' },
      { id: 'cp-4', name: 'Midnight Disco', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80' },
      { id: 'cp-5', name: 'Stage Lights', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80' },
      { id: 'cp-6', name: 'Concert Energy', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    category: 'Aesthetic Portraits',
    avatars: [
      { id: 'ap-1', name: 'Warm Sunset', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
      { id: 'ap-2', name: 'Chill Natural', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      { id: 'ap-3', name: 'Ethereal Rose', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
      { id: 'ap-4', name: 'Golden Hour', url: 'https://images.unsplash.com/photo-1520523839898-507121657f33?auto=format&fit=crop&w=300&q=80' },
      { id: 'ap-5', name: 'Vintage Studio', url: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=300&q=80' },
      { id: 'ap-6', name: 'Clean Minimal', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    category: 'Illustrated & 3D Avatars',
    avatars: [
      { id: 'ill-1', name: 'Cyber DJ Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberDJ9' },
      { id: 'ill-2', name: 'Electro Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AestheticMusic1' },
      { id: 'ill-3', name: 'Neon Wanderer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NeonVibe' },
      { id: 'ill-4', name: 'Chill Hop Boy', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChillHop' },
      { id: 'ill-5', name: 'Synth Girl', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Synthesizer' },
      { id: 'ill-6', name: 'Melody Muse', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Melody' }
    ]
  }
];

const GRADIENT_PALETTES = [
  { id: 'violet-sunset', name: 'Violet Sunset', grad: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)' },
  { id: 'cyber-cyan', name: 'Electric Cyan', grad: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
  { id: 'neon-rose', name: 'Neon Rose', grad: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' },
  { id: 'amber-fire', name: 'Amber Flame', grad: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  { id: 'deep-space', name: 'Midnight Aurora', grad: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #8b5cf6 100%)' },
  { id: 'emerald-mint', name: 'Mystic Mint', grad: 'linear-gradient(135deg, #059669 0%, #06b6d4 100%)' }
];

export const ProfilePictureModal = ({
  isOpen,
  onClose,
  currentAvatar,
  userName = 'User',
  onSelectAvatar
}) => {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload' | 'url' | 'gradient'
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(currentAvatar || '');
  const [inputUrl, setInputUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CURATED_AVATARS[0].category);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Initials generator
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const generateInitialsAvatar = (gradientString) => {
    const initials = getInitials(userName);
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Draw gradient background
    const grad = ctx.createLinearGradient(0, 0, 300, 300);
    if (gradientString.includes('#7c3aed')) {
      grad.addColorStop(0, '#7c3aed');
      grad.addColorStop(1, '#ec4899');
    } else if (gradientString.includes('#06b6d4')) {
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');
    } else if (gradientString.includes('#f43f5e')) {
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(1, '#a855f7');
    } else if (gradientString.includes('#f59e0b')) {
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(1, '#ef4444');
    } else if (gradientString.includes('#1e1b4b')) {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#4338ca');
      grad.addColorStop(1, '#8b5cf6');
    } else {
      grad.addColorStop(0, '#059669');
      grad.addColorStop(1, '#06b6d4');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 300);

    // Draw typography
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 110px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 150, 155);

    return canvas.toDataURL('image/png');
  };

  // Handle local file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size exceeds 8MB. Please choose a smaller image.');
      return;
    }

    setIsProcessingUpload(true);
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize & resize on canvas (max 400x400) to keep localStorage lightweight
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setSelectedAvatarUrl(dataUrl);
        setIsProcessingUpload(false);
      };
      img.onerror = () => {
        setUploadError('Failed to process image. Try another file.');
        setIsProcessingUpload(false);
      };
      img.src = event.target?.result;
    };
    reader.onerror = () => {
      setUploadError('Failed to read image.');
      setIsProcessingUpload(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle custom URL
  const handleApplyUrl = (e) => {
    e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setUrlError('Please enter an image URL.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setUrlError('URL must start with http:// or https://');
      return;
    }

    setUrlError('');
    setSelectedAvatarUrl(trimmed);
  };

  const handleConfirm = () => {
    if (selectedAvatarUrl) {
      onSelectAvatar(selectedAvatarUrl);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-card-sleek profile-picture-modal-card" onClick={(e) => e.stopPropagation()} role="dialog">
        {/* Header */}
        <header className="modal-header-row">
          <div className="avatar-modal-title-wrap">
            <div className="avatar-modal-badge">
              <Camera size={16} color="#a855f7" />
              <span>AVATAR STUDIO</span>
            </div>
            <h3 className="modal-heading">Choose Profile Picture</h3>
            <p className="modal-subheading">Select from curated aesthetic avatars, upload your own photo, or create custom initials.</p>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close avatar modal">
            <X size={20} />
          </button>
        </header>

        {/* Live Preview Box */}
        <div className="avatar-preview-stage">
          <div className="avatar-preview-ring">
            <img
              src={selectedAvatarUrl}
              alt="Avatar Preview"
              className="avatar-preview-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
              }}
            />
            <div className="avatar-preview-glow" />
          </div>
          <div className="avatar-preview-meta">
            <h4 className="preview-user-name">{userName}</h4>
            <span className="preview-status-pill">
              <Sparkles size={12} color="#a855f7" />
              <span>Live Avatar Preview</span>
            </span>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="avatar-tabs-nav">
          <button
            className={`avatar-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <ImageIcon size={15} />
            <span>Curated Gallery</span>
          </button>
          <button
            className={`avatar-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={15} />
            <span>Upload Photo</span>
          </button>
          <button
            className={`avatar-tab-btn ${activeTab === 'gradient' ? 'active' : ''}`}
            onClick={() => setActiveTab('gradient')}
          >
            <Palette size={15} />
            <span>Gradient Initials</span>
          </button>
          <button
            className={`avatar-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            <Link size={15} />
            <span>Image URL</span>
          </button>
        </div>

        {/* Tab 1: Curated Gallery */}
        {activeTab === 'gallery' && (
          <div className="avatar-tab-content gallery-tab">
            <div className="avatar-category-chips">
              {CURATED_AVATARS.map((cat) => (
                <button
                  key={cat.category}
                  className={`category-pill-sm ${selectedCategory === cat.category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            <div className="avatar-grid-scroll">
              {CURATED_AVATARS.find((c) => c.category === selectedCategory)?.avatars.map((av) => {
                const isSelected = selectedAvatarUrl === av.url;
                return (
                  <button
                    key={av.id}
                    className={`avatar-select-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatarUrl(av.url)}
                    title={av.name}
                  >
                    <img src={av.url} alt={av.name} className="avatar-tile-img" />
                    {isSelected && (
                      <div className="avatar-tile-check">
                        <Check size={14} color="#ffffff" />
                      </div>
                    )}
                    <span className="avatar-tile-label">{av.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Photo */}
        {activeTab === 'upload' && (
          <div className="avatar-tab-content upload-tab">
            <div
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden-file-input"
                onChange={handleFileChange}
              />
              <div className="dropzone-icon-circle">
                <Upload size={24} color="#a855f7" />
              </div>
              <h4 className="dropzone-title">Upload a picture from your device</h4>
              <p className="dropzone-desc">PNG, JPG, or WEBP up to 8MB. Automatically optimized for your profile.</p>
              <button
                type="button"
                className="btn-accent-pill dropzone-browse-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <span>Browse Files</span>
              </button>
            </div>

            {isProcessingUpload && (
              <div className="upload-status-box">
                <span className="upload-spinner" />
                <span>Optimizing avatar…</span>
              </div>
            )}

            {uploadError && (
              <p className="upload-error-text">{uploadError}</p>
            )}
          </div>
        )}

        {/* Tab 3: Gradient Initials Generator */}
        {activeTab === 'gradient' && (
          <div className="avatar-tab-content gradient-tab">
            <p className="tab-helper-text">Select an aesthetic gradient theme. Your initials ({getInitials(userName)}) will be rendered in high resolution:</p>
            <div className="gradient-palettes-grid">
              {GRADIENT_PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  className="gradient-choice-card"
                  style={{ background: pal.grad }}
                  onClick={() => {
                    const generated = generateInitialsAvatar(pal.grad);
                    setSelectedAvatarUrl(generated);
                  }}
                >
                  <span className="grad-initials-preview">{getInitials(userName)}</span>
                  <span className="grad-pal-name">{pal.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Image URL */}
        {activeTab === 'url' && (
          <form className="avatar-tab-content url-tab" onSubmit={handleApplyUrl}>
            <label className="input-field-label">Paste Direct Image Link</label>
            <div className="url-input-action-row">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="modal-text-input"
              />
              <button type="submit" className="btn-accent-pill">
                <span>Preview</span>
              </button>
            </div>
            {urlError && <p className="upload-error-text">{urlError}</p>}
            <p className="tab-helper-text">Tip: Right-click any web image and choose &ldquo;Copy image address&rdquo; to paste it here.</p>
          </form>
        )}

        {/* Modal Actions */}
        <footer className="avatar-modal-footer">
          <button
            type="button"
            className="btn-outline-pill"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-accent-pill"
            onClick={handleConfirm}
          >
            <Check size={16} />
            <span>Apply as Profile Picture</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

