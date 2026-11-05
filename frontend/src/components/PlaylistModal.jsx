import { useState } from 'react';
import { Plus, Trash2, X, Music, Play, Shuffle, Check } from 'lucide-react';

export const PlaylistModal = ({
  isOpen,
  onClose,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlayPlaylist,
  onSelectPlaylist,
  activePlaylist,
  onRemoveTrackFromPlaylist,
  addingTrack,
  onAddTrackToPlaylist
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreatePlaylist({
      name: name.trim(),
      description: description.trim() || 'Custom user playlist',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80'
    });
    setName('');
    setDescription('');
    setIsCreating(false);
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-card-sleek" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="modal-header-row">
          <div>
            <h3 className="modal-heading">
              {addingTrack ? `Add to Playlist` : activePlaylist ? activePlaylist.name : 'Your Playlists'}
            </h3>
            <p className="modal-subheading">
              {addingTrack
                ? `Choose a playlist for “${addingTrack.title}”`
                : activePlaylist
                ? activePlaylist.description
                : `${playlists.length} playlists saved`}
            </p>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </header>

        {/* Adding track mode: list playlists with quick add button */}
        {addingTrack ? (
          <div className="playlist-selection-list">
            {playlists.map((pl) => {
              const alreadyHas = pl.tracks?.some((t) => t.id === addingTrack.id);
              return (
                <div key={pl.id} className="playlist-select-item">
                  <img src={pl.cover} alt="" className="playlist-mini-thumb" />
                  <div className="playlist-select-meta">
                    <span className="pl-name">{pl.name}</span>
                    <span className="pl-count">{pl.tracks?.length || 0} songs</span>
                  </div>
                  <button
                    className={`pl-add-action-btn ${alreadyHas ? 'already-added' : ''}`}
                    onClick={() => {
                      if (!alreadyHas) onAddTrackToPlaylist(pl.id, addingTrack);
                    }}
                    disabled={alreadyHas}
                  >
                    {alreadyHas ? <Check size={16} /> : <Plus size={16} />}
                    <span>{alreadyHas ? 'Added' : 'Add'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : activePlaylist ? (
          /* Viewing single playlist */
          <div className="playlist-detail-view">
            <div className="playlist-action-bar">
              <button
                className="btn-accent-pill"
                onClick={() => onPlayPlaylist(activePlaylist, false)}
                disabled={!activePlaylist.tracks?.length}
              >
                <Play size={16} fill="currentColor" />
                <span>Play All</span>
              </button>
              <button
                className="btn-outline-pill"
                onClick={() => onPlayPlaylist(activePlaylist, true)}
                disabled={!activePlaylist.tracks?.length}
              >
                <Shuffle size={16} />
                <span>Shuffle</span>
              </button>
              {activePlaylist.isCustom !== false && (
                <button
                  className="btn-danger-pill"
                  onClick={() => {
                    onDeletePlaylist(activePlaylist.id);
                    onSelectPlaylist(null);
                  }}
                  title="Delete playlist"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="playlist-tracklist-scroll">
              {(!activePlaylist.tracks || activePlaylist.tracks.length === 0) ? (
                <div className="empty-playlist-notice">
                  <Music size={32} />
                  <p>This playlist has no songs yet.</p>
                  <small>Browse songs and tap “Add to playlist” to start building it.</small>
                </div>
              ) : (
                activePlaylist.tracks.map((track, idx) => (
                  <div key={`${track.id}-${idx}`} className="playlist-track-row">
                    <span className="track-number">{idx + 1}</span>
                    <img src={track.cover} alt="" className="track-row-thumb" />
                    <div className="track-row-info">
                      <span className="track-row-title">{track.title}</span>
                      <span className="track-row-artist">{track.artist}</span>
                    </div>
                    <span className="track-row-duration">{track.duration}</span>
                    {onRemoveTrackFromPlaylist && (
                      <button
                        className="track-row-remove-btn"
                        onClick={() => onRemoveTrackFromPlaylist(activePlaylist.id, track.id)}
                        title="Remove from playlist"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* General Playlists list */
          <div className="playlists-overview">
            {!isCreating && (
              <button className="create-playlist-trigger-btn" onClick={() => setIsCreating(true)}>
                <Plus size={18} />
                <span>Create New Playlist</span>
              </button>
            )}

            {isCreating && (
              <form className="create-playlist-form" onSubmit={handleCreate}>
                <input
                  type="text"
                  className="modal-text-input"
                  placeholder="Playlist name (e.g. Chill Beats)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
                <input
                  type="text"
                  className="modal-text-input"
                  placeholder="Short description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="form-buttons-row">
                  <button type="submit" className="btn-accent-pill">Save Playlist</button>
                  <button type="button" className="btn-outline-pill" onClick={() => setIsCreating(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="playlists-grid">
              {playlists.map((pl) => (
                <div key={pl.id} className="playlist-card-item" onClick={() => onSelectPlaylist(pl)}>
                  <img src={pl.cover} alt="" className="playlist-card-cover" />
                  <div className="playlist-card-meta">
                    <h5 className="pl-card-title">{pl.name}</h5>
                    <span className="pl-card-count">{pl.tracks?.length || 0} tracks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

