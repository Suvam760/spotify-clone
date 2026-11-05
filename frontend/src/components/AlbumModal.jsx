import { Play, Shuffle, X, Disc3 } from 'lucide-react';

export const AlbumModal = ({
  album,
  isOpen,
  onClose,
  onPlayAlbum
}) => {
  if (!isOpen || !album) return null;

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-card-sleek" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="modal-header-row">
          <div className="album-header-wrap">
            <img src={album.cover} alt={album.title} className="album-header-cover" />
            <div>
              <span className="album-type-badge">ALBUM</span>
              <h2 className="album-header-title">{album.title}</h2>
              <p className="album-header-sub">
                {album.artist} · {album.year} · {album.tracksCount} tracks
              </p>
            </div>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close album">
            <X size={20} />
          </button>
        </header>

        <div className="album-modal-actions">
          <button
            className="btn-accent-pill"
            onClick={() => onPlayAlbum?.(album, false)}
          >
            <Play size={16} fill="currentColor" />
            <span>Play Album</span>
          </button>
          <button
            className="btn-outline-pill"
            onClick={() => onPlayAlbum?.(album, true)}
          >
            <Shuffle size={16} />
            <span>Shuffle</span>
          </button>
        </div>

        <div className="album-track-preview-box">
          <Disc3 size={24} className="album-disc-icon spin-slow" />
          <div>
            <h4>Experience the complete record</h4>
            <p>Stream all {album.tracksCount} tracks from {album.title} in original studio fidelity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
