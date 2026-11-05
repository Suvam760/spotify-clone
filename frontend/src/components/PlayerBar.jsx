import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Volume1,
  Music2,
  ListFilter,
  Tv,
  Maximize2,
  Sliders,
  Sparkles
} from 'lucide-react';

export const PlayerBar = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  isShuffle,
  onToggleShuffle,
  repeatMode, // 'off' | 'all' | 'one'
  onToggleRepeat,
  isLiked,
  onToggleLike,
  onToggleLyrics,
  isLyricsOpen,
  onToggleQueue,
  isQueueOpen,
  isVideoVisible,
  onToggleVideo,
  onOpenFullScreen,
  onOpenAudioSettings,
  autoPlaySimilar = true,
  onToggleAutoPlaySimilar
}) => {
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div className="bottom-player-bar">
      {/* Left: Track Details (Clicking expands to Full-Screen Player!) */}
      <div className="player-track-info" onClick={onOpenFullScreen} title="Click to expand player">
        <div className={`player-thumb-wrap ${isPlaying ? 'is-playing' : ''}`}>
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className={`player-thumb ${isPlaying ? 'spinning-mini' : ''}`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80';
            }}
          />
          {isPlaying && (
            <div className="player-thumb-visualizer" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </div>
          )}
        </div>
        <div className="player-meta">
          <span className="player-title" title={currentTrack.title}>
            {currentTrack.title}
          </span>
          <span className="player-artist" title={currentTrack.artist}>
            {currentTrack.artist}
          </span>
        </div>
        <button
          className={`player-like-btn ${isLiked ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(currentTrack);
          }}
          title={isLiked ? 'Unlike' : 'Like'}
          aria-label={isLiked ? 'Unlike track' : 'Like track'}
        >
          <Heart
            size={18}
            fill={isLiked ? '#ec4899' : 'none'}
            color={isLiked ? '#ec4899' : '#94a3b8'}
          />
        </button>
      </div>

      {/* Center: Playback Controls & Timeline */}
      <div className="player-center-controls">
        <div className="controls-buttons-row">
          <button
            className={`ctrl-btn shuffle-btn ${isShuffle ? 'active' : ''}`}
            onClick={onToggleShuffle}
            title={isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
            aria-label="Shuffle"
          >
            <Shuffle size={16} />
          </button>

          <button
            className="ctrl-btn prev-btn"
            onClick={onPrevious}
            title="Previous track"
            aria-label="Previous track"
          >
            <SkipBack size={19} />
          </button>

          <button
            className="play-pause-circle-btn"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={20} fill="#ffffff" color="#ffffff" />
            ) : (
              <Play size={20} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
            )}
          </button>

          <button
            className="ctrl-btn next-btn"
            onClick={onNext}
            title="Next track"
            aria-label="Next track"
          >
            <SkipForward size={19} />
          </button>

          <button
            className={`ctrl-btn repeat-btn ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={onToggleRepeat}
            title={`Repeat: ${repeatMode}`}
            aria-label="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>

          {onToggleAutoPlaySimilar && (
            <button
              className={`ctrl-btn vibe-autoplay-btn ${autoPlaySimilar ? 'active' : ''}`}
              onClick={onToggleAutoPlaySimilar}
              title={autoPlaySimilar ? 'Same-Vibe Infinite Autoplay: ACTIVE' : 'Same-Vibe Autoplay: OFF'}
              aria-label="Toggle Same Vibe Autoplay"
            >
              <Sparkles size={16} />
            </button>
          )}
        </div>

        {/* Progress Scrubber */}
        <div className="progress-timeline-row">
          <span className="time-display current-time">
            {formatTime(currentTime)}
          </span>
          <div className="scrubber-bar-track">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="scrubber-input"
              aria-label="Track progress"
            />
            <div
              className="scrubber-fill-bar"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="scrubber-thumb-indicator"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          <span className="time-display total-duration">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Sound & Utility Controls */}
      <div className="player-right-utilities">
        {/* Full-Screen Now Playing View (Matching Image 2) */}
        <button
          className="utility-btn fs-expand-btn"
          onClick={onOpenFullScreen}
          title="Full-screen Now Playing"
          aria-label="Full-screen"
        >
          <Maximize2 size={17} />
        </button>

        {/* Audio Equalizer & Settings */}
        {onOpenAudioSettings && (
          <button
            className="utility-btn audio-settings-btn"
            onClick={onOpenAudioSettings}
            title="Equalizer & Playback settings"
            aria-label="Audio settings"
          >
            <Sliders size={17} />
          </button>
        )}

        {/* Toggle Video Screen */}
        <button
          className={`utility-btn video-toggle-btn ${isVideoVisible ? 'active' : ''}`}
          onClick={onToggleVideo}
          title={isVideoVisible ? 'Hide Video (Audio Only)' : 'Show Music Video'}
          aria-label="Toggle Video"
        >
          <Tv size={17} />
        </button>

        {/* Toggle Lyrics Modal */}
        <button
          className={`utility-btn lyrics-toggle-btn ${isLyricsOpen ? 'active' : ''}`}
          onClick={onToggleLyrics}
          title="Karaoke Lyrics"
          aria-label="Lyrics"
        >
          <Music2 size={17} />
        </button>

        {/* Toggle Play Queue */}
        <button
          className={`utility-btn queue-toggle-btn ${isQueueOpen ? 'active' : ''}`}
          onClick={onToggleQueue}
          title="Playback Queue"
          aria-label="Playback Queue"
        >
          <ListFilter size={17} />
        </button>

        {/* Volume Slider */}
        <div className="volume-control-wrap">
          <button
            className="utility-btn mute-btn"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Mute"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} />
            ) : volume < 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>
          <div className="volume-slider-track">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="volume-input"
              aria-label="Volume slider"
            />
            <div
              className="volume-fill-bar"
              style={{ width: `${volumePercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
