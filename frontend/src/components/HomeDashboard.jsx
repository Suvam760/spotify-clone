import {
  Bell,
  Flame,
  Heart,
  Play,
  Pause,
  Sparkles,
  Disc3,
  ChevronRight
} from 'lucide-react';
import { TrackCard } from './TrackCard';
import { DAILY_MIXES, POPULAR_ALBUMS, TOP_ARTISTS } from '../data/musicData';

export const HomeDashboard = ({
  user,
  currentTrack,
  isPlaying,
  onPlayTrack,
  recentlyPlayed,
  trendingTracks,
  recommendedTracks,
  activeMood,
  onToggleLike,
  favorites,
  onAddToQueue,
  onAddToPlaylist,
  onShare,
  onSelectArtist,
  onSelectAlbum,
  onOpenNotifications,
  onOpenProfile,
  onSeeAllCategory
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const continueTrack = currentTrack?.videoId
    ? currentTrack
    : (recentlyPlayed[0] || trendingTracks[0] || null);

  const isContinuePlaying = isPlaying && continueTrack?.id === currentTrack?.id;

  return (
    <div className="home-dashboard">
      {/* Top Greeting & Header Row matching Image 2 */}
      <header className="home-listen-now-header">
        <div className="greeting-text-wrap">
          <span className="greeting-sub">{getGreeting()}</span>
          <h1 className="greeting-main">Listen now</h1>
        </div>

        <div className="home-header-actions">
          <button
            className="home-icon-circle-btn"
            onClick={onOpenNotifications}
            title="Music notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="unread-dot" />
          </button>
          <button
            className="home-profile-avatar-btn"
            onClick={onOpenProfile}
            title={user?.name || 'Your Profile'}
            aria-label="User Profile"
          >
            <img src={user?.avatar} alt={user?.name} className="home-avatar-img" />
          </button>
        </div>
      </header>

      {/* Continue Listening Hero Banner matching Image 2! */}
      {continueTrack && (
        <section className="continue-listening-card" onClick={() => onPlayTrack(continueTrack)}>
          <div className="continue-content">
            <span className="continue-tag">CONTINUE LISTENING</span>
            <h2 className="continue-title" title={continueTrack.title}>
              {continueTrack.title.length > 40 ? `${continueTrack.title.slice(0, 40)}…` : continueTrack.title}
            </h2>
            <p className="continue-artist">{continueTrack.artist} and more</p>

            <button
              className="continue-play-circle-btn"
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrack(continueTrack);
              }}
              aria-label={isContinuePlaying ? 'Pause' : 'Play'}
            >
              {isContinuePlaying ? (
                <Pause size={22} fill="#7c3aed" color="#7c3aed" />
              ) : (
                <Play size={22} fill="#7c3aed" color="#7c3aed" style={{ marginLeft: '2px' }} />
              )}
            </button>
          </div>

          <div className="continue-graphic-art">
            <div className="graphic-circle graphic-big" />
            <div className="graphic-circle graphic-small" />
            {continueTrack.cover && (
              <img src={continueTrack.cover} alt="" className="continue-art-thumb" />
            )}
          </div>
        </section>
      )}

      {/* Made For You / Daily Mixes matching Image 2! */}
      <section className="dashboard-section">
        <div className="section-title-bar">
          <div>
            <span className="section-eyebrow">PERSONALIZED FOR YOU</span>
            <h3 className="section-headline">Made for you</h3>
          </div>
        </div>

        <div className="daily-mixes-row">
          {DAILY_MIXES.map((mix) => (
            <div
              key={mix.id}
              className="daily-mix-card"
              style={{ background: mix.bg }}
              onClick={() => onSeeAllCategory?.(mix.query, mix.title)}
            >
              <div className="mix-shape-decor">
                <span className={`shape-element ${mix.shape}`} />
              </div>
              <div className="mix-info">
                <span className="mix-badge">{mix.badge}</span>
                <h4 className="mix-title">{mix.title}</h4>
                <p className="mix-desc">{mix.description}</p>
              </div>
              <button
                className="mix-play-btn"
                title={`Play ${mix.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeeAllCategory?.(mix.query, mix.title);
                }}
              >
                <Play size={16} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Played Compact List matching Image 2! */}
      {recentlyPlayed.length > 0 && (
        <section className="dashboard-section">
          <div className="section-title-bar">
            <div>
              <span className="section-eyebrow">JUMP BACK IN</span>
              <h3 className="section-headline">Recently played</h3>
            </div>
            <button
              className="section-see-all-btn"
              onClick={() => onSeeAllCategory?.('recent', 'Recently Played')}
            >
              <span>See all</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="recently-played-list-compact">
            {recentlyPlayed.slice(0, 5).map((track) => {
              const isThisPlaying = isPlaying && currentTrack.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`recent-row-item ${isThisPlaying ? 'is-playing' : ''}`}
                  onClick={() => onPlayTrack(track)}
                >
                  <div className="recent-thumb-wrap">
                    <img src={track.cover} alt="" className="recent-thumb" />
                    {isThisPlaying && (
                      <div className="recent-equalizer">
                        <span /><span /><span />
                      </div>
                    )}
                  </div>
                  <div className="recent-text">
                    <h5 className="recent-title" title={track.title}>{track.title}</h5>
                    <p className="recent-artist" title={track.artist}>{track.artist}</p>
                  </div>
                  <div className="recent-actions">
                    <button
                      className="recent-play-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track);
                      }}
                      aria-label="Play track"
                    >
                      {isThisPlaying ? (
                        <Pause size={15} fill="currentColor" />
                      ) : (
                        <Play size={15} fill="currentColor" style={{ marginLeft: '1px' }} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending & Featured Tracks - Small compact cards */}
      <section className="dashboard-section">
        <div className="section-title-bar">
          <div>
            <span className="section-eyebrow"><Flame size={13} color="#f97316" /> HOT RIGHT NOW</span>
            <h3 className="section-headline">Trending Music</h3>
          </div>
          <button
            className="section-see-all-btn"
            onClick={() => onSeeAllCategory?.('trending', 'Trending Music')}
          >
            <span>See all</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="compact-cards-scroll">
          {trendingTracks.slice(0, 8).map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isCurrentPlaying={currentTrack.id === track.id}
              isPlaying={isPlaying}
              onPlay={() => onPlayTrack(track, trendingTracks)}
              onToggleLike={onToggleLike}
              isLiked={favorites.some((f) => f.id === track.id)}
              onAddToQueue={onAddToQueue}
              onAddToPlaylist={onAddToPlaylist}
              onShare={onShare}
              compact={true}
            />
          ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section className="dashboard-section">
        <div className="section-title-bar">
          <div>
            <span className="section-eyebrow"><Sparkles size={13} color="#a855f7" /> SPOTLIGHT</span>
            <h3 className="section-headline">Popular Artists</h3>
          </div>
        </div>

        <div className="artists-compact-row">
          {TOP_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              className="artist-compact-card"
              onClick={() => onSelectArtist?.(artist)}
              title={artist.name}
            >
              <div className="artist-compact-avatar-wrap">
                <img src={artist.image} alt={artist.name} className="artist-compact-avatar" />
                <div className="artist-hover-play">
                  <Play size={16} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                </div>
              </div>
              <h5 className="artist-compact-name">{artist.name}</h5>
              <span className="artist-compact-role">{artist.role.split('·')[0]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Albums */}
      <section className="dashboard-section">
        <div className="section-title-bar">
          <div>
            <span className="section-eyebrow"><Disc3 size={13} color="#38bdf8" /> RECORD COLLECTION</span>
            <h3 className="section-headline">Popular Albums</h3>
          </div>
        </div>

        <div className="compact-cards-scroll">
          {POPULAR_ALBUMS.map((album) => (
            <div
              key={album.id}
              className="album-card-compact"
              onClick={() => onSelectAlbum?.(album)}
            >
              <div className="album-thumb-wrap">
                <img src={album.cover} alt={album.title} className="album-thumb" />
                <div className="album-play-overlay">
                  <Play size={16} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                </div>
                <span className="album-year-chip">{album.year}</span>
              </div>
              <h5 className="album-title" title={album.title}>{album.title}</h5>
              <p className="album-artist">{album.artist}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vibe / Mood Recommendations */}
      {recommendedTracks.length > 0 && (
        <section className="dashboard-section">
          <div className="section-title-bar">
            <div>
              <span className="section-eyebrow"><Heart size={13} color="#ec4899" fill="#ec4899" /> ENERGY MIX</span>
              <h3 className="section-headline">Recommended for your mood</h3>
            </div>
            <button
              className="section-see-all-btn"
              onClick={() => onSeeAllCategory?.(activeMood, 'Mood Recommendations')}
            >
              <span>See all</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="compact-cards-scroll">
            {recommendedTracks.slice(0, 8).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isCurrentPlaying={currentTrack.id === track.id}
                isPlaying={isPlaying}
                onPlay={() => onPlayTrack(track, recommendedTracks)}
                onToggleLike={onToggleLike}
                isLiked={favorites.some((f) => f.id === track.id)}
                onAddToQueue={onAddToQueue}
                onAddToPlaylist={onAddToPlaylist}
                onShare={onShare}
                compact={true}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
