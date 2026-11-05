import { Heart, Play, Shuffle } from 'lucide-react';
import { TrackCard } from './TrackCard';

export const FavouritesView = ({
  favorites,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayAllFavorites,
  onToggleLike,
  onAddToQueue,
  onAddToPlaylist,
  onShare
}) => {
  return (
    <section className="page-section favourites-page">
      <div className="section-header-row">
        <div>
          <span className="eyebrow"><Heart size={14} color="#ec4899" fill="#ec4899" /> YOUR COLLECTION</span>
          <h2 className="section-heading">Liked Songs ({favorites.length})</h2>
          <p className="section-subtext">All your saved tracks kept safe in high fidelity audio.</p>
        </div>

        {favorites.length > 0 && (
          <div className="section-header-actions">
            <button
              className="btn-accent-pill"
              onClick={() => onPlayAllFavorites(false)}
            >
              <Play size={16} fill="currentColor" />
              <span>Play All</span>
            </button>
            <button
              className="btn-outline-pill"
              onClick={() => onPlayAllFavorites(true)}
            >
              <Shuffle size={16} />
              <span>Shuffle</span>
            </button>
          </div>
        )}
      </div>

      {favorites.length > 0 ? (
        <div className="cards-grid compact-cards-grid">
          {favorites.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isCurrentPlaying={currentTrack.id === track.id}
              isPlaying={isPlaying}
              onPlay={() => onPlayTrack(track, favorites)}
              onToggleLike={onToggleLike}
              isLiked={true}
              onAddToQueue={onAddToQueue}
              onAddToPlaylist={onAddToPlaylist}
              onShare={onShare}
              compact={true}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={42} color="#ec4899" />
          <h3>Your liked songs live here</h3>
          <p>Tap the heart icon on any card or the player bar to save music to your library.</p>
        </div>
      )}
    </section>
  );
};
