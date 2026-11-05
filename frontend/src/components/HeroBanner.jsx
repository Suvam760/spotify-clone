import { Play, Sparkles, Flame, Headphones } from 'lucide-react';

export const HeroBanner = ({ onExploreClick, isPlaying, onQuickPlayGenre }) => {
  return (
    <div className="hero-banner">
      {/* Background Cosmic Atmosphere & Graphics */}
      <div className="hero-bg-overlay" />

      {/* Silhouette & Visualizer Artwork */}
      <div className="hero-artwork-area">
        {/* Headphone listener silhouette */}
        <div className="hero-silhouette-wrap">
          <svg className="hero-silhouette-svg" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="headphoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            {/* Ambient glow behind head */}
            <circle cx="120" cy="110" r="75" fill="url(#headphoneGrad)" opacity="0.22" filter="blur(20px)" />
            {/* Neck and shoulders silhouette */}
            <path d="M40 240 C50 200, 80 180, 100 170 L140 170 C160 180, 190 200, 200 240 Z" fill="#0c1022" />
            {/* Head profile silhouette looking upward/forward */}
            <path d="M95 160 C90 145, 92 120, 95 105 C100 80, 120 70, 145 75 C165 80, 175 100, 170 125 C165 145, 150 160, 135 165 Z" fill="#0c1022" />
            {/* Over-ear headphones */}
            <ellipse cx="140" cy="115" rx="18" ry="26" fill="#1e293b" stroke="url(#headphoneGrad)" strokeWidth="3" />
            <path d="M140 89 C140 60, 100 55, 95 85" stroke="url(#headphoneGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Headphone highlight ring */}
            <ellipse cx="140" cy="115" rx="10" ry="16" fill="#38bdf8" opacity="0.3" />
          </svg>
        </div>

        {/* Script Calligraphy & Equalizer */}
        <div className="hero-calligraphy-wrap">
          <div className="calligraphy-text">
            <span className="script-line">Good</span>
            <span className="script-line">Music</span>
            <span className="script-line highlight">Better</span>
            <span className="script-line">Days</span>
          </div>

          {/* Glowing Animated Waveform */}
          <div className={`hero-waveform ${isPlaying ? 'playing' : ''}`}>
            <span style={{ height: '35%' }}></span>
            <span style={{ height: '65%' }}></span>
            <span style={{ height: '90%' }}></span>
            <span style={{ height: '50%' }}></span>
            <span style={{ height: '100%' }}></span>
            <span style={{ height: '75%' }}></span>
            <span style={{ height: '40%' }}></span>
            <span style={{ height: '85%' }}></span>
            <span style={{ height: '60%' }}></span>
            <span style={{ height: '95%' }}></span>
            <span style={{ height: '45%' }}></span>
            <span style={{ height: '70%' }}></span>
            <span style={{ height: '30%' }}></span>
          </div>
        </div>
      </div>

      {/* Hero Content Left */}
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-sparkle" />
          <span>Curated Sonic Flow</span>
        </div>
        <h1 className="hero-title">
          Feel Every Beat,<br />
          <span className="hero-title-gradient">Match Every Mood</span>
        </h1>
        <p className="hero-subtext">
          Stream limitless music with zero restrictions, synchronized karaoke lyrics, and intelligent vibe autoplay.
        </p>

        <div className="hero-cta-group">
          <button className="hero-cta-btn" onClick={onExploreClick}>
            <div className="cta-play-icon">
              <Play size={15} fill="#ffffff" color="#ffffff" />
            </div>
            <span>{isPlaying ? 'Explore Trending' : 'Start Listening Now'}</span>
          </button>

          {onQuickPlayGenre && (
            <div className="hero-quick-chips">
              <button className="hero-quick-chip" onClick={() => onQuickPlayGenre('bollywood')}>
                <Flame size={13} color="#f97316" />
                <span>Bollywood Hits</span>
              </button>
              <button className="hero-quick-chip" onClick={() => onQuickPlayGenre('lofi')}>
                <Headphones size={13} color="#38bdf8" />
                <span>Lo-Fi Chill</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
