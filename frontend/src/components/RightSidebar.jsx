import { Heart, Sparkles, X, ListPlus } from 'lucide-react';
import { CURRENT_USER, MOODS } from '../data/musicData';

export const RightSidebar = ({
  recommendedTracks,
  favoriteTracks,
  activeMood,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onSeeAllFavorites,
  onAddToQueue,
  isOpenMobile,
  onCloseMobile
}) => {
  const selectedMood = MOODS.find((mood) => mood.id === activeMood) || MOODS[0];

  return (
    <>
      {isOpenMobile && <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />}
      <aside className={`right-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
        <div className="right-topbar">
          <button className="sidebar-mobile-close-btn" onClick={onCloseMobile} aria-label="Close recommendations">
            <X size={20} />
          </button>
          <div className="topbar-avatar-wrap" title={CURRENT_USER.name}>
            <img src={CURRENT_USER.avatar} alt="" className="topbar-avatar" />
            <span className="online-badge" />
          </div>
        </div>

        {/* Mood Vibe Match Card */}
        <div className="recommends-card">
          <div className="recommends-header">
            <Sparkles size={16} className="recommends-sparkle" />
            <span className="recommends-title">Mood Match</span>
          </div>
          <p className="recommends-sub">Hand-picked for your current vibe</p>
          <div className="mood-vibe-box" style={{ borderColor: `${selectedMood.color}40` }}>
            <div className="vibe-icon-badge" style={{ backgroundColor: `${selectedMood.color}25` }}>
              <Heart size={20} fill={selectedMood.color} color={selectedMood.color} />
            </div>
            <div className="vibe-text-content">
              <h5 className="vibe-title">
                Vibe: <span className="highlight-mood" style={{ color: selectedMood.color }}>{selectedMood.name}</span>
              </h5>
              <p className="vibe-reason">Autoplay will queue tracks matching this energy.</p>
            </div>
          </div>
        </div>

        {/* Selected Mood Mix Tracks */}
        <div className="sidebar-track-section">
          <div className="section-title-row">
            <h4 className="sidebar-section-title">{selectedMood.name} Mix</h4>
            <span className="sidebar-count-badge">{recommendedTracks.length}</span>
          </div>
          <div className="sidebar-track-list">
            {recommendedTracks.slice(0, 6).map((track) => {
              const isPlayingThis = currentTrack.id === track.id && isPlaying;
              return (
                <div key={track.id} className={`sidebar-track-item ${currentTrack.id === track.id ? 'active' : ''}`}>
                  <button
                    className="sidebar-track-select"
                    onClick={() => {
                      onPlayTrack(track);
                      onCloseMobile?.();
                    }}
                    aria-label={`Play ${track.title}`}
                  >
                    <div className="track-mini-thumb">
                      <img src={track.cover} alt="" loading="lazy" />
                      {isPlayingThis && (
                        <div className="playing-pulse-indicator">
                          <span /><span /><span />
                        </div>
                      )}
                    </div>
                    <div className="track-mini-info">
                      <span className="track-mini-title" title={track.title}>{track.title}</span>
                      <span className="track-mini-artist" title={track.artist}>{track.artist}</span>
                    </div>
                  </button>
                  {onAddToQueue && (
                    <button
                      className="sidebar-queue-add-btn"
                      title="Add to queue"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(track);
                      }}
                      aria-label="Add to queue"
                    >
                      <ListPlus size={15} />
                    </button>
                  )}
                </div>
              );
            })}
            {recommendedTracks.length === 0 && <p className="sidebar-empty-state">Choose a mood to load its mix.</p>}
          </div>
        </div>

        {/* Liked Songs Quick Section */}
        <div className="sidebar-track-section favorites-section">
          <div className="section-title-row">
            <div className="favorites-heading-wrap">
              <Heart size={15} fill="#ec4899" color="#ec4899" className="heart-title-icon" />
              <h4 className="sidebar-section-title">Liked Songs</h4>
            </div>
            <button className="see-all-btn" onClick={onSeeAllFavorites}>See all ({favoriteTracks.length})</button>
          </div>
          <div className="sidebar-track-list">
            {favoriteTracks.slice(0, 5).map((track) => (
              <div key={track.id} className={`sidebar-track-item ${currentTrack.id === track.id ? 'active' : ''}`}>
                <button
                  className="sidebar-track-select"
                  onClick={() => {
                    onPlayTrack(track);
                    onCloseMobile?.();
                  }}
                  aria-label={`Play ${track.title}`}
                >
                  <div className="track-mini-thumb">
                    <img src={track.cover} alt="" loading="lazy" />
                  </div>
                  <div className="track-mini-info">
                    <span className="track-mini-title" title={track.title}>{track.title}</span>
                    <span className="track-mini-artist" title={track.artist}>{track.artist}</span>
                  </div>
                </button>
                <button
                  className="like-btn active"
                  title="Remove from liked songs"
                  aria-label={`Remove ${track.title} from liked songs`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(track);
                  }}
                >
                  <Heart size={15} fill="#ec4899" color="#ec4899" />
                </button>
              </div>
            ))}
            {favoriteTracks.length === 0 && <p className="sidebar-empty-state">Tap the heart in the player to save songs.</p>}
          </div>
        </div>
      </aside>
    </>
  );
};
