import { Home, Search, Library, ListMusic } from 'lucide-react';

export const BottomMobileNav = ({
  activeTab,
  setActiveTab,
  onSearchClick
}) => {
  return (
    <nav className="bottom-mobile-nav-bar" aria-label="Mobile Navigation">
      <button
        className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('search');
          onSearchClick?.();
        }}
      >
        <Search size={22} />
        <span>Search</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'library' ? 'active' : ''}`}
        onClick={() => setActiveTab('library')}
      >
        <Library size={22} />
        <span>Library</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'playlists' ? 'active' : ''}`}
        onClick={() => setActiveTab('playlists')}
      >
        <ListMusic size={22} />
        <span>Playlists</span>
      </button>
    </nav>
  );
};

