import { useEffect, useRef, useState } from 'react';
import {
  Compass,
  Keyboard,
  Menu,
  Mic,
  MicOff,
  Search,
  Sparkles,
  X,
  History,
  SlidersHorizontal,
  Sliders
} from 'lucide-react';
import { apiGet } from '../lib/api';

export const Header = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  isSearching,
  onToggleMobileSidebar,
  onToggleMobileRightSidebar,
  onOpenShortcuts,
  searchHistory = [],
  onClearHistory,
  onSelectHistoryItem,
  searchFilter = 'all',
  onSelectSearchFilter,
  sortBy = 'relevance',
  onSelectSortBy,
  onOpenAudioSettings,
  user,
  onOpenAuth,
  onOpenProfile
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // Setup Voice Search if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript) {
          setSearchQuery(transcript);
          onSearchSubmit(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      speechRecognitionRef.current = recognition;
    }
  }, [setSearchQuery, onSearchSubmit]);

  const toggleVoiceSearch = () => {
    if (!speechRecognitionRef.current) {
      alert('Voice search is not supported in this browser. Please type your search query.');
      return;
    }
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Keyboard shortcut Ctrl+K to focus search
  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Real-time suggestions
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const data = await apiGet(`/api/suggest?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions.slice(0, 8));
          setShowSuggestions(data.suggestions.length > 0);
          setSelectedIndex(-1);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        const localSuggestions = [
          `${query} songs`,
          `${query} official audio`,
          `${query} playlist`
        ];
        setSuggestions(localSuggestions);
        setShowSuggestions(true);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target) && !inputRef.current?.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submit = (value) => {
    const query = value.trim();
    if (!query) return;
    setSearchQuery(query);
    setShowSuggestions(false);
    onSearchSubmit(query);
  };

  const handleKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === 'Enter') submit(searchQuery);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      submit(suggestions[selectedIndex] || searchQuery);
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <header className="search-header">
      <div className="search-header-main-row">
        <button
          className="mobile-nav-toggle-btn"
          onClick={onToggleMobileSidebar}
          title="Open navigation"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" />
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder="Search songs, artists, albums, or vibes…"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              if (event.target.value.trim().length < 2) setShowSuggestions(false);
            }}
            onFocus={() => searchQuery.trim().length >= 2 && suggestions.length && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            aria-label="Search music"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
          />

          {/* Voice Search Mic Button */}
          <button
            className={`voice-search-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleVoiceSearch}
            title={isListening ? 'Listening… speak now' : 'Search with voice'}
            aria-label="Voice search"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {searchQuery ? (
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : (
            <div className="shortcut-badge" onClick={() => inputRef.current?.focus()}><span>Ctrl K</span></div>
          )}

          {isSearching && <div className="search-spinner" aria-label="Searching" />}

          {/* Real-time suggestions & Recent searches dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown" ref={dropdownRef} role="listbox">
              <div className="suggestions-header">
                <Sparkles size={13} className="suggest-sparkle" />
                <span>Instant Suggestions</span>
              </div>
              <ul className="suggestions-list">
                {suggestions.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className={`suggestion-item ${selectedIndex === index ? 'highlighted' : ''}`}
                    role="option"
                    aria-selected={selectedIndex === index}
                    onClick={() => submit(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Search size={14} className="item-search-icon" />
                    <span className="suggestion-text">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Filter toggle and utility buttons */}
        <div className="header-right-actions">
          <button
            className={`header-filter-btn ${showFilterBar ? 'active' : ''}`}
            onClick={() => setShowFilterBar((prev) => !prev)}
            title="Search filters & sorting"
            aria-label="Search filters"
          >
            <SlidersHorizontal size={17} />
          </button>

          {onOpenAudioSettings && (
            <button
              className="header-shortcut-btn"
              onClick={onOpenAudioSettings}
              title="Equalizer & Audio settings"
              aria-label="Audio settings"
            >
              <Sliders size={18} />
            </button>
          )}

          {onOpenShortcuts && (
            <button
              className="header-shortcut-btn"
              onClick={onOpenShortcuts}
              title="Keyboard shortcuts"
              aria-label="Keyboard shortcuts"
            >
              <Keyboard size={18} />
            </button>
          )}

          <button
            className="mobile-recommends-toggle-btn"
            onClick={onToggleMobileRightSidebar}
            title="View mood mix"
            aria-label="Mood mix"
          >
            <Compass size={20} />
          </button>

          {user?.isLoggedIn ? (
            <button
              className="header-avatar-badge-btn"
              onClick={onOpenProfile}
              title={`Profile (${user.name})`}
            >
              <img src={user.avatar} alt={user.name} className="header-avatar-thumb" />
              <span className="header-online-dot" />
            </button>
          ) : (
            <button
              className="header-signin-cta"
              onClick={onOpenAuth}
              title="Sign in with instant OTP"
            >
              <Sparkles size={14} color="#a855f7" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Sub-bar */}
      {showFilterBar && (
        <div className="search-filters-subbar">
          <div className="filter-chips-row">
            {['all', 'songs', 'artists', 'albums'].map((f) => (
              <button
                key={f}
                className={`subbar-filter-chip ${searchFilter === f ? 'active' : ''}`}
                onClick={() => onSelectSearchFilter?.(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="sort-by-select-wrap">
            <span className="sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSelectSortBy?.(e.target.value)}
              className="sort-select"
            >
              <option value="relevance">Relevance</option>
              <option value="duration">Duration</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      {/* Recent search history chips */}
      {searchHistory.length > 0 && searchQuery.length === 0 && (
        <div className="search-history-chips-row">
          <History size={13} color="#94a3b8" />
          <span className="history-label">Recent:</span>
          {searchHistory.slice(0, 5).map((q, idx) => (
            <button
              key={`${q}-${idx}`}
              className="history-chip"
              onClick={() => onSelectHistoryItem?.(q)}
            >
              <span>{q}</span>
            </button>
          ))}
          {onClearHistory && (
            <button className="clear-history-text-btn" onClick={onClearHistory}>Clear</button>
          )}
        </div>
      )}
    </header>
  );
};
