import {
  ChevronDown,
  Heart,
  MoreHorizontal,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Tv,
  ListFilter,
  MessageSquareQuote,
  Sliders
} from 'lucide-react';

export const FullScreenPlayer = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  currentTime,
  duration,
  onSeek,
  isShuffle,
  onToggleShuffle,
  repeatMode, // 'off' | 'all' | 'one'
  onToggleRepeat,
  isLiked,
  onToggleLike,
  onToggleLyrics,
  onToggleQueue,
  isVideoVisible,
  onToggleVideo,
  onOpenAudioSettings,
  onOpenShare,
  playingSourceName = 'Vibe Flow'
}) => {
  if (!isOpen || !currentTrack?.videoId) return null;

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="fullscreen-player-overlay" role="dialog" aria-modal="true" aria-label="Now playing player">
      <div className="fullscreen-player-content">
        {/* Top bar */}
        <header className="fs-top-bar">
          <button className="fs-icon-btn collapse-btn" onClick={onClose} title="Collapse player" aria-label="Collapse player">
            <ChevronDown size={28} />
          </button>

          <div className="fs-playing-from">
            <span className="fs-playing-label">PLAYING FROM</span>
            <h4 className="fs-playlist-name" title={playingSourceName}>{playingSourceName}</h4>
          </div>

          <div className="fs-top-actions">
            <button
              className="fs-icon-btn"
              onClick={onOpenAudioSettings}
              title="Audio settings & Equalizer"
              aria-label="Audio settings"
            >
              <Sliders size={20} />
            </button>
            <button
              className="fs-icon-btn"
              onClick={() => onOpenShare?.(currentTrack)}
              title="Share track"
              aria-label="Share track"
            >
              <MoreHorizontal size={22} />
            </button>
          </div>
        </header>

        {/* Big Artwork Squircle with glowing atmosphere */}
        <div className="fs-artwork-stage">
          <div className="fs-artwork-shadow" style={{ backgroundImage: `url(${currentTrack.cover})` }} />
          <div className="fs-artwork-card">
            <img src={currentTrack.cover} alt={currentTrack.title} className="fs-artwork-img" />
            {isPlaying && (
              <div className="fs-artwork-playing-badge">
                <span /><span /><span /><span />
              </div>
            )}
          </div>
        </div>

        {/* Track Metadata & Favorite */}
        <div className="fs-metadata-row">
          <div className="fs-title-wrap">
            <h2 className="fs-track-title" title={currentTrack.title}>{currentTrack.title}</h2>
            <p className="fs-track-artist" title={currentTrack.artist}>{currentTrack.artist}</p>
          </div>
          <button
            className={`fs-like-btn ${isLiked ? 'active' : ''}`}
            onClick={() => onToggleLike?.(currentTrack)}
            title={isLiked ? 'Unlike' : 'Like'}
            aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={26}
              fill={isLiked ? '#ec4899' : 'none'}
              color={isLiked ? '#ec4899' : '#94a3b8'}
            />
          </button>
        </div>

        {/* Progress Bar & Timers */}
        <div className="fs-progress-container">
          <div className="fs-progress-bar-wrap">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="fs-scrubber-input"
              aria-label="Seek track"
            />
            <div className="fs-progress-fill" style={{ width: `${progressPercent}%` }} />
            <div className="fs-progress-thumb" style={{ left: `${progressPercent}%` }} />
          </div>
          <div className="fs-time-row">
            <span className="fs-time-current">{formatTime(currentTime)}</span>
            <span className="fs-time-duration">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Core Controls */}
        <div className="fs-controls-cluster">
          <button
            className={`fs-ctrl-btn ${isShuffle ? 'active' : ''}`}
            onClick={onToggleShuffle}
            title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
            aria-label="Shuffle"
          >
            <Shuffle size={22} />
          </button>

          <button
            className="fs-ctrl-btn fs-step-btn"
            onClick={onPrevious}
            title="Previous track"
            aria-label="Previous track"
          >
            <SkipBack size={26} fill="currentColor" />
          </button>

          <button
            className="fs-play-btn"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={30} fill="#ffffff" color="#ffffff" />
            ) : (
              <Play size={30} fill="#ffffff" color="#ffffff" style={{ marginLeft: '3px' }} />
            )}
          </button>

          <button
            className="fs-ctrl-btn fs-step-btn"
            onClick={onNext}
            title="Next track"
            aria-label="Next track"
          >
            <SkipForward size={26} fill="currentColor" />
          </button>

          <button
            className={`fs-ctrl-btn ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={onToggleRepeat}
            title={`Repeat: ${repeatMode}`}
            aria-label="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
          </button>
        </div>

        {/* Bottom Utility Bar */}
        <footer className="fs-bottom-dock">
          <button
            className={`fs-dock-btn ${isVideoVisible ? 'active' : ''}`}
            onClick={onToggleVideo}
            title={isVideoVisible ? 'Hide Video' : 'Watch Music Video'}
            aria-label="Music video"
          >
            <Tv size={20} />
          </button>

          <button
            className="fs-dock-btn"
            onClick={onToggleLyrics}
            title="Karaoke Synced Lyrics"
            aria-label="Lyrics"
          >
            <MessageSquareQuote size={20} />
          </button>

          <button
            className="fs-dock-btn"
            onClick={onToggleQueue}
            title="Playback Queue"
            aria-label="Queue"
          >
            <ListFilter size={20} />
          </button>
        </footer>
      </div>
    </div>
  );
};
