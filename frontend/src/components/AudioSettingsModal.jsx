import { Moon, Sliders, Volume2, X, Zap } from 'lucide-react';

export const AudioSettingsModal = ({
  isOpen,
  onClose,
  equalizerPreset,
  onSelectEqualizer,
  playbackSpeed,
  onSelectPlaybackSpeed,
  sleepTimerRemaining,
  onSetSleepTimer,
  audioQuality,
  onSelectAudioQuality
}) => {
  if (!isOpen) return null;

  const presets = [
    { id: 'flat', name: 'Flat', desc: 'Neutral, balanced audio' },
    { id: 'bass', name: 'Bass Boost', desc: 'Punchy low frequencies' },
    { id: 'vocal', name: 'Vocal Clarity', desc: 'Crisp voices & lyrics' },
    { id: 'acoustic', name: 'Acoustic', desc: 'Warm guitars & strings' },
    { id: 'edm', name: 'Electronic', desc: 'High energy synth & kicks' }
  ];

  const speeds = [0.75, 1.0, 1.25, 1.5];
  const timerOptions = [
    { label: 'Off', minutes: 0 },
    { label: '15 min', minutes: 15 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '60 min', minutes: 60 }
  ];

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-card-sleek" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="modal-header-row">
          <div>
            <h3 className="modal-heading">Audio & Equalizer</h3>
            <p className="modal-subheading">Fine-tune acoustic profile and playback settings</p>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close audio settings">
            <X size={20} />
          </button>
        </header>

        <div className="settings-section-group">
          {/* Equalizer Presets */}
          <div className="settings-block">
            <div className="block-title-row">
              <Sliders size={16} color="#a855f7" />
              <h4>Equalizer Sound Profile</h4>
            </div>
            <div className="chips-grid">
              {presets.map((p) => (
                <button
                  key={p.id}
                  className={`setting-chip ${equalizerPreset === p.id ? 'active' : ''}`}
                  onClick={() => onSelectEqualizer?.(p.id)}
                >
                  <span className="chip-name">{p.name}</span>
                  <small className="chip-sub">{p.desc}</small>
                </button>
              ))}
            </div>
          </div>

          {/* Playback Speed */}
          <div className="settings-block">
            <div className="block-title-row">
              <Zap size={16} color="#38bdf8" />
              <h4>Playback Speed</h4>
            </div>
            <div className="speed-options-row">
              {speeds.map((s) => (
                <button
                  key={s}
                  className={`speed-pill ${playbackSpeed === s ? 'active' : ''}`}
                  onClick={() => onSelectPlaybackSpeed?.(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Timer */}
          <div className="settings-block">
            <div className="block-title-row">
              <Moon size={16} color="#c084fc" />
              <h4>Sleep Timer</h4>
              {sleepTimerRemaining > 0 && (
                <span className="timer-countdown-badge">
                  {Math.floor(sleepTimerRemaining / 60)}:
                  {String(sleepTimerRemaining % 60).padStart(2, '0')} left
                </span>
              )}
            </div>
            <div className="timer-options-row">
              {timerOptions.map((opt) => (
                <button
                  key={opt.minutes}
                  className={`timer-pill ${
                    (opt.minutes === 0 && !sleepTimerRemaining) ||
                    (opt.minutes > 0 && Math.ceil(sleepTimerRemaining / 60) === opt.minutes)
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => onSetSleepTimer?.(opt.minutes)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Quality */}
          <div className="settings-block">
            <div className="block-title-row">
              <Volume2 size={16} color="#fbbf24" />
              <h4>Streaming Audio Quality</h4>
            </div>
            <div className="quality-options-row">
              {['Lossless Hi-Fi (320kbps)', 'High (256kbps)', 'Standard (160kbps)'].map((q) => (
                <button
                  key={q}
                  className={`quality-pill ${audioQuality === q ? 'active' : ''}`}
                  onClick={() => onSelectAudioQuality?.(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
