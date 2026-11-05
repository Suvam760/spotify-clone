import { CheckCircle2, Play, Shuffle, X, Heart } from 'lucide-react';

export const ArtistModal = ({
  artist,
  isOpen,
  onClose,
  onPlayAll,
  isFavorite,
  onToggleFavoriteArtist
}) => {
  if (!isOpen || !artist) return null;

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-card-artist" onClick={(e) => e.stopPropagation()} role="dialog">
        {/* Banner with Artist Image */}
        <div className="artist-modal-banner" style={{ backgroundImage: `url(${artist.image})` }}>
          <div className="artist-banner-overlay" />
          <button className="artist-modal-close-btn" onClick={onClose} aria-label="Close artist">
            <X size={20} />
          </button>
          <div className="artist-banner-info">
            <div className="verified-badge-row">
              <CheckCircle2 size={16} color="#38bdf8" />
              <span>Verified Creator</span>
            </div>
            <h1 className="artist-banner-name">{artist.name}</h1>
            <span className="artist-banner-listeners">{artist.listeners || '40M+ monthly listeners'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="artist-modal-body">
          <div className="artist-actions-bar">
            <button
              className="btn-accent-pill"
              onClick={() => onPlayAll?.(artist.query, artist.name)}
            >
              <Play size={16} fill="currentColor" />
              <span>Play Catalog</span>
            </button>
            <button
              className="btn-outline-pill"
              onClick={() => onPlayAll?.(artist.query, artist.name, true)}
            >
              <Shuffle size={16} />
              <span>Shuffle</span>
            </button>
            {onToggleFavoriteArtist && (
              <button
                className={`artist-heart-pill ${isFavorite ? 'active' : ''}`}
                onClick={() => onToggleFavoriteArtist(artist)}
              >
                <Heart size={16} fill={isFavorite ? '#ec4899' : 'none'} color={isFavorite ? '#ec4899' : 'currentColor'} />
                <span>{isFavorite ? 'Following' : 'Follow'}</span>
              </button>
            )}
          </div>

          <div className="artist-bio-box">
            <h4 className="artist-section-title">About the Artist</h4>
            <p className="artist-bio-text">{artist.bio || `${artist.name} is one of the most prominent musical artists with millions of fans across the globe.`}</p>
          </div>

          <div className="artist-quick-tracks">
            <h4 className="artist-section-title">Popular Releases & Songs</h4>
            <p className="artist-quick-note">Click Play Catalog above to stream {artist.name}'s biggest chart-topping hits directly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
