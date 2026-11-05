import {
  BarChart3,
  Brain,
  Clock3,
  CloudRain,
  Dumbbell,
  Flame,
  Heart,
  Home,
  ListMusic,
  Menu,
  Mic2,
  Moon,
  Music2,
  Search,
  Sparkles,
  Sun,
  Waves,
  X,
  Zap,
  Globe2
} from 'lucide-react';
import { MOODS } from '../data/musicData';

const moodIcons = { Heart, Sun, Moon, Brain, Dumbbell, Zap, CloudRain, Sparkles, Music2, Mic2, Flame, Waves };

export const Sidebar = ({
  activeTab,
  setActiveTab,
  activeMood,
  setActiveMood,
  onSearchClick,
  isOpenMobile,
  onCloseMobile,
  user,
  onOpenProfile,
  onOpenStats,
  onOpenPlaylists,
  onOpenAuth
}) => (
  <>
    {isOpenMobile && <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />}
    <aside className={`sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <svg className="brand-logo-icon" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="nexaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="50%" stopColor="#a855f7" /><stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <path d="M25.95 44.94c-.66.84-2.02.37-2.02-.7V33.94a2.26 2.26 0 0 0-2.26-2.26H10.29c-.92 0-1.46-1.04-.92-1.79l7.48-10.47c1.07-1.5 0-3.58-1.84-3.58H1.24c-.92 0-1.46-1.04-.92-1.79L10.01.47c.22-.3.56-.47.92-.47h28.9c.92 0 1.45 1.04.92 1.79l-7.48 10.47c-1.07 1.5 0 3.58 1.84 3.58h11.38c.94 0 1.47 1.09.89 1.83L25.95 44.94z" fill="url(#nexaGrad)" />
          </svg>
        </div>
        <div className="brand-name">
          <span className="brand-title">NEXA</span>
          <span className="brand-subtitle">MUSIC</span>
        </div>
        <button className="sidebar-mobile-close-btn" onClick={onCloseMobile} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <nav className="nav-menu" aria-label="Main navigation">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => { setActiveTab('home'); onCloseMobile?.(); }}
        >
          <Home size={19} />
          <span>Home</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => { setActiveTab('search'); onSearchClick(); onCloseMobile?.(); }}
        >
          <Search size={19} />
          <span>Search</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => { setActiveTab('library'); onCloseMobile?.(); }}
        >
          <Heart size={19} />
          <span>Liked Songs</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('playlists');
            onOpenPlaylists?.();
            onCloseMobile?.();
          }}
        >
          <ListMusic size={19} />
          <span>Playlists</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => { setActiveTab('categories'); onCloseMobile?.(); }}
        >
          <Globe2 size={19} />
          <span>Categories & Languages</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => { setActiveTab('recent'); onCloseMobile?.(); }}
        >
          <Clock3 size={19} />
          <span>History</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => {
            onOpenStats?.();
            onCloseMobile?.();
          }}
        >
          <BarChart3 size={19} />
          <span>Listening Insights</span>
        </button>

        {!user?.isLoggedIn && (
          <button
            className={`nav-item nav-item-login-highlight ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); onCloseMobile?.(); }}
          >
            <Sparkles size={19} color="#a855f7" />
            <span>Login / OTP</span>
          </button>
        )}
      </nav>

      <div className="moods-section">
        <h4 className="section-title">FIND YOUR VIBE</h4>
        <div className="moods-list">
          {MOODS.map((mood) => {
            const MoodIcon = moodIcons[mood.iconName] || Heart;
            return (
              <button
                key={mood.id}
                className={`mood-item ${activeMood === mood.id ? 'active' : ''}`}
                onClick={() => { setActiveMood(mood.id); onCloseMobile?.(); }}
                aria-pressed={activeMood === mood.id}
              >
                <span className="mood-icon-wrap" style={{ color: mood.color }}>
                  <MoodIcon size={18} className="mood-icon" />
                </span>
                <span className="mood-label">{mood.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="user-profile-card"
        onClick={() => {
          if (user?.isLoggedIn) {
            onOpenProfile?.();
          } else {
            onOpenAuth?.();
          }
        }}
        title={user?.isLoggedIn ? "Edit Profile & Settings" : "Sign In with OTP"}
      >
        <img src={user?.avatar} alt="" className="user-avatar" />
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-plan">{user?.isLoggedIn ? (user?.handle || 'Premium Hi-Fi') : 'Sign In with OTP'}</span>
        </div>
        <Menu size={16} className="profile-arrow" aria-hidden="true" />
      </div>
    </aside>
  </>
);
