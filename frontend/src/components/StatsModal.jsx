import { Clock, Music, Sparkles, X, Trophy } from 'lucide-react';

export const StatsModal = ({
  isOpen,
  onClose,
  totalPlayedCount,
  recentlyPlayed,
  favorites
}) => {
  if (!isOpen) return null;

  const totalMinutes = Math.round(totalPlayedCount * 3.4);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  // Compute most played artist
  const artistCounts = {};
  for (const track of [...recentlyPlayed, ...favorites]) {
    if (track?.artist) {
      artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
    }
  }
  const topArtist = Object.entries(artistCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Arijit Singh';

  const weeklyDays = [
    { day: 'Mon', count: Math.min(10, Math.floor(totalPlayedCount * 0.12) + 2) },
    { day: 'Tue', count: Math.min(10, Math.floor(totalPlayedCount * 0.15) + 3) },
    { day: 'Wed', count: Math.min(10, Math.floor(totalPlayedCount * 0.1) + 1) },
    { day: 'Thu', count: Math.min(10, Math.floor(totalPlayedCount * 0.18) + 4) },
    { day: 'Fri', count: Math.min(10, Math.floor(totalPlayedCount * 0.22) + 5) },
    { day: 'Sat', count: Math.min(10, Math.floor(totalPlayedCount * 0.25) + 6) },
    { day: 'Sun', count: Math.min(10, Math.floor(totalPlayedCount * 0.2) + 4) }
  ];

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-card-sleek" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="modal-header-row">
          <div>
            <h3 className="modal-heading">Listening Insights</h3>
            <p className="modal-subheading">Your personal audio summary and statistics</p>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close stats">
            <X size={20} />
          </button>
        </header>

        {/* Big Metrics Cards */}
        <div className="stats-kpi-grid">
          <div className="kpi-card">
            <Clock size={20} color="#a855f7" />
            <span className="kpi-value">{hours}h {remainingMins}m</span>
            <span className="kpi-label">Total Listening Time</span>
          </div>

          <div className="kpi-card">
            <Music size={20} color="#38bdf8" />
            <span className="kpi-value">{totalPlayedCount}</span>
            <span className="kpi-label">Tracks Streamed</span>
          </div>

          <div className="kpi-card">
            <Trophy size={20} color="#f97316" />
            <span className="kpi-value" title={topArtist}>{topArtist.split(',')[0]}</span>
            <span className="kpi-label">Top Artist</span>
          </div>

          <div className="kpi-card">
            <Sparkles size={20} color="#c084fc" />
            <span className="kpi-value">{favorites.length}</span>
            <span className="kpi-label">Liked Songs</span>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="activity-chart-box">
          <h4 className="chart-heading">Weekly Listening Activity</h4>
          <div className="bar-chart-container">
            {weeklyDays.map((d) => (
              <div key={d.day} className="bar-column">
                <div
                  className="bar-fill"
                  style={{ height: `${Math.min(100, Math.max(15, d.count * 10))}%` }}
                />
                <span className="bar-day">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
