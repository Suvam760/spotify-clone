import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AlertCircle,
  ExternalLink,
  LoaderCircle,
  Music2,
  Radio,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { TrackCard } from './components/TrackCard';
import { RightSidebar } from './components/RightSidebar';
import { PlayerBar } from './components/PlayerBar';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { LyricsModal } from './components/LyricsModal';
import { QueueDrawer } from './components/QueueDrawer';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Toast } from './components/Toast';
import { YouTubePlayer } from './components/YouTubePlayer';
import { PlaylistModal } from './components/PlaylistModal';
import { ArtistModal } from './components/ArtistModal';
import { AlbumModal } from './components/AlbumModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { StatsModal } from './components/StatsModal';
import { ShareModal } from './components/ShareModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { CategoriesView } from './components/CategoriesView';
import { FavouritesView } from './components/FavouritesView';
import { HistoryView } from './components/HistoryView';
import { BottomMobileNav } from './components/BottomMobileNav';
import { apiGet } from './lib/api';
import {
  CURRENT_USER,
  EMPTY_TRACK,
  INITIAL_PLAYLISTS
} from './data/musicData';
import './App.css';

function mapTrack(track) {
  if (!track?.videoId) return null;
  const durationSec = Number(track.durationSeconds) || 0;
  const duration = track.duration || (durationSec ? `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}` : '—');
  return {
    id: `youtube-${track.videoId}`,
    videoId: track.videoId,
    title: track.title || 'Unknown track',
    artist: track.channel || 'Unknown artist',
    cover: track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`,
    duration,
    durationSec,
    url: track.url || `https://www.youtube.com/watch?v=${track.videoId}`
  };
}

