export const CURRENT_USER = {
  name: 'Music Lover',
  handle: '@musiclover',
  plan: 'Nexa Premium · Lossless Hi-Fi',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
};

export const MOODS = [
  { id: 'romantic', name: 'Romantic', iconName: 'Heart', color: '#fb7185' },
  { id: 'happy', name: 'Happy', iconName: 'Sun', color: '#fbbf24' },
  { id: 'chill', name: 'Chill', iconName: 'Moon', color: '#38bdf8' },
  { id: 'focus', name: 'Focus', iconName: 'Brain', color: '#818cf8' },
  { id: 'workout', name: 'Workout', iconName: 'Dumbbell', color: '#f87171' },
  { id: 'party', name: 'Party', iconName: 'Zap', color: '#e879f9' },
  { id: 'sad', name: 'Emotional', iconName: 'CloudRain', color: '#a5b4fc' },
  { id: 'devotional', name: 'Devotional', iconName: 'Sparkles', color: '#fbbf24' },
  { id: 'bollywood', name: 'Bollywood', iconName: 'Music2', color: '#fb923c' },
  { id: 'hiphop', name: 'Hip-Hop', iconName: 'Mic2', color: '#c084fc' },
  { id: 'rock', name: 'Rock', iconName: 'Flame', color: '#fb7185' },
  { id: 'classical', name: 'Classical', iconName: 'Waves', color: '#67e8f9' }
];

export const BROWSE_CATEGORIES = [
  { id: 'trending', label: 'For You' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'english', label: 'English' },
  { id: 'bengali', label: 'Bengali' },
  { id: 'punjabi', label: 'Punjabi' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'telugu', label: 'Telugu' },
  { id: 'bollywood', label: 'Bollywood' },
  { id: 'pop', label: 'Pop' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'sad', label: 'Sad Songs' },
  { id: 'party', label: 'Party' },
  { id: 'workout', label: 'Workout' },
  { id: 'lofi', label: 'Lo-fi' },
  { id: 'hiphop', label: 'Hip-Hop' },
  { id: 'rock', label: 'Rock' },
  { id: 'classical', label: 'Classical' },
  { id: 'instrumental', label: 'Instrumental' },
  { id: 'devotional', label: 'Devotional' },
  { id: 'newreleases', label: 'New Releases' }
];

export const DAILY_MIXES = [
  {
    id: 'daily-mix-1',
    title: 'Daily Mix 1',
    description: 'Arijit Singh, Sachin-Jigar, Pritam, and more',
    badge: 'MADE FOR YOU',
    bg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    accent: '#38bdf8',
    shape: 'circle',
    query: 'Arijit Singh Pritam romantic hindi hits'
  },
  {
    id: 'daily-mix-2',
    title: 'Daily Mix 2',
    description: 'The Weeknd, Harry Styles, Dua Lipa, and more',
    badge: 'POP VIBES',
    bg: 'linear-gradient(135deg, #ea580c, #f97316)',
    accent: '#fb923c',
    shape: 'split',
    query: 'The Weeknd Harry Styles Dua Lipa pop hits'
  },
  {
    id: 'daily-mix-3',
    title: 'Daily Mix 3',
    description: 'Diljit Dosanjh, Karan Aujla, Shubh, and more',
    badge: 'PUNJABI HEAT',
    bg: 'linear-gradient(135deg, #be123c, #fb7185)',
    accent: '#fda4af',
    shape: 'half',
    query: 'Diljit Dosanjh Karan Aujla Punjabi hits'
  },
  {
    id: 'daily-mix-4',
    title: 'Daily Mix 4',
    description: 'Billie Eilish, Sabrina Carpenter, Taylor Swift',
    badge: 'CHILL FLOW',
    bg: 'linear-gradient(135deg, #5b21b6, #8b5cf6)',
    accent: '#a78bfa',
    shape: 'circle',
    query: 'Billie Eilish Sabrina Carpenter Taylor Swift hits'
  }
];

