import { Play, Pause, Heart, ListPlus, MoreVertical, Share2 } from 'lucide-react';
import { useState } from 'react';

export const TrackCard = ({
  track,
  isCurrentPlaying,
  isPlaying,
  onPlay,
  onToggleLike,
  isLiked,
  onAddToQueue,
  onAddToPlaylist,
  onShare,
  compact = true
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isThisPlaying = isCurrentPlaying && isPlaying;

  return (
    <article
      className={`track-card-compact ${isCurrentPlaying ? 'is-active' : ''} ${compact ? 'size-compact' : ''}`}
      onClick={() => onPlay(track)}
    >
      <div className="card-compact-thumb-wrap">
        <img
          src={track.cover}
          alt={track.title}
          className="card-compact-thumb"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80';
          }}
        />

        {/* Live Audio Equalizer Indicator */}
        {isThisPlaying && (
          <div className="card-equalizer-badge" title="Playing">
            <span /><span /><span /><span />
          </div>
        )}

        {/* Quick Play Float Button (Neon accent) */}
        <button
          className={`card-play-float-btn ${isThisPlaying ? 'is-playing' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay(track);
          }}
          aria-label={isThisPlaying ? 'Pause' : 'Play'}
        >
          {isThisPlaying ? (
            <Pause size={17} fill="#ffffff" color="#ffffff" />
          ) : (
            <Play size={17} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
          )}
        </button>

        {/* Duration Chip */}
        {track.duration && (
          <span className="card-duration-chip">{track.duration}</span>
        )}
      </div>

      <div className="card-compact-meta">
        <div className="card-title-row">
          <h4 className="card-compact-title" title={track.title}>{track.title}</h4>
          {onToggleLike && (
            <button
              className={`card-heart-btn ${isLiked ? 'liked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(track);
              }}
              title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Favorite"
            >
              <Heart size={14} fill={isLiked ? '#ec4899' : 'none'} color={isLiked ? '#ec4899' : '#64748b'} />
            </button>
          )}
        </div>
        <p className="card-compact-artist" title={track.artist}>{track.artist}</p>
      </div>

      {/* Floating Action Menu Dots */}
      {(onAddToPlaylist || onAddToQueue || onShare) && (
        <div className="card-menu-anchor" onClick={(e) => e.stopPropagation()}>
          <button
            className="card-dots-btn"
            onClick={() => setShowMenu((prev) => !prev)}
            title="Options"
            aria-label="More options"
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <>
              <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
              <div className="card-context-menu">
                {onAddToQueue && (
                  <button
                    className="menu-item"
                    onClick={() => {
                      onAddToQueue(track);
                      setShowMenu(false);
                    }}
                  >
                    <ListPlus size={14} />
                    <span>Add to queue</span>
                  </button>
                )}
                {onAddToPlaylist && (
                  <button
                    className="menu-item"
                    onClick={() => {
                      onAddToPlaylist(track);
                      setShowMenu(false);
                    }}
                  >
                    <ListPlus size={14} />
                    <span>Add to playlist</span>
                  </button>
                )}
                {onShare && (
                  <button
                    className="menu-item"
                    onClick={() => {
                      onShare(track);
                      setShowMenu(false);
                    }}
                  >
                    <Share2 size={14} />
                    <span>Share track</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
};
