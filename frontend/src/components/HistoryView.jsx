import { Clock3, Trash2, Music2 } from 'lucide-react';
import { TrackCard } from './TrackCard';

export const HistoryView = ({
  recentlyPlayed,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onClearHistory,
  onToggleLike,
  favorites,
  onAddToQueue,
  onAddToPlaylist,
  onShare
}) => {
  return (
    <section className="page-section history-page">
      <div className="section-header-row">
        <div>
          <span className="eyebrow"><Clock3 size={14} color="#38bdf8" /> PLAYBACK TIMELINE</span>
          <h2 className="section-heading">Listening History ({recentlyPlayed.length})</h2>
          <p className="section-subtext">Review and replay tracks you've streamed recently.</p>
        </div>

        {recentlyPlayed.length > 0 && (
          <button
            className="btn-danger-pill"
            onClick={onClearHistory}
            title="Clear all history"
          >
            <Trash2 size={15} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {recentlyPlayed.length > 0 ? (
        <div className="cards-grid compact-cards-grid">
          {recentlyPlayed.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isCurrentPlaying={currentTrack.id === track.id}
              isPlaying={isPlaying}
              onPlay={() => onPlayTrack(track, recentlyPlayed)}
              onToggleLike={onToggleLike}
              isLiked={favorites.some((f) => f.id === track.id)}
              onAddToQueue={onAddToQueue}
              onAddToPlaylist={onAddToPlaylist}
              onShare={onShare}
              compact={true}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Music2 size={42} />
          <h3>No play history yet</h3>
          <p>Stream any track from Home or Search and it will appear here.</p>
        </div>
      )}
    </section>
  );
};
