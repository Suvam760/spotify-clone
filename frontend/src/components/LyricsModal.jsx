import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Music } from 'lucide-react';
import { apiGet } from '../lib/api';

function parseLrc(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];
  const lines = lrcText.split('\n');
  const parsed = [];
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let match;
    timeRegex.lastIndex = 0;
    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + millis / 1000;
      const text = trimmed.replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, '').trim();
      if (text) {
        parsed.push({ time: totalSeconds, text });
      }
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}

export const LyricsModal = ({ track, isOpen, onClose, currentTime = 0, onSeek }) => {
  const [result, setResult] = useState(null);
  const activeLineRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const hasCurrentResult = Boolean(result && track && result.trackId === track.id);
  const isLoading = Boolean(isOpen && track && !hasCurrentResult);

  useEffect(() => {
    if (!isOpen || !track) return undefined;
    const controller = new AbortController();

    apiGet(`/api/lyrics?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`, {
      signal: controller.signal
    })
      .then((data) => {
        const rawLrc = data.syncedLyrics || '';
        const parsed = parseLrc(rawLrc);
        setResult({
          trackId: track.id,
          lyrics: data.syncedLyrics || data.plainLyrics || data.message || 'Lyrics are not available for this song.',
          hasSynced: Boolean(data.hasSynced && parsed.length > 0),
          parsedLines: parsed,
          plainLyrics: data.plainLyrics || (!parsed.length ? data.syncedLyrics : '')
        });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setResult({
            trackId: track.id,
            lyrics: error.message || 'Lyrics could not be loaded.',
            hasSynced: false,
            parsedLines: [],
            plainLyrics: ''
          });
        }
      });

    return () => controller.abort();
  }, [isOpen, track]);

  // Find active line index based on currentTime
  let activeIndex = -1;
  if (result?.hasSynced && result.parsedLines.length > 0) {
    for (let i = 0; i < result.parsedLines.length; i++) {
      if (currentTime >= result.parsedLines[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Auto-scroll active line into view
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!isOpen || !track) return null;

  return (
    <div className="lyrics-modal-backdrop" onClick={onClose}>
      <div
        className="lyrics-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Lyrics for ${track.title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="lyrics-modal-header">
          <div className="lyrics-header-title">
            <div className="lyrics-thumb-wrap">
              <img src={track.cover} alt="" className="lyrics-cover-mini" />
            </div>
            <div>
              <h3>{track.title}</h3>
              <p>{track.artist}</p>
            </div>
          </div>
          <div className="lyrics-header-actions">
            {result?.hasSynced && (
              <div className="synced-badge">
                <Sparkles size={13} />
                <span>Live Synced Lyrics</span>
              </div>
            )}
            <button className="close-lyrics-btn" onClick={onClose} aria-label="Close lyrics">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="lyrics-content-area" ref={scrollContainerRef}>
          {isLoading ? (
            <div className="lyrics-loading-wrap">
              <div className="lyrics-pulse-dot" />
              <p>Fetching synced lyrics…</p>
            </div>
          ) : result?.hasSynced && result.parsedLines.length > 0 ? (
            <div className="synced-lyrics-list">
              {result.parsedLines.map((line, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;
                return (
                  <p
                    key={`${line.time}-${index}`}
                    ref={isActive ? activeLineRef : null}
                    className={`synced-line ${isActive ? 'active-line' : ''} ${isPast ? 'past-line' : ''}`}
                    onClick={() => onSeek?.(line.time)}
                    title="Click to jump to this line"
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="plain-lyrics-wrap">
              {result?.plainLyrics ? (
                <pre className="lyrics-text">{result.plainLyrics}</pre>
              ) : (
                <div className="lyrics-empty-state">
                  <Music size={36} />
                  <h4>No Lyrics Found</h4>
                  <p>Lyrics are not available for this track yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