export const POPULAR_ALBUMS = [
  {
    id: 'album-starboy',
    title: 'Starboy',
    artist: 'The Weeknd',
    year: '2016',
    tracksCount: 18,
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80',
    query: 'Starboy The Weeknd album',
    featuredTrackId: '34Na4j8AVgA'
  },
  {
    id: 'album-harrys-house',
    title: "Harry's House",
    artist: 'Harry Styles',
    year: '2022',
    tracksCount: 13,
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    query: "Harry's House Harry Styles album",
    featuredTrackId: 'H5v3kku4y6Q'
  },
  {
    id: 'album-brahmastra',
    title: 'Brahmāstra',
    artist: 'Pritam, Arijit Singh',
    year: '2022',
    tracksCount: 10,
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    query: 'Brahmastra songs album Pritam',
    featuredTrackId: 'BddP6PYo2gs'
  },
  {
    id: 'album-goat',
    title: 'G.O.A.T.',
    artist: 'Diljit Dosanjh',
    year: '2020',
    tracksCount: 16,
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    query: 'Diljit Dosanjh GOAT album songs',
    featuredTrackId: 'cl0a3i2wFcc'
  },
  {
    id: 'album-hit-me-hard',
    title: 'HIT ME HARD AND SOFT',
    artist: 'Billie Eilish',
    year: '2024',
    tracksCount: 10,
    cover: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=400&q=80',
    query: 'Billie Eilish Hit Me Hard and Soft album',
    featuredTrackId: 'V9PVRfjEBTI'
  }
];

export const TOP_ARTISTS = [
  {
    id: 'arijit',
    name: 'Arijit Singh',
    role: 'Playback Singer · India',
    listeners: '42.8M monthly listeners',
    bio: 'Renowned Indian playback singer and music composer, known for emotive vocals in Bollywood classics and contemporary anthems.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80',
    query: 'Arijit Singh greatest hits songs'
  },
  {
    id: 'theweeknd',
    name: 'The Weeknd',
    role: 'Pop / R&B Icon · Canada',
    listeners: '108.5M monthly listeners',
    bio: 'Abel Tesfaye, known professionally as The Weeknd, is a Canadian singer-songwriter known for sonic innovation and chart-topping hits.',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80',
    query: 'The Weeknd top hits music'
  },
  {
    id: 'taylor',
    name: 'Taylor Swift',
    role: 'Singer-Songwriter · USA',
    listeners: '99.2M monthly listeners',
    bio: 'Grammy record-holder and global icon recognized for narrative songwriting across country, pop, and indie genres.',
    image: 'https://images.unsplash.com/photo-1520523839898-507121657f33?auto=format&fit=crop&w=300&q=80',
    query: 'Taylor Swift best songs hits'
  },
  {
    id: 'diljit',
    name: 'Diljit Dosanjh',
    role: 'Punjabi Superstar · India',
    listeners: '21.4M monthly listeners',
    bio: 'Groundbreaking Punjabi musician and actor whose hits have propelled modern Punjabi music onto the world stage and festivals.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    query: 'Diljit Dosanjh songs hits'
  },
  {
    id: 'coldplay',
    name: 'Coldplay',
    role: 'Alternative Rock Band · UK',
    listeners: '86.1M monthly listeners',
    bio: 'British rock band formed in London in 1997, celebrated for stadium anthems, melodic piano hooks, and atmospheric ballads.',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=300&q=80',
    query: 'Coldplay top songs'
  },
  {
    id: 'dualipa',
    name: 'Dua Lipa',
    role: 'Dance-Pop Sensation · UK',
    listeners: '72.3M monthly listeners',
    bio: 'English and Albanian singer noted for signature mezzo-soprano vocal range and disco-inspired pop productions.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
    query: 'Dua Lipa greatest hits'
  },
  {
    id: 'edsheeran',
    name: 'Ed Sheeran',
    role: 'Pop Acoustic Maestro · UK',
    listeners: '75.4M monthly listeners',
    bio: 'English singer-songwriter with over 150 million records sold worldwide, master of loop pedals and acoustic melodies.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    query: 'Ed Sheeran top songs'
  },
  {
    id: 'billie',
    name: 'Billie Eilish',
    role: 'Alt-Pop Innovator · USA',
    listeners: '84.9M monthly listeners',
    bio: 'Academy and Grammy Award-winning artist celebrated for intimate whisper-vocals and avant-garde pop arrangements.',
    image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=300&q=80',
    query: 'Billie Eilish top songs'
  }
];

