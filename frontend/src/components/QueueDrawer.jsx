import { ListFilter, Trash2, X, Music2, Shuffle } from 'lucide-react';

export const QueueDrawer = ({
  isOpen,
  onClose,
  currentTrack,
  queue,
  isPlaying,
  onPlayTrack,
  onRemoveTrack,
  onClearQueue,
  onShuffleQueue
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="queue-drawer-backdrop" onClick={onClose} />
      <aside className="queue-drawer-panel" role="dialog" aria-label="Playback queue">
        <div className="queue-header">
          <div className="queue-title-wrap">
            <ListFilter size={20} className="queue-icon" />
            <div>
              <h3>Play Queue</h3>
              <p>{queue.length} track{queue.length === 1 ? '' : 's'} in queue</p>
            </div>
          </div>
          <button className="queue-close-btn" onClick={onClose} aria-label="Close queue">
            <X size={20} />
          </button>
        </div>

        {/* Current Playing Track in Queue */}
        {currentTrack && currentTrack.videoId && (
          <div className="queue-current-section">
            <span className="queue-section-label">NOW PLAYING</span>
            <div className="queue-current-card">
              <div className="queue-thumb-wrap">
                <img src={currentTrack.cover} alt={currentTrack.title} />
                {isPlaying && (
                  <div className="playing-pulse-indicator">
                    <span /><span /><span />
                  </div>
                )}
              </div>
              <div className="queue-track-meta">
                <h4 className="queue-track-title" title={currentTrack.title}>{currentTrack.title}</h4>
                <p className="queue-track-artist" title={currentTrack.artist}>{currentTrack.artist}</p>
              </div>
              <span className="queue-track-time">{currentTrack.duration}</span>
            </div>
          </div>
        )}

        {/* Next Up List */}
        <div className="queue-next-section">
          <div className="queue-next-header">
            <span className="queue-section-label">NEXT UP</span>
            <div className="queue-actions-group">
              {queue.length > 2 && (
                <button className="queue-action-btn" onClick={onShuffleQueue} title="Shuffle remaining queue">
                  <Shuffle size={14} />
                  <span>Shuffle</span>
                </button>
              )}
              {queue.length > 1 && (
                <button className="queue-action-btn danger" onClick={onClearQueue} title="Clear queue">
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="queue-items-scroll">
            {queue.filter((t) => t.id !== currentTrack.id).length === 0 ? (
              <div className="queue-empty-box">
                <Music2 size={32} />
                <p>No more tracks in queue.</p>
                <small>Select any song or mix to keep playing.</small>
              </div>
            ) : (
              queue
                .filter((t) => t.id !== currentTrack.id)
                .map((track, idx) => (
                  <div key={`${track.id}-${idx}`} className="queue-item-row">
                    <span className="queue-item-index">{idx + 1}</span>
                    <button
                      className="queue-item-play-btn"
                      onClick={() => onPlayTrack(track)}
                      title={`Play ${track.title}`}
                    >
                      <img src={track.cover} alt="" className="queue-item-thumb" />
                      <div className="queue-item-text">
                        <span className="queue-item-title" title={track.title}>{track.title}</span>
                        <span className="queue-item-artist" title={track.artist}>{track.artist}</span>
                      </div>
                    </button>
                    <span className="queue-item-duration">{track.duration}</span>
                    <button
                      className="queue-item-remove-btn"
                      onClick={() => onRemoveTrack(track.id)}
                      title="Remove from queue"
                      aria-label="Remove"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