function readStored(key, fallback) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key));
    return value !== null ? value : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeMood, setActiveMood] = useState('romantic');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [categoryTitle, setCategoryTitle] = useState('Trending');
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [moodQueue, setMoodQueue] = useState([]);
  const [playingSourceName, setPlayingSourceName] = useState('Vibe Autoplay');

  // Stored state
  const [favorites, setFavorites] = useState(() => readStored('nexa-liked-tracks', []));
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => readStored('nexa-recent-tracks', []));
  const [playlists, setPlaylists] = useState(() => readStored('nexa-user-playlists', INITIAL_PLAYLISTS));
  const [user, setUser] = useState(() => readStored('nexa-user-profile', CURRENT_USER));
  const [searchHistory, setSearchHistory] = useState(() => readStored('nexa-search-history', ['Arijit Singh', 'Coldplay', 'Lo-Fi Chill']));
  const [totalPlayedCount, setTotalPlayedCount] = useState(() => readStored('nexa-play-counter', 18));
  const [theme, setTheme] = useState(() => readStored('nexa-app-theme', 'dark-neon'));

  // Save to localStorage
  useEffect(() => {
    try { window.localStorage.setItem('nexa-liked-tracks', JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  useEffect(() => {
    try { window.localStorage.setItem('nexa-recent-tracks', JSON.stringify(recentlyPlayed)); } catch {}
  }, [recentlyPlayed]);

  useEffect(() => {
    try { window.localStorage.setItem('nexa-user-playlists', JSON.stringify(playlists)); } catch {}
  }, [playlists]);

  useEffect(() => {
    try { window.localStorage.setItem('nexa-user-profile', JSON.stringify(user)); } catch {}
  }, [user]);

  useEffect(() => {
    try { window.localStorage.setItem('nexa-search-history', JSON.stringify(searchHistory)); } catch {}
  }, [searchHistory]);

  useEffect(() => {
    try { window.localStorage.setItem('nexa-play-counter', JSON.stringify(totalPlayedCount)); } catch {}
  }, [totalPlayedCount]);

  useEffect(() => {
    try { window.localStorage.setItem('nexa-app-theme', JSON.stringify(theme)); } catch {}
  }, [theme]);

  // Same-vibe autoplay preference
  const [autoPlaySimilarVibe, setAutoPlaySimilarVibe] = useState(() => readStored('nexa-autoplay-vibe', true));

  useEffect(() => {
    try { window.localStorage.setItem('nexa-autoplay-vibe', JSON.stringify(autoPlaySimilarVibe)); } catch {}
  }, [autoPlaySimilarVibe]);

  // Player state
  const [currentTrack, setCurrentTrack] = useState(EMPTY_TRACK);
  const [playbackQueue, setPlaybackQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    try {
      const saved = parseFloat(window.localStorage.getItem('nexa-volume'));
      return Number.isFinite(saved) ? Math.max(0, Math.min(1, saved)) : 0.75;
    } catch {
      return 0.75;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const smartMoodMode = true;

  // Audio settings
  const [equalizerPreset, setEqualizerPreset] = useState('bass');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0);
  const [audioQuality, setAudioQuality] = useState('Lossless Hi-Fi (320kbps)');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState('all'); // 'all' | 'songs' | 'artists' | 'albums'
  const [sortBy, setSortBy] = useState('relevance');

  // Modals & Drawers
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileRightSidebarOpen, setIsMobileRightSidebarOpen] = useState(false);

  // Feature modals
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [addingTrackToPlaylist, setAddingTrackToPlaylist] = useState(null);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [activeArtist, setActiveArtist] = useState(null);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser({ ...CURRENT_USER, isLoggedIn: false });
    showToast('Signed out of Nexa', 'info');
  };

  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Toast feedback
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const playerRef = useRef(null);
  const searchControllerRef = useRef(null);
  const didInitialLoadRef = useRef(false);

  const loadTrending = async (category = 'trending') => {
    setIsLoadingTrending(true);
    setStatusMessage('');
    try {
      const data = await apiGet(`/api/trending?category=${encodeURIComponent(category)}`);
      const tracks = (data.results || []).map(mapTrack).filter(Boolean);
      setTrendingTracks(tracks);
      return tracks;
    } catch (error) {
      console.warn('loadTrending error:', error.message);
      setTrendingTracks([]);
      return [];
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const loadMood = async (moodId, shouldSwitchTrack = false) => {
    setStatusMessage('');
    try {
      const data = await apiGet(`/api/mood?mood=${encodeURIComponent(moodId)}`);
      const tracks = (data.results || []).map(mapTrack).filter(Boolean);
      setRecommendedTracks(tracks);
      setMoodQueue(tracks);
      if (shouldSwitchTrack && tracks[0]) playTrack(tracks[0], tracks, true);
      return tracks;
    } catch (error) {
      console.warn('loadMood error:', error.message);
      setRecommendedTracks([]);
      setMoodQueue([]);
      return [];
    }
  };

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    loadTrending('trending');
    loadMood('romantic');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sleep Timer countdown
  useEffect(() => {
    if (!sleepTimerRemaining || sleepTimerRemaining <= 0) return undefined;
    const interval = window.setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev <= 1) {
          playerRef.current?.pauseVideo?.();
          setIsPlaying(false);
          showToast('Sleep timer finished: Playback paused', 'info');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [sleepTimerRemaining, showToast]);

  const handleSetSleepTimer = (minutes) => {
    if (minutes === 0) {
      setSleepTimerRemaining(0);
      showToast('Sleep timer turned off', 'info');
    } else {
      setSleepTimerRemaining(minutes * 60);
      showToast(`Sleep timer set for ${minutes} minutes`, 'info');
    }
  };

  const rememberTrack = (track) => {
    setRecentlyPlayed((previous) => [track, ...previous.filter((item) => item.id !== track.id)].slice(0, 30));
    setTotalPlayedCount((prev) => prev + 1);
  };

  function playTrack(track, queue = [], force = false) {
    if (!track?.videoId) return;
    if (!force && currentTrack.id === track.id) {
      if (isPlaying) playerRef.current?.pauseVideo?.();
      else playerRef.current?.playVideo?.();
      return;
    }

    const nextQueue = force
      ? (queue.length ? queue : [track])
      : (smartMoodMode && moodQueue.length ? moodQueue : (queue.length ? queue : [track]));

    setCurrentTrack(track);
    setPlaybackQueue(nextQueue);
    setCurrentTime(0);
    setDuration(track.durationSec || 0);
    setIsPlaying(true);
    rememberTrack(track);
    setStatusMessage('');
  }

  const handleAddToQueue = (track) => {
    if (!track?.videoId) return;
    setPlaybackQueue((prev) => [...prev.filter((t) => t.id !== track.id), track]);
    showToast(`Added “${track.title.slice(0, 30)}” to queue`, 'queue');
  };

  const handleRemoveFromQueue = (trackId) => {
    setPlaybackQueue((prev) => prev.filter((t) => t.id !== trackId));
    showToast('Track removed from queue', 'info');
  };

  const handleClearQueue = () => {
    setPlaybackQueue(currentTrack.videoId ? [currentTrack] : []);
    showToast('Queue cleared', 'info');
  };

  const handleShuffleQueue = () => {
    setPlaybackQueue((prev) => {
      const rest = prev.filter((t) => t.id !== currentTrack.id);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      return currentTrack.videoId ? [currentTrack, ...rest] : rest;
    });
    showToast('Queue shuffled', 'info');
  };

  const handleSearchSubmit = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    searchControllerRef.current?.abort();
    const controller = new AbortController();
    searchControllerRef.current = controller;
    setActiveTab('search');
    setSearchResults([]);
    setIsSearching(true);
    setStatusMessage('');

    // Update search history
    setSearchHistory((prev) => [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10));

    try {
      const data = await apiGet(`/api/search?q=${encodeURIComponent(trimmed)}&limit=20`, { signal: controller.signal });
      const tracks = (data.results || []).map(mapTrack).filter(Boolean);
      setSearchResults(tracks);
      setPlaybackQueue(tracks);
      if (!tracks.length) setStatusMessage(`No results found for “${trimmed}”. Try another keyword or artist.`);
    } catch (error) {
      if (error.name !== 'AbortError') setStatusMessage(error.message);
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  };

  const handleMoodSelect = (moodId) => {
    const changingMood = moodId !== activeMood;
    setActiveMood(moodId);
    setActiveTab('home');
    setSearchResults(null);
    setPlayingSourceName(`${moodId.charAt(0).toUpperCase() + moodId.slice(1)} Mix`);
    loadMood(moodId, changingMood && smartMoodMode && Boolean(currentTrack.videoId));
  };

  const handleCategorySelect = async (category, label) => {
    setActiveCategory(category);
    setCategoryTitle(label || category);
    setActiveTab('category-detail');
    showToast(`Loading ${label || category} music…`, 'info');
    await loadTrending(category);
  };

  const handlePlayerState = (playing) => setIsPlaying(Boolean(playing));

  const handleProgress = ({ currentTime: nextTime, duration: nextDuration }) => {
    if (Number.isFinite(nextTime)) setCurrentTime(nextTime);
    if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration);
  };

  const handleNext = () => {
    const queue = smartMoodMode && moodQueue.length ? moodQueue : playbackQueue;
    if (!queue.length) return;
    const currentIndex = queue.findIndex((track) => track.id === currentTrack.id);
    let nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % queue.length;
    if (isShuffle && queue.length > 1) {
      const options = queue.map((_track, index) => index).filter((index) => index !== currentIndex);
      nextIndex = options[Math.floor(Math.random() * options.length)];
    }
    const nextTrack = queue[nextIndex];
    if (nextTrack.id === currentTrack.id) {
      playerRef.current?.seekTo?.(0, true);
      playerRef.current?.playVideo?.();
      setCurrentTime(0);
      return;
    }
    playTrack(nextTrack, queue, true);
  };

  const playSimilarVibeSong = useCallback(async (baseTrack) => {
    if (!baseTrack?.videoId) return;

    // Clean artist and title for search query
    const cleanArtist = (baseTrack.artist || '')
      .replace(/\s*-\s*Topic/i, '')
      .replace(/VEVO/i, '')
      .replace(/Official.*$/i, '')
      .trim();

    const cleanTitle = (baseTrack.title || '')
      .replace(/\[.*?\]|\(.*?\)/g, '')
      .replace(/ft\..*|feat\..*/i, '')
      .trim();

    const queryTerm = `${cleanArtist} ${cleanTitle} vibe songs`.trim();

    try {
      const data = await apiGet(`/api/search?q=${encodeURIComponent(queryTerm)}&limit=15`);
      const results = (data.results || []).map(mapTrack).filter(Boolean);

      const recentIds = new Set(recentlyPlayed.map((t) => t.id));
      recentIds.add(baseTrack.id);

      let nextPick = results.find((t) => !recentIds.has(t.id));
      if (!nextPick) {
        nextPick = results.find((t) => t.id !== baseTrack.id) || results[0];
      }

      if (nextPick && nextPick.videoId) {
        showToast(`✨ Same Vibe Autoplay: ${nextPick.title.slice(0, 32)}…`, 'info');
        setPlaybackQueue((prev) => {
          const exists = prev.some((t) => t.id === nextPick.id);
          return exists ? prev : [...prev, nextPick];
        });
        playTrack(nextPick, [...playbackQueue, nextPick], true);
        return;
      }
    } catch {
      // Ignore API errors, fallback to local pool below
    }

    // Local fallback pool
    const pool = [...recommendedTracks, ...trendingTracks, ...favorites];
    const candidate = pool.find((t) => t.id !== baseTrack.id && t.videoId);
    if (candidate) {
      showToast(`✨ Same Vibe Autoplay: ${candidate.title.slice(0, 32)}…`, 'info');
      playTrack(candidate, playbackQueue, true);
    } else {
      handleNext();
    }
  }, [recentlyPlayed, playbackQueue, recommendedTracks, trendingTracks, favorites, showToast]);

  const handleEnded = () => {
    if (repeatMode === 'one') {
      playerRef.current?.seekTo?.(0, true);
      playerRef.current?.playVideo?.();
      setCurrentTime(0);
      return;
    }
    if (autoPlaySimilarVibe && currentTrack?.videoId) {
      playSimilarVibeSong(currentTrack);
      return;
    }
    handleNext();
  };

  const handlePrevious = () => {
    if (currentTime > 4) {
      playerRef.current?.seekTo?.(0, true);
      setCurrentTime(0);
      return;
    }
    const queue = smartMoodMode && moodQueue.length ? moodQueue : playbackQueue;
    if (!queue.length) return;
    const currentIndex = queue.findIndex((track) => track.id === currentTrack.id);
    const previousIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    playTrack(queue[previousIndex], queue, true);
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    playerRef.current?.seekTo?.(time, true);
  };

  const handleVolumeChange = (newVolume) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolume(clamped);
    try { window.localStorage.setItem('nexa-volume', String(clamped)); } catch { /* ignore */ }
    setIsMuted(false);
    playerRef.current?.unMute?.();
    playerRef.current?.setVolume?.(Math.round(clamped * 100));
  };

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      playerRef.current?.unMute?.();
      playerRef.current?.setVolume?.(Math.round(volume * 100));
      showToast('Sound unmuted', 'info');
    } else {
      setIsMuted(true);
      playerRef.current?.mute?.();
      showToast('Sound muted', 'info');
    }
  }, [isMuted, volume, showToast]);

  const handleToggleFavorite = useCallback((track) => {
    if (!track?.videoId) return;
    const exists = favorites.some((item) => item.id === track.id);
    if (exists) {
      setFavorites((prev) => prev.filter((item) => item.id !== track.id));
      showToast(`Removed from Liked Songs`, 'info');
    } else {
      setFavorites((prev) => [track, ...prev]);
      showToast(`Added “${track.title.slice(0, 30)}” to Liked Songs`, 'like');
    }
  }, [favorites, setFavorites, showToast]);

  const handleToggleRepeat = () => {
    setRepeatMode((prev) => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      showToast(`Repeat mode: ${next === 'one' ? 'Repeat One' : next === 'all' ? 'Repeat All' : 'Off'}`, 'info');
      return next;
    });
  };

  const handleSelectPlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    try {
      playerRef.current?.setPlaybackRate?.(speed);
      showToast(`Playback speed: ${speed}x`, 'info');
    } catch {
      showToast(`Playback speed set to ${speed}x`, 'info');
    }
  };

  // Playlist management
  const handleCreatePlaylist = (newPl) => {
    const created = {
      ...newPl,
      id: `playlist-${Date.now()}`,
      tracks: []
    };
    setPlaylists((prev) => [created, ...prev]);
    showToast(`Playlist “${newPl.name}” created`, 'success');
  };

  const handleDeletePlaylist = (id) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    showToast('Playlist deleted', 'info');
  };

  const handleAddTrackToPlaylist = (playlistId, track) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.tracks?.some((t) => t.id === track.id)) return pl;
        return { ...pl, tracks: [...(pl.tracks || []), track] };
      })
    );
    showToast(`Added “${track.title.slice(0, 25)}” to playlist`, 'success');
    setAddingTrackToPlaylist(null);
    setIsPlaylistModalOpen(false);
  };

  const handleRemoveTrackFromPlaylist = (playlistId, trackId) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return { ...pl, tracks: pl.tracks.filter((t) => t.id !== trackId) };
      })
    );
    showToast('Track removed from playlist', 'info');
  };

  const handlePlayPlaylist = (playlist, shuffle = false) => {
    if (!playlist?.tracks?.length) {
      showToast('This playlist is empty.', 'info');
      return;
    }
    let queue = [...playlist.tracks];
    if (shuffle) {
      queue.sort(() => Math.random() - 0.5);
    }
    playTrack(queue[0], queue, true);
    setPlayingSourceName(playlist.name);
    setIsPlaylistModalOpen(false);
  };

  // Artist & Album playback
  const handlePlayArtistCatalog = async (query, artistName, shuffle = false) => {
    setIsArtistModalOpen(false);
    setSearchQuery(artistName);
    try {
      showToast(`Loading songs by ${artistName}…`, 'info');
      const data = await apiGet(`/api/search?q=${encodeURIComponent(query)}&limit=16`);
      const tracks = (data.results || []).map(mapTrack).filter(Boolean);
      if (tracks.length) {
        let queue = tracks;
        if (shuffle) queue = [...tracks].sort(() => Math.random() - 0.5);
        playTrack(queue[0], queue, true);
        setPlayingSourceName(`${artistName} Hits`);
      }
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handlePlayAlbum = async (album, shuffle = false) => {
    setIsAlbumModalOpen(false);
    try {
      showToast(`Loading album “${album.title}”…`, 'info');
      const data = await apiGet(`/api/search?q=${encodeURIComponent(album.query)}&limit=14`);
      const tracks = (data.results || []).map(mapTrack).filter(Boolean);
      if (tracks.length) {
        let queue = tracks;
        if (shuffle) queue = [...tracks].sort(() => Math.random() - 0.5);
        playTrack(queue[0], queue, true);
        setPlayingSourceName(album.title);
      }
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  // Play all favorites
  const handlePlayAllFavorites = (shuffle = false) => {
    if (!favorites.length) return;
    let queue = [...favorites];
    if (shuffle) queue.sort(() => Math.random() - 0.5);
    playTrack(queue[0], queue, true);
    setPlayingSourceName('Liked Songs');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (currentTrack.videoId) {
          if (isPlaying) playerRef.current?.pauseVideo?.();
          else playerRef.current?.playVideo?.();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(duration, currentTime + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(volume + 0.05);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(volume - 0.05);
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'l' || e.key === 'L') {
        if (currentTrack.videoId) handleToggleFavorite(currentTrack);
      } else if (e.key === 'q' || e.key === 'Q') {
        setIsQueueOpen((open) => !open);
      } else if (e.key === 'c' || e.key === 'C') {
        if (currentTrack.videoId) setIsLyricsOpen((open) => !open);
      } else if (e.key === 'v' || e.key === 'V') {
        setIsVideoVisible((show) => !show);
      } else if (e.key === 'f' || e.key === 'F') {
        if (currentTrack.videoId) setIsFullScreenOpen((fs) => !fs);
      } else if (e.key === 'Escape') {
        setIsFullScreenOpen(false);
        setIsLyricsOpen(false);
        setIsQueueOpen(false);
        setIsShortcutsOpen(false);
        setIsPlaylistModalOpen(false);
        setIsArtistModalOpen(false);
        setIsAlbumModalOpen(false);
        setIsAudioSettingsOpen(false);
        setIsStatsOpen(false);
        setIsShareOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, isPlaying, currentTime, duration, volume, isMuted, favorites, handleToggleMute, handleToggleFavorite]);

  const isLiked = favorites.some((track) => track.id === currentTrack.id);

  // Filtered and sorted search results
  const filteredSearchResults = (searchResults || [])
    .filter((track) => {
      if (searchFilter === 'songs') return true;
      if (searchFilter === 'artists') return track.artist.toLowerCase().includes(searchQuery.toLowerCase());
      if (searchFilter === 'albums') return track.title.toLowerCase().includes('album') || track.title.toLowerCase().includes('soundtrack');
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'duration') return (b.durationSec || 0) - (a.durationSec || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className={`nexa-app-root theme-${theme}`}>
      {isPlaying && <div className="nexa-ambient-backglow" aria-hidden="true" />}
      <div className="app-layout-container">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'search') setSearchResults(null);
          }}
          activeMood={activeMood}
          setActiveMood={handleMoodSelect}
          onSearchClick={() => {
            setSearchResults(null);
            document.querySelector('.search-input')?.focus();
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          user={user}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenPlaylists={() => {
            setActivePlaylist(null);
            setAddingTrackToPlaylist(null);
            setIsPlaylistModalOpen(true);
          }}
          onOpenAuth={() => setActiveTab('login')}
        />

        {/* Center Main Stage */}
        <main className="center-content">
          <Header
            searchQuery={searchQuery}
            setSearchQuery={(query) => {
              setSearchQuery(query);
              if (!query) {
                setSearchResults(null);
                setActiveTab('home');
              }
            }}
            onSearchSubmit={handleSearchSubmit}
            isSearching={isSearching}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen((open) => !open)}
            onToggleMobileRightSidebar={() => setIsMobileRightSidebarOpen((open) => !open)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            searchHistory={searchHistory}
            onClearHistory={() => setSearchHistory([])}
            onSelectHistoryItem={(q) => {
              setSearchQuery(q);
              handleSearchSubmit(q);
            }}
            searchFilter={searchFilter}
            onSelectSearchFilter={setSearchFilter}
            sortBy={sortBy}
            onSelectSortBy={setSortBy}
            onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
            user={user}
            onOpenAuth={() => setActiveTab('login')}
            onOpenProfile={() => setIsProfileOpen(true)}
          />

          {statusMessage && (
            <div className="api-status-notice" role="status">
              <AlertCircle size={18} />
              <span>{statusMessage}</span>
              <button onClick={() => setStatusMessage('')} aria-label="Dismiss message">
                <X size={16} />
              </button>
            </div>
          )}

          {/* YouTube Audio/Video Engine */}
          {currentTrack.videoId && (
            <div className={`video-screen-container ${isVideoVisible ? 'visible' : 'audio-only-hidden'}`}>
              <div className="video-screen-header">
                <div className="video-title-wrap">
                  <Radio size={16} className="live-icon" />
                  <div>
                    <h4>{currentTrack.title}</h4>
                    <p>{currentTrack.artist}</p>
                  </div>
                </div>
                <div className="video-header-controls">
                  <a href={currentTrack.url} target="_blank" rel="noreferrer" className="yt-open-link" title="Open video on YouTube">
                    <ExternalLink size={14} />
                    <span>YouTube</span>
                  </a>
                  <button className="minimize-video-btn" onClick={() => setIsVideoVisible(false)} title="Audio Only">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="video-frame-aspect">
                <YouTubePlayer
                  videoId={currentTrack.videoId}
                  shouldPlay={isPlaying}
                  onPlayerReady={(player) => {
                    playerRef.current = player;
                    if (player) {
                      player.setVolume?.(isMuted ? 0 : Math.round(volume * 100));
                      if (isMuted) player.mute?.();
                    }
                  }}
                  onPlaybackState={handlePlayerState}
                  onProgress={handleProgress}
                  onEnded={handleEnded}
                  onError={(reason) => {
                    showToast(typeof reason === 'string' ? reason : 'Video cannot be embedded. Skipping next…', 'info');
                  }}
                  isAudioOnly={!isVideoVisible}
                />
              </div>
            </div>
          )}

          {/* VIEWS */}
          {activeTab === 'login' ? (
            <LoginPage
              onLoginSuccess={(u) => {
                handleLoginSuccess(u);
                setActiveTab('home');
              }}
              onCancel={() => setActiveTab('home')}
              showToast={showToast}
            />
          ) : activeTab === 'search' ? (
            <section className="page-section search-results-section">
              <div className="section-header-row">
                <div>
                  <span className="eyebrow">EXPLORE CATALOG</span>
                  <h2 className="section-heading">
                    {searchQuery ? `Results for “${searchQuery}”` : 'Search any song or artist'}
                  </h2>
                </div>
              </div>

              {isSearching ? (
                <div className="loading-state">
                  <LoaderCircle className="spin" size={24} />
                  <span>Searching catalog…</span>
                </div>
              ) : filteredSearchResults.length ? (
                <div className="cards-grid compact-cards-grid">
                  {filteredSearchResults.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isCurrentPlaying={currentTrack.id === track.id}
                      isPlaying={isPlaying}
                      onPlay={() => playTrack(track, filteredSearchResults)}
                      onToggleLike={handleToggleFavorite}
                      isLiked={favorites.some((f) => f.id === track.id)}
                      onAddToQueue={handleAddToQueue}
                      onAddToPlaylist={(t) => {
                        setAddingTrackToPlaylist(t);
                        setActivePlaylist(null);
                        setIsPlaylistModalOpen(true);
                      }}
                      onShare={(t) => {
                        setShareItem(t);
                        setIsShareOpen(true);
                      }}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Music2 size={36} />
                  <h3>{searchQuery ? 'No tracks found' : 'Type to search'}</h3>
                  <p>Discover songs, artists, soundtracks, or vibes.</p>
                </div>
              )}
            </section>
          ) : activeTab === 'library' ? (
            <FavouritesView
              favorites={favorites}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={playTrack}
              onPlayAllFavorites={handlePlayAllFavorites}
              onToggleLike={handleToggleFavorite}
              onAddToQueue={handleAddToQueue}
              onAddToPlaylist={(t) => {
                setAddingTrackToPlaylist(t);
                setActivePlaylist(null);
                setIsPlaylistModalOpen(true);
              }}
              onShare={(t) => {
                setShareItem(t);
                setIsShareOpen(true);
              }}
            />
          ) : activeTab === 'recent' ? (
            <HistoryView
              recentlyPlayed={recentlyPlayed}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={playTrack}
              onClearHistory={() => {
                setRecentlyPlayed([]);
                showToast('Listening history cleared', 'info');
              }}
              onToggleLike={handleToggleFavorite}
              favorites={favorites}
              onAddToQueue={handleAddToQueue}
              onAddToPlaylist={(t) => {
                setAddingTrackToPlaylist(t);
                setActivePlaylist(null);
                setIsPlaylistModalOpen(true);
              }}
              onShare={(t) => {
                setShareItem(t);
                setIsShareOpen(true);
              }}
            />
          ) : activeTab === 'categories' ? (
            <CategoriesView onSelectCategory={handleCategorySelect} />
          ) : activeTab === 'category-detail' ? (
            <section className="page-section">
              <div className="section-header-row">
                <div>
                  <span className="eyebrow"><Sparkles size={14} color="#a855f7" /> CURATED SELECTION</span>
                  <h2 className="section-heading">{categoryTitle}</h2>
                </div>
                <button
                  className="btn-outline-pill"
                  onClick={() => loadTrending(activeCategory)}
                  disabled={isLoadingTrending}
                >
                  <RefreshCw size={14} className={isLoadingTrending ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingTrending && trendingTracks.length === 0 ? (
                <div className="loading-state">
                  <LoaderCircle className="spin" size={24} />
                  <span>Loading {categoryTitle} songs…</span>
                </div>
              ) : trendingTracks.length ? (
                <div className="cards-grid compact-cards-grid">
                  {trendingTracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isCurrentPlaying={currentTrack.id === track.id}
                      isPlaying={isPlaying}
                      onPlay={() => playTrack(track, trendingTracks)}
                      onToggleLike={handleToggleFavorite}
                      isLiked={favorites.some((f) => f.id === track.id)}
                      onAddToQueue={handleAddToQueue}
                      onAddToPlaylist={(t) => {
                        setAddingTrackToPlaylist(t);
                        setActivePlaylist(null);
                        setIsPlaylistModalOpen(true);
                      }}
                      onShare={(t) => {
                        setShareItem(t);
                        setIsShareOpen(true);
                      }}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Music2 size={36} />
                  <h3>No tracks available</h3>
                  <p>Check back later or choose another genre.</p>
                </div>
              )}
            </section>
          ) : (
            /* Home Dashboard matching Image 2 */
            <HomeDashboard
              user={user}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={(track, queue) => playTrack(track, queue || trendingTracks)}
              recentlyPlayed={recentlyPlayed}
              trendingTracks={trendingTracks}
              recommendedTracks={recommendedTracks}
              activeMood={activeMood}
              onSelectMood={handleMoodSelect}
              onExploreClick={() => {
                if (trendingTracks.length) playTrack(trendingTracks[0], trendingTracks);
                else loadTrending('trending').then((tracks) => tracks[0] && playTrack(tracks[0], tracks));
              }}
              onToggleLike={handleToggleFavorite}
              favorites={favorites}
              onAddToQueue={handleAddToQueue}
              onAddToPlaylist={(t) => {
                setAddingTrackToPlaylist(t);
                setActivePlaylist(null);
                setIsPlaylistModalOpen(true);
              }}
              onShare={(t) => {
                setShareItem(t);
                setIsShareOpen(true);
              }}
              onSelectArtist={(artist) => {
                setActiveArtist(artist);
                setIsArtistModalOpen(true);
              }}
              onSelectAlbum={(album) => {
                setActiveAlbum(album);
                setIsAlbumModalOpen(true);
              }}
              onOpenNotifications={() => showToast('You are all caught up on new releases!', 'info')}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenAuth={() => setActiveTab('login')}
              onSeeAllCategory={(cat, label) => handleCategorySelect(cat, label)}
            />
          )}
        </main>

        {/* Right Mood & Recommendations Sidebar */}
        <RightSidebar
          recommendedTracks={recommendedTracks}
          favoriteTracks={favorites}
          activeMood={activeMood}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={(track) => playTrack(track, recommendedTracks)}
          onToggleFavorite={handleToggleFavorite}
          onSeeAllFavorites={() => setActiveTab('library')}
          onAddToQueue={handleAddToQueue}
          isOpenMobile={isMobileRightSidebarOpen}
          onCloseMobile={() => setIsMobileRightSidebarOpen(false)}
        />
      </div>

      {/* Bottom Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => {
          if (!currentTrack.videoId) {
            if (trendingTracks.length) playTrack(trendingTracks[0], trendingTracks);
            return;
          }
          if (isPlaying) playerRef.current?.pauseVideo?.();
          else playerRef.current?.playVideo?.();
        }}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isShuffle={isShuffle}
        onToggleShuffle={() => {
          setIsShuffle((s) => !s);
          showToast(!isShuffle ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
        }}
        repeatMode={repeatMode}
        onToggleRepeat={handleToggleRepeat}
        isLiked={isLiked}
        onToggleLike={() => handleToggleFavorite(currentTrack)}
        onToggleLyrics={() => {
          if (currentTrack.videoId) setIsLyricsOpen((open) => !open);
          else showToast('Play a song to view lyrics', 'info');
        }}
        isLyricsOpen={isLyricsOpen}
        onToggleQueue={() => setIsQueueOpen((open) => !open)}
        isQueueOpen={isQueueOpen}
        isVideoVisible={isVideoVisible}
        onToggleVideo={() => {
          if (!currentTrack.videoId) {
            showToast('Play a song first to view video', 'info');
            return;
          }
          setIsVideoVisible((show) => !show);
        }}
        onOpenFullScreen={() => {
          if (currentTrack.videoId) setIsFullScreenOpen(true);
        }}
        onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
        autoPlaySimilar={autoPlaySimilarVibe}
        onToggleAutoPlaySimilar={() => {
          setAutoPlaySimilarVibe((prev) => {
            const next = !prev;
            showToast(next ? '✨ Same Vibe Autoplay ON' : 'Same Vibe Autoplay OFF', 'info');
            return next;
          });
        }}
      />

      {/* Bottom Mobile Navigation (Matching Image 2) */}
      <BottomMobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchClick={() => {
          setSearchResults(null);
          document.querySelector('.search-input')?.focus();
        }}
      />

      {/* Full-Screen Now Playing View (Matching Image 2 Right Side!) */}
      <FullScreenPlayer
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => {
          if (isPlaying) playerRef.current?.pauseVideo?.();
          else playerRef.current?.playVideo?.();
        }}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle((s) => !s)}
        repeatMode={repeatMode}
        onToggleRepeat={handleToggleRepeat}
        isLiked={isLiked}
        onToggleLike={handleToggleFavorite}
        onToggleLyrics={() => {
          setIsFullScreenOpen(false);
          setIsLyricsOpen(true);
        }}
        onToggleQueue={() => {
          setIsFullScreenOpen(false);
          setIsQueueOpen(true);
        }}
        isVideoVisible={isVideoVisible}
        onToggleVideo={() => setIsVideoVisible((v) => !v)}
        onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
        onOpenShare={(t) => {
          setShareItem(t);
          setIsShareOpen(true);
        }}
        playingSourceName={playingSourceName}
        autoPlaySimilar={autoPlaySimilarVibe}
        onToggleAutoPlaySimilar={() => {
          setAutoPlaySimilarVibe((prev) => {
            const next = !prev;
            showToast(next ? '✨ Same Vibe Autoplay ON' : 'Same Vibe Autoplay OFF', 'info');
            return next;
          });
        }}
      />

      {/* Playlists Management Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => {
          setIsPlaylistModalOpen(false);
          setAddingTrackToPlaylist(null);
        }}
        playlists={playlists}
        onCreatePlaylist={handleCreatePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onPlayPlaylist={handlePlayPlaylist}
        onSelectPlaylist={setActivePlaylist}
        activePlaylist={activePlaylist}
        onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
        addingTrack={addingTrackToPlaylist}
        onAddTrackToPlaylist={handleAddTrackToPlaylist}
      />

      {/* Artist Profile Modal */}
      <ArtistModal
        artist={activeArtist}
        isOpen={isArtistModalOpen}
        onClose={() => setIsArtistModalOpen(false)}
        onPlayAll={handlePlayArtistCatalog}
        isFavorite={favorites.some((f) => f.artist?.toLowerCase().includes(activeArtist?.name.toLowerCase()))}
        onToggleFavoriteArtist={(art) => showToast(`Following ${art.name}`, 'like')}
      />

      {/* Album Modal */}
      <AlbumModal
        album={activeAlbum}
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        onPlayAlbum={handlePlayAlbum}
      />

      {/* Audio Settings & Equalizer Modal */}
      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
        equalizerPreset={equalizerPreset}
        onSelectEqualizer={(p) => {
          setEqualizerPreset(p);
          showToast(`Equalizer: ${p.toUpperCase()} applied`, 'info');
        }}
        playbackSpeed={playbackSpeed}
        onSelectPlaybackSpeed={handleSelectPlaybackSpeed}
        sleepTimerRemaining={sleepTimerRemaining}
        onSetSleepTimer={handleSetSleepTimer}
        audioQuality={audioQuality}
        onSelectAudioQuality={(q) => {
          setAudioQuality(q);
          showToast(`Audio quality: ${q}`, 'info');
        }}
      />

      {/* Listening Insights / Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        totalPlayedCount={totalPlayedCount}
        recentlyPlayed={recentlyPlayed}
        favorites={favorites}
      />

      {/* Share Modal */}
      <ShareModal
        item={shareItem}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Profile & Theme Settings Modal */}
      <ProfileModal
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          showToast('Profile updated!', 'success');
        }}
        theme={theme}
        onSelectTheme={(t) => {
          setTheme(t);
          showToast(`Theme changed to ${t}`, 'info');
        }}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenAuth={() => {
          setIsProfileOpen(false);
          setActiveTab('login');
        }}
        onLogout={handleLogout}
      />

      {/* Cool OTP Login & Verification Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        showToast={showToast}
      />

      {/* Synced Lyrics Modal */}
      <LyricsModal
        track={currentTrack.videoId ? currentTrack : null}
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        currentTime={currentTime}
        onSeek={handleSeek}
      />

      {/* Playback Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentTrack={currentTrack}
        queue={playbackQueue.length ? playbackQueue : (moodQueue.length ? moodQueue : [currentTrack])}
        isPlaying={isPlaying}
        onPlayTrack={(track) => playTrack(track, playbackQueue, true)}
        onRemoveTrack={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
        onShuffleQueue={handleShuffleQueue}
      />

      {/* Keyboard Shortcuts Helper Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
