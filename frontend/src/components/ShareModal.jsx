import { useState } from 'react';
import { Check, Copy, Share2, X, MessageCircle } from 'lucide-react';

export const ShareModal = ({
  item,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !item) return null;

  const shareUrl = item.url || window.location.href;
  const shareTitle = item.title || item.name || 'Nexa Music';

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: `Listen to ${shareTitle} on Nexa Music!`,
        url: shareUrl
      }).catch(() => {});
    }
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-card-sleek" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="modal-header-row">
          <div>
            <h3 className="modal-heading">Share Track</h3>
            <p className="modal-subheading">Send “{shareTitle}” to your friends</p>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close share">
            <X size={20} />
          </button>
        </header>

        <div className="share-link-input-row">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="share-url-box"
          />
          <button className="copy-link-btn" onClick={handleCopy}>
            {copied ? <Check size={16} color="#38bdf8" /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <div className="share-buttons-row">
          {typeof navigator !== 'undefined' && Boolean(navigator.share) && (
            <button className="btn-accent-pill" onClick={handleNativeShare}>
              <Share2 size={16} />
              <span>Share via Device</span>
            </button>
          )}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${shareTitle}: ${shareUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline-pill"
          >
            <MessageCircle size={16} color="#25D366" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