export const INITIAL_PLAYLISTS = [
  {
    id: 'playlist-chill-vibe',
    name: 'Late Night Chill',
    description: 'Lo-fi beats, warm acoustic guitars, and peaceful nighttime energy.',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    isCustom: false,
    tracks: [
      { id: 'youtube-jfKfPfyJRdk', videoId: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio', artist: 'Lofi Girl', cover: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg', duration: '3:45', durationSec: 225 },
      { id: 'youtube-1G4isv_Fylg', videoId: '1G4isv_Fylg', title: 'Paradise (Official Video)', artist: 'Coldplay', cover: 'https://i.ytimg.com/vi/1G4isv_Fylg/hqdefault.jpg', duration: '4:21', durationSec: 261 },
      { id: 'youtube-UDVtMYqUAyw', videoId: 'UDVtMYqUAyw', title: 'Interstellar Main Theme - Piano', artist: 'Patrik Pietschmann', cover: 'https://i.ytimg.com/vi/UDVtMYqUAyw/hqdefault.jpg', duration: '4:50', durationSec: 290 }
    ]
  },
  {
    id: 'playlist-workout-pump',
    name: 'Workout High-Energy',
    description: 'High BPM, bass drops, and unstoppable adrenaline hits.',
    cover: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80',
    isCustom: false,
    tracks: [
      { id: 'youtube-7wtfhZwyrcc', videoId: '7wtfhZwyrcc', title: 'Believer (Official Music Video)', artist: 'Imagine Dragons', cover: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg', duration: '3:24', durationSec: 204 },
      { id: 'youtube-_1xXYeNrW9k', videoId: '_1xXYeNrW9k', title: 'Till I Collapse', artist: 'Eminem', cover: 'https://i.ytimg.com/vi/_1xXYeNrW9k/hqdefault.jpg', duration: '4:57', durationSec: 297 },
      { id: 'youtube-2zNSgSzhBf8', videoId: '2zNSgSzhBf8', title: "Can't Hold Us", artist: 'Macklemore & Ryan Lewis', cover: 'https://i.ytimg.com/vi/2zNSgSzhBf8/hqdefault.jpg', duration: '4:18', durationSec: 258 }
    ]
  },
  {
    id: 'playlist-bollywood-magic',
    name: 'Bollywood Love Stories',
    description: 'Heart-touching Hindi romantic melodies from the best composers.',
    cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80',
    isCustom: false,
    tracks: [
      { id: 'youtube-BddP6PYo2gs', videoId: 'BddP6PYo2gs', title: 'Kesariya - Brahmāstra', artist: 'Arijit Singh, Pritam', cover: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg', duration: '4:28', durationSec: 268 },
      { id: 'youtube-IJq0yyWug1k', videoId: 'IJq0yyWug1k', title: 'Tum Hi Ho - Aashiqui 2', artist: 'Arijit Singh', cover: 'https://i.ytimg.com/vi/IJq0yyWug1k/hqdefault.jpg', duration: '4:22', durationSec: 262 },
      { id: 'youtube-VAdGW7QDJUI', title: 'Chaleya - Jawan', videoId: 'VAdGW7QDJUI', artist: 'Arijit Singh, Shilpa Rao', cover: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg', duration: '3:20', durationSec: 200 }
    ]
  }
];

export const EMPTY_TRACK = {
  id: 'empty-track',
  title: 'Choose a song to begin',
  artist: 'Search for a song, artist, or genre',
  cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80',
  duration: '0:00',
  durationSec: 0
};
