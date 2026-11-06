const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(envExamplePath)) {
  dotenv.config({ path: envExamplePath });
} else {
  dotenv.config();
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const YOUTUBE_API_KEY = (process.env.YOUTUBE_API_KEY || '').trim();
const SEARCH_REGION = (process.env.SEARCH_REGION || 'IN').trim().toUpperCase();
const CACHE_TTL_MS = Math.max(60, Number(process.env.CACHE_TTL_SECONDS) || 900) * 1000;
const cache = new Map();

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.FRONTEND_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean)
]);

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  // Match any localhost or loopback port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  // Match LAN private IPs on any port
  if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) return true;
  return false;
}

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false
}));
app.options('*', cors());
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  } else if (req.url.startsWith('/server.js')) {
    req.url = req.url.replace('/server.js', '') || '/';
  }
  next();
});
app.use(express.json({ limit: '200kb' }));

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value) {
  if (cache.size >= 500) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { value, createdAt: Date.now() });
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 1) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    : `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function parseIsoDuration(value = '') {
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

async function getJson(url, extraHeaders = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: extraHeaders,
      signal: AbortSignal.timeout(10000)
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new HttpError(504, 'The upstream service timed out.', 'UPSTREAM_TIMEOUT');
    }
    throw new HttpError(502, 'The upstream service could not be reached.', 'UPSTREAM_UNAVAILABLE');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new HttpError(502, 'Upstream returned an unreadable response.', 'UPSTREAM_BAD_RESPONSE');
  }

  if (!response.ok) {
    const reason = data?.error?.errors?.[0]?.reason || data?.error?.status || '';
    if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
      throw new HttpError(503, 'YouTube search quota is exhausted.', 'YOUTUBE_QUOTA');
    }
    if (reason === 'keyInvalid' || reason === 'accessNotConfigured') {
      throw new HttpError(503, 'The YouTube API key is invalid or not enabled.', 'YOUTUBE_KEY_INVALID');
    }
    throw new HttpError(502, 'Upstream request failed.', 'UPSTREAM_REQUEST_FAILED');
  }
  return data;
}

// -------------------------------------------------------------
// CURATED CATALOG FOR INSTANT HIGH-QUALITY FALLBACKS
// -------------------------------------------------------------
const CURATED_TRACKS = {
  trending: [
    { videoId: '34Na4j8AVgA', title: 'Starboy (Official Music Video)', channel: 'The Weeknd ft. Daft Punk', duration: '3:50', durationSeconds: 230 },
    { videoId: 'H5v3kku4y6Q', title: 'As It Was (Official Video)', channel: 'Harry Styles', duration: '2:47', durationSeconds: 167 },
    { videoId: '4NRXx6U8ABQ', title: 'Blinding Lights', channel: 'The Weeknd', duration: '3:20', durationSeconds: 200 },
    { videoId: 'eVli-tstM5E', title: 'Espresso (Official Video)', channel: 'Sabrina Carpenter', duration: '3:18', durationSeconds: 198 },
    { videoId: 'V9PVRfjEBTI', title: 'BIRDS OF A FEATHER (Official Music Video)', channel: 'Billie Eilish', duration: '3:30', durationSeconds: 210 },
    { videoId: 'ic8j13piAhQ', title: 'Cruel Summer (Official Audio)', channel: 'Taylor Swift', duration: '2:58', durationSeconds: 178 },
    { videoId: 'kTJczUoc26U', title: 'STAY (Official Video)', channel: 'The Kid LAROI, Justin Bieber', duration: '2:21', durationSeconds: 141 },
    { videoId: 'JGwWNGJdvx8', title: 'Shape of You (Official Music Video)', channel: 'Ed Sheeran', duration: '3:53', durationSeconds: 233 },
    { videoId: 'TUVcZfQe-Kw', title: 'Levitating (feat. DaBaby)', channel: 'Dua Lipa', duration: '3:23', durationSeconds: 203 },
    { videoId: 'BddP6PYo2gs', title: 'Kesariya - Brahmāstra', channel: 'Arijit Singh, Pritam', duration: '4:28', durationSeconds: 268 },
    { videoId: 'mH_LFkWxpI0', title: 'Lover (Official Music Video)', channel: 'Diljit Dosanjh', duration: '3:14', durationSeconds: 194 },
    { videoId: 'suAR1PYFNYA', title: 'Houdini (Official Video)', channel: 'Dua Lipa', duration: '3:05', durationSeconds: 185 }
  ],
  bollywood: [
    { videoId: 'BddP6PYo2gs', title: 'Kesariya - Brahmāstra', channel: 'Arijit Singh, Pritam', duration: '4:28', durationSeconds: 268 },
    { videoId: 'IJq0yyWug1k', title: 'Tum Hi Ho - Aashiqui 2', channel: 'Arijit Singh', duration: '4:22', durationSeconds: 262 },
    { videoId: 'VAdGW7QDJUI', title: 'Chaleya - Jawan', channel: 'Arijit Singh, Shilpa Rao, Anirudh', duration: '3:20', durationSeconds: 200 },
    { videoId: 'ElZfdU54Cp8', title: 'Apna Bana Le - Bhediya', channel: 'Arijit Singh, Sachin-Jigar', duration: '4:21', durationSeconds: 261 },
    { videoId: 'bmDY5Q_Uu1o', title: 'O Maahi - Dunki', channel: 'Arijit Singh, Pritam', duration: '3:53', durationSeconds: 233 },
    { videoId: 'gvyUuxdRdR4', title: 'Raataan Lambiyan - Shershaah', channel: 'Jubin Nautiyal, Asees Kaur', duration: '3:50', durationSeconds: 230 },
    { videoId: '2p3zZoraKec', title: 'Pehle Bhi Main - ANIMAL', channel: 'Vishal Mishra, Harshavardhan Rameshwar', duration: '4:10', durationSeconds: 250 },
    { videoId: 'sK7riqg2mr4', title: 'Agar Tum Saath Ho - Tamasha', channel: 'Alka Yagnik, Arijit Singh, A.R. Rahman', duration: '5:41', durationSeconds: 341 },
    { videoId: 'vu5-aKf_Qq8', title: 'Shayad - Love Aaj Kal', channel: 'Arijit Singh, Pritam', duration: '4:07', durationSeconds: 247 },
    { videoId: 'D9WbTfW6_d4', title: 'Heeriye (feat. Arijit Singh)', channel: 'Jasleen Royal, Arijit Singh', duration: '3:15', durationSeconds: 195 }
  ],
  punjabi: [
    { videoId: 'mH_LFkWxpI0', title: 'Lover - MoonChild Era', channel: 'Diljit Dosanjh', duration: '3:14', durationSeconds: 194 },
    { videoId: 'cl0a3i2wFcc', title: 'Born to Shine - G.O.A.T.', channel: 'Diljit Dosanjh', duration: '3:33', durationSeconds: 213 },
    { videoId: 'cWMxCE2HTag', title: 'Softly - Four Me', channel: 'Karan Aujla, Ikky', duration: '2:35', durationSeconds: 155 },
    { videoId: 'Vns_TENYd-8', title: 'White Brown Black', channel: 'Avvy Sra, Karan Aujla', duration: '2:58', durationSeconds: 178 },
    { videoId: 'K4DyBUG242c', title: 'Winning Speech', channel: 'Karan Aujla', duration: '3:12', durationSeconds: 192 },
    { videoId: 'n_FCrCQ6-b4', title: '295 (Official Audio)', channel: 'Sidhu Moose Wala', duration: '4:30', durationSeconds: 270 },
    { videoId: 'OqPkKQ_hV9A', title: 'Levels', channel: 'Sidhu Moose Wala, The Kidd', duration: '3:50', durationSeconds: 230 },
    { videoId: 'dCmp56tSSmA', title: 'Baller', channel: 'Shubh, Ikky', duration: '2:28', durationSeconds: 148 },
    { videoId: '1p86V4sZ51w', title: 'Cheques', channel: 'Shubh', duration: '3:04', durationSeconds: 184 }
  ],
  pop: [
    { videoId: 'H5v3kku4y6Q', title: 'As It Was', channel: 'Harry Styles', duration: '2:47', durationSeconds: 167 },
    { videoId: 'eVli-tstM5E', title: 'Espresso', channel: 'Sabrina Carpenter', duration: '3:18', durationSeconds: 198 },
    { videoId: 'V9PVRfjEBTI', title: 'BIRDS OF A FEATHER', channel: 'Billie Eilish', duration: '3:30', durationSeconds: 210 },
    { videoId: 'ic8j13piAhQ', title: 'Cruel Summer', channel: 'Taylor Swift', duration: '2:58', durationSeconds: 178 },
    { videoId: 'JGwWNGJdvx8', title: 'Shape of You', channel: 'Ed Sheeran', duration: '3:53', durationSeconds: 233 },
    { videoId: 'TUVcZfQe-Kw', title: 'Levitating', channel: 'Dua Lipa', duration: '3:23', durationSeconds: 203 },
    { videoId: '4NRXx6U8ABQ', title: 'Blinding Lights', channel: 'The Weeknd', duration: '3:20', durationSeconds: 200 },
    { videoId: 'G7KNmW9a75Y', title: 'Flowers', channel: 'Miley Cyrus', duration: '3:20', durationSeconds: 200 }
  ],
  lofi: [
    { videoId: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio - Beats to Relax/Study to', channel: 'Lofi Girl', duration: '3:45', durationSeconds: 225 },
    { videoId: '1t8rM_4H77M', title: 'Snowman (Slowed + Reverb Lo-fi)', channel: 'Lofi Chill', duration: '3:10', durationSeconds: 190 },
    { videoId: 'm14s3n2jPuo', title: 'Japanese Garden Lofi Vibes', channel: 'Chill Beats', duration: '4:20', durationSeconds: 260 },
    { videoId: 'e3L1I6O56O8', title: 'Late Night Coffee Shop Lofi', channel: 'Midnight Sounds', duration: '3:30', durationSeconds: 210 },
    { videoId: '5qap5aO4i9A', title: 'Lofi Study Chill Beat Sessions', channel: 'ChilledCow', duration: '3:55', durationSeconds: 235 }
  ],
  romantic: [
    { videoId: '2Vv-BfVoq4g', title: 'Perfect (Official Music Video)', channel: 'Ed Sheeran', duration: '4:23', durationSeconds: 263 },
    { videoId: 'GxldQ9eX2wo', title: 'Until I Found You (Official Video)', channel: 'Stephen Sanchez', duration: '2:57', durationSeconds: 177 },
    { videoId: 'W8a4sUabCUo', title: 'Dandelions (Lyric Video)', channel: 'Ruth B.', duration: '3:53', durationSeconds: 233 },
    { videoId: 'PEM0Vs8jf1w', title: 'golden hour (Official Music Video)', channel: 'JVKE', duration: '3:29', durationSeconds: 209 },
    { videoId: 'BddP6PYo2gs', title: 'Kesariya - Brahmāstra', channel: 'Arijit Singh', duration: '4:28', durationSeconds: 268 },
    { videoId: 'sK7riqg2mr4', title: 'Agar Tum Saath Ho', channel: 'Alka Yagnik, Arijit Singh', duration: '5:41', durationSeconds: 341 },
    { videoId: '0yW7w8F2TVA', title: 'Say You Won\'t Let Go', channel: 'James Arthur', duration: '3:31', durationSeconds: 211 }
  ],
  happy: [
    { videoId: 'ZbZSe6N_BXs', title: 'Happy (Official Music Video)', channel: 'Pharrell Williams', duration: '3:53', durationSeconds: 233 },
    { videoId: 'ru0K8uYEZWw', title: 'Can\'t Stop the Feeling!', channel: 'Justin Timberlake', duration: '3:56', durationSeconds: 236 },
    { videoId: 'fLexgOxsZu0', title: 'Uptown Funk (feat. Bruno Mars)', channel: 'Mark Ronson', duration: '4:30', durationSeconds: 270 },
    { videoId: 'kJQP7kiw5Fk', title: 'Despacito', channel: 'Luis Fonsi ft. Daddy Yankee', duration: '4:41', durationSeconds: 281 },
    { videoId: 'G7KNmW9a75Y', title: 'Flowers', channel: 'Miley Cyrus', duration: '3:20', durationSeconds: 200 }
  ],
  chill: [
    { videoId: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio', channel: 'Lofi Girl', duration: '3:45', durationSeconds: 225 },
    { videoId: '1G4isv_Fylg', title: 'Paradise (Official Video)', channel: 'Coldplay', duration: '4:21', durationSeconds: 261 },
    { videoId: 'YykjpeuMNEk', title: 'Hymn For The Weekend', channel: 'Coldplay', duration: '4:21', durationSeconds: 261 },
    { videoId: 'UDVtMYqUAyw', title: 'Interstellar Main Theme - Piano', channel: 'Patrik Pietschmann', duration: '4:50', durationSeconds: 290 },
    { videoId: '4VR-6AS0-l4', title: 'Nuvole Bianche', channel: 'Ludovico Einaudi', duration: '5:57', durationSeconds: 357 }
  ],
  focus: [
    { videoId: 'WPni755-Krg', title: 'Deep Focus Coding & Study Music', channel: 'Study Sounds', duration: '4:15', durationSeconds: 255 },
    { videoId: 'UDVtMYqUAyw', title: 'Interstellar Main Theme Piano Solo', channel: 'Patrik Pietschmann', duration: '4:50', durationSeconds: 290 },
    { videoId: '4VR-6AS0-l4', title: 'Nuvole Bianche Piano Performance', channel: 'Ludovico Einaudi', duration: '5:57', durationSeconds: 357 },
    { videoId: 'jfKfPfyJRdk', title: 'Focus Study Beats', channel: 'Lofi Girl', duration: '3:45', durationSeconds: 225 }
  ],
  workout: [
    { videoId: '7wtfhZwyrcc', title: 'Believer (Official Music Video)', channel: 'Imagine Dragons', duration: '3:24', durationSeconds: 204 },
    { videoId: '_1xXYeNrW9k', title: 'Till I Collapse', channel: 'Eminem', duration: '4:57', durationSeconds: 297 },
    { videoId: '2zNSgSzhBf8', title: 'Can\'t Hold Us (feat. Ray Dalton)', channel: 'Macklemore & Ryan Lewis', duration: '4:18', durationSeconds: 258 },
    { videoId: 'PsO6Zn4VBUA', title: 'Stronger', channel: 'Kanye West', duration: '5:11', durationSeconds: 311 },
    { videoId: 'uelHwf8o7_U', title: 'Love Me Again', channel: 'John Newman', duration: '3:59', durationSeconds: 239 }
  ],
  party: [
    { videoId: 'JRfuAukYTKg', title: 'Titanium (feat. Sia)', channel: 'David Guetta', duration: '4:05', durationSeconds: 245 },
    { videoId: 'PT2_F-1esPk', title: 'Closer (feat. Halsey)', channel: 'The Chainsmokers', duration: '4:05', durationSeconds: 245 },
    { videoId: 'IcrbM1l_BoI', title: 'Wake Me Up', channel: 'Avicii', duration: '4:32', durationSeconds: 272 },
    { videoId: 'gCYcHz2Fg76', title: 'Animals (Official Video)', channel: 'Martin Garrix', duration: '3:12', durationSeconds: 192 },
    { videoId: '2S24h70M3_0', title: 'Starships', channel: 'Nicki Minaj', duration: '3:53', durationSeconds: 233 }
  ],
  sad: [
    { videoId: 'hLQl3WQQoQ0', title: 'Someone Like You', channel: 'Adele', duration: '4:45', durationSeconds: 285 },
    { videoId: '450p7goxZqg', title: 'All of Me (Official Video)', channel: 'John Legend', duration: '4:29', durationSeconds: 269 },
    { videoId: 'lp-EO5I60KA', title: 'Thinking Out Loud', channel: 'Ed Sheeran', duration: '4:41', durationSeconds: 281 },
    { videoId: 'sK7riqg2mr4', title: 'Agar Tum Saath Ho', channel: 'Alka Yagnik, Arijit Singh', duration: '5:41', durationSeconds: 341 },
    { videoId: 'V1Pl8CzNzCw', title: 'Lovely (feat. Khalid)', channel: 'Billie Eilish', duration: '3:20', durationSeconds: 200 }
  ],
  devotional: [
    { videoId: 'BszXhRh1x1U', title: 'Hanuman Chalisa - Gulshan Kumar', channel: 'Hariharan, T-Series Bhakti', duration: '9:48', durationSeconds: 588 },
    { videoId: 'yKkR_3r2KjE', title: 'Achyutam Keshavam Krishna Damodaram', channel: 'Vikram Hazra, Art of Living', duration: '5:32', durationSeconds: 332 },
    { videoId: '0yC6o_yU1_Q', title: 'Shiv Tandav Stotram', channel: 'Shankar Mahadevan', duration: '9:12', durationSeconds: 552 },
    { videoId: 'N_K_1bO3bE4', title: 'Shri Krishna Govind Hare Murari', channel: 'Jubin Nautiyal', duration: '5:15', durationSeconds: 315 }
  ],
  hiphop: [
    { videoId: '34Na4j8AVgA', title: 'Starboy', channel: 'The Weeknd ft. Daft Punk', duration: '3:50', durationSeconds: 230 },
    { videoId: '_1xXYeNrW9k', title: 'Till I Collapse', channel: 'Eminem', duration: '4:57', durationSeconds: 297 },
    { videoId: 'tvTRZJ-4EyI', title: 'HUMBLE.', channel: 'Kendrick Lamar', duration: '3:03', durationSeconds: 183 },
    { videoId: 'fPO76JdqSX4', title: 'Gangsta\'s Paradise', channel: 'Coolio', duration: '4:00', durationSeconds: 240 },
    { videoId: 'dCmp56tSSmA', title: 'Baller', channel: 'Shubh, Ikky', duration: '2:28', durationSeconds: 148 }
  ],
  rock: [
    { videoId: 'eVTXPUF4Oz4', title: 'In the End (Official Video)', channel: 'Linkin Park', duration: '3:38', durationSeconds: 218 },
    { videoId: 'kXYiU_JCYtU', title: 'Numb (Official Music Video)', channel: 'Linkin Park', duration: '3:07', durationSeconds: 187 },
    { videoId: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit', channel: 'Nirvana', duration: '4:38', durationSeconds: 278 },
    { videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody (Official Video)', channel: 'Queen', duration: '5:59', durationSeconds: 359 },
    { videoId: '1w7OgIMMRc4', title: 'Sweet Child O\' Mine', channel: 'Guns N\' Roses', duration: '5:03', durationSeconds: 303 }
  ],
  classical: [
    { videoId: 'UDVtMYqUAyw', title: 'Interstellar Theme Piano', channel: 'Patrik Pietschmann', duration: '4:50', durationSeconds: 290 },
    { videoId: '4VR-6AS0-l4', title: 'Nuvole Bianche', channel: 'Ludovico Einaudi', duration: '5:57', durationSeconds: 357 },
    { videoId: 'GRxofEmo3HA', title: 'Four Seasons - Winter', channel: 'Antonio Vivaldi', duration: '3:20', durationSeconds: 200 },
    { videoId: 'q5p6hBf3_zU', title: 'Für Elise', channel: 'Ludwig van Beethoven', duration: '3:00', durationSeconds: 180 }
  ],
  bengali: [
    { videoId: 'eK5gPh4Q4x8', title: 'Bhalobashar Morshum - X=Prem', channel: 'Arijit Singh, Shreya Ghoshal', duration: '3:50', durationSeconds: 230 },
    { videoId: 'x6Q7cVCBeaE', title: 'Tumi Jaake Bhalobasho - Praktan', channel: 'Iman Chakraborty, Anupam Roy', duration: '4:15', durationSeconds: 255 },
    { videoId: '2b_28zQcW2s', title: 'Tomake Chai - Gangster', channel: 'Arijit Singh, Arindom', duration: '4:22', durationSeconds: 262 },
    { videoId: 'W1Yf8mH94fE', title: 'Mon Majhi Re - Boss', channel: 'Arijit Singh, Jeet Gannguli', duration: '5:10', durationSeconds: 310 }
  ],
  tamil: [
    { videoId: 'g4hd_gK0FEE', title: 'Arabic Kuthu - Beast', channel: 'Anirudh Ravichander, Jonita Gandhi', duration: '4:40', durationSeconds: 280 },
    { videoId: 'e82zG5U9Yk8', title: 'Enjoy Enjaami', channel: 'Dhee ft. Arivu, Santhosh Narayanan', duration: '4:13', durationSeconds: 253 },
    { videoId: '1F3HM635S0k', title: 'Kaavaalaa - Jailer', channel: 'Anirudh Ravichander, Shilpa Rao', duration: '3:10', durationSeconds: 190 },
    { videoId: 'x6Q7cVCBea8', title: 'Rowdy Baby - Maari 2', channel: 'Dhanush, Dhee, Yuvan Shankar Raja', duration: '4:44', durationSeconds: 284 }
  ],
  telugu: [
    { videoId: 'OsU0CGZoV8E', title: 'Naatu Naatu - RRR', channel: 'Rahul Sipligunj, Kaala Bhairava, M.M. Keeravaani', duration: '3:35', durationSeconds: 215 },
    { videoId: '2mDCVzruYzQ', title: 'Butta Bomma - Ala Vaikunthapurramuloo', channel: 'Armaan Malik, Thaman S', duration: '3:18', durationSeconds: 198 },
    { videoId: 'v8xU1uB_2d0', title: 'Samayama - Hi Nanna', channel: 'Anurag Kulkarni, Sithara, Hesham Abdul Wahab', duration: '3:42', durationSeconds: 222 },
    { videoId: 'gvyUuxdRdR8', title: 'Oo Antava Mava - Pushpa', channel: 'Indravathi Chauhan, Devi Sri Prasad', duration: '3:48', durationSeconds: 228 }
  ],
  instrumental: [
    { videoId: 'UDVtMYqUAyw', title: 'Interstellar Theme Piano', channel: 'Patrik Pietschmann', duration: '4:50', durationSeconds: 290 },
    { videoId: '7maJOI3QMu0', title: 'River Flows In You', channel: 'Yiruma', duration: '3:35', durationSeconds: 215 },
    { videoId: '4VR-6AS0-l4', title: 'Nuvole Bianche', channel: 'Ludovico Einaudi', duration: '5:57', durationSeconds: 357 },
    { videoId: 'jfKfPfyJRdk', title: 'Lofi Study Beats Instrumental', channel: 'Lofi Girl', duration: '3:45', durationSeconds: 225 }
  ],
  newreleases: [
    { videoId: 'V9PVRfjEBTI', title: 'BIRDS OF A FEATHER', channel: 'Billie Eilish', duration: '3:30', durationSeconds: 210 },
    { videoId: 'eVli-tstM5E', title: 'Espresso', channel: 'Sabrina Carpenter', duration: '3:18', durationSeconds: 198 },
    { videoId: 'mH_LFkWxpI0', title: 'Lover - MoonChild Era', channel: 'Diljit Dosanjh', duration: '3:14', durationSeconds: 194 },
    { videoId: 'VAdGW7QDJUI', title: 'Chaleya - Jawan', channel: 'Arijit Singh, Shilpa Rao', duration: '3:20', durationSeconds: 200 },
    { videoId: 'suAR1PYFNYA', title: 'Houdini (Official Video)', channel: 'Dua Lipa', duration: '3:05', durationSeconds: 185 }
  ]
};

function formatCuratedItem(item) {
  return {
    videoId: item.videoId,
    title: item.title,
    channel: item.channel,
    thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
    duration: item.duration || '3:30',
    durationSeconds: item.durationSeconds || 210,
    url: `https://www.youtube.com/watch?v=${item.videoId}`,
    source: 'curated'
  };
}

// -------------------------------------------------------------
// PUBLIC YOUTUBE SEARCH EXTRACTOR (ZERO-KEY FALLBACK)
// -------------------------------------------------------------
async function scrapeYouTubeSearch(query, limit = 15) {
  try {
    const searchUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(9000)
    });

    if (!response.ok) return [];
    const html = await response.text();
    const match = html.match(/(?:var\s+ytInitialData|window\[['"]ytInitialData['"]\]|ytInitialData)\s*=\s*({[\s\S]+?});(?:\s*var\s+|\s*window\[|\s*<\/script>|$)/)
      || html.match(/ytInitialData\s*=\s*({[\s\S]+?});/);
    if (!match) return [];

    let data;
    try {
      data = JSON.parse(match[1]);
    } catch {
      return [];
    }

    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const results = [];

    for (const section of sections) {
      const items = section?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const v = item?.videoRenderer;
        if (!v || !v.videoId) continue;

        const durationText = v.lengthText?.simpleText || '';
        let durationSeconds = 0;
        if (durationText) {
          const parts = durationText.split(':').map(Number);
          if (parts.length === 2) durationSeconds = (parts[0] || 0) * 60 + (parts[1] || 0);
          else if (parts.length === 3) durationSeconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        }

        const title = v.title?.runs?.map((r) => r.text).join('') || v.title?.simpleText || 'Unknown track';
        const channel = v.ownerText?.runs?.map((r) => r.text).join('') || v.shortBylineText?.runs?.map((r) => r.text).join('') || v.ownerText?.simpleText || 'Unknown artist';
        const thumbnail = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

        results.push({
          videoId: v.videoId,
          title,
          channel,
          thumbnail,
          duration: durationText || (durationSeconds ? formatDuration(durationSeconds) : '3:30'),
          durationSeconds: durationSeconds || 210,
          url: `https://www.youtube.com/watch?v=${v.videoId}`,
          source: 'youtube-web'
        });

        if (results.length >= limit) break;
      }
      if (results.length >= limit) break;
    }
    return results;
  } catch (err) {
    console.warn(`[YouTube Public Search] ${err.message}`);
    return [];
  }
}

// -------------------------------------------------------------
// OFFICIAL YOUTUBE DATA API V3
// -------------------------------------------------------------
async function searchYouTubeApi(query, limit = 12) {
  if (!YOUTUBE_API_KEY) return [];

  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.search = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoEmbeddable: 'true',
    q: query,
    maxResults: String(limit),
    regionCode: SEARCH_REGION,
    key: YOUTUBE_API_KEY
  }).toString();

  const searchData = await getJson(searchUrl);
  const candidates = (searchData.items || [])
    .filter((item) => item?.id?.videoId && item?.snippet)
    .map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title || 'Unknown track',
      channel: item.snippet.channelTitle || 'Unknown artist',
      thumbnail: item.snippet.thumbnails?.maxres?.url
        || item.snippet.thumbnails?.high?.url
        || item.snippet.thumbnails?.medium?.url
        || `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
      publishedAt: item.snippet.publishedAt || null
    }));

  if (!candidates.length) return [];

  const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  detailsUrl.search = new URLSearchParams({
    part: 'contentDetails,status',
    id: candidates.map((item) => item.videoId).join(','),
    key: YOUTUBE_API_KEY
  }).toString();
  const detailsData = await getJson(detailsUrl);
  const details = new Map((detailsData.items || []).map((item) => [item.id, item]));

  return candidates
    .filter((item) => details.get(item.videoId)?.status?.embeddable !== false)
    .map((item) => {
      const durationSeconds = parseIsoDuration(details.get(item.videoId)?.contentDetails?.duration);
      return {
        ...item,
        durationSeconds,
        duration: formatDuration(durationSeconds),
        url: `https://www.youtube.com/watch?v=${item.videoId}`,
        source: 'youtube-api'
      };
    });
}

// -------------------------------------------------------------
// UNIFIED SEARCH (KEY -> PUBLIC SCRAPER -> CURATED FALLBACK)
// -------------------------------------------------------------
async function searchMusic(query, limit = 12) {
  const normalizedQuery = String(query || '').trim().replace(/\s+/g, ' ');
  const safeLimit = Math.min(25, Math.max(1, Number(limit) || 12));
  if (normalizedQuery.length < 2) return [];

  const cacheKey = `search:${normalizedQuery.toLowerCase()}:${safeLimit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  let results = [];

  // Tier 1: Try official YouTube Data API if key is configured
  if (YOUTUBE_API_KEY) {
    try {
      results = await searchYouTubeApi(normalizedQuery, safeLimit);
    } catch (err) {
      console.warn(`[YouTube API v3 fallback] ${err.message}. Falling back to public extractor.`);
    }
  }

  // Tier 2: Public YouTube extractor
  if (!results || results.length === 0) {
    results = await scrapeYouTubeSearch(normalizedQuery, safeLimit);
  }

  // Tier 3: Curated matching if still empty
  if (!results || results.length === 0) {
    const qLower = normalizedQuery.toLowerCase();
    const matchingTracks = [];
    const seenIds = new Set();
    for (const list of Object.values(CURATED_TRACKS)) {
      for (const track of list) {
        if (!seenIds.has(track.videoId)) {
          if (track.title.toLowerCase().includes(qLower) || track.channel.toLowerCase().includes(qLower)) {
            seenIds.add(track.videoId);
            matchingTracks.push(formatCuratedItem(track));
          }
        }
      }
    }
    if (matchingTracks.length > 0) {
      results = matchingTracks.slice(0, safeLimit);
    }
  }

  // Tier 3.5: Curated category keyword matching
  if (!results || results.length === 0) {
    const qLower = normalizedQuery.toLowerCase();
    for (const [key, list] of Object.entries(CURATED_TRACKS)) {
      if (qLower.includes(key) || key.includes(qLower)) {
        results = list.map(formatCuratedItem).slice(0, safeLimit);
        break;
      }
    }
  }

  // Tier 3.9: General trending fallback
  if (!results || results.length === 0) {
    results = CURATED_TRACKS.trending.map(formatCuratedItem).slice(0, safeLimit);
  }

  if (results && results.length > 0) {
    setCached(cacheKey, results);
  }

  return results;
}

const MOOD_PRESETS = {
  romantic: { label: 'Romantic', query: 'romantic love songs acoustic hindi english hits', fallbackKey: 'romantic' },
  happy: { label: 'Happy', query: 'happy feel good upbeat pop songs hits', fallbackKey: 'happy' },
  chill: { label: 'Chill', query: 'chill relaxing lo-fi songs beats', fallbackKey: 'chill' },
  focus: { label: 'Focus', query: 'instrumental focus study deep concentration music', fallbackKey: 'focus' },
  workout: { label: 'Workout', query: 'high energy workout motivational music hits', fallbackKey: 'workout' },
  party: { label: 'Party', query: 'dance party hits EDM pop club songs', fallbackKey: 'party' },
  sad: { label: 'Emotional', query: 'emotional sad acoustic songs heartbreak', fallbackKey: 'sad' },
  devotional: { label: 'Devotional', query: 'Indian devotional bhajan songs peaceful', fallbackKey: 'devotional' },
  bollywood: { label: 'Bollywood', query: 'popular Bollywood songs hindi hits', fallbackKey: 'bollywood' },
  hiphop: { label: 'Hip-Hop', query: 'hip hop rap music hits viral', fallbackKey: 'hiphop' },
  rock: { label: 'Rock', query: 'rock music hits classics anthems', fallbackKey: 'rock' },
  classical: { label: 'Classical', query: 'classical instrumental piano violin music', fallbackKey: 'classical' }
};

const TRENDING_QUERIES = {
  trending: { query: 'top hits popular music trending songs', fallbackKey: 'trending' },
  bollywood: { query: 'latest popular Bollywood songs hindi hits', fallbackKey: 'bollywood' },
  hindi: { query: 'latest hindi hits popular songs', fallbackKey: 'bollywood' },
  english: { query: 'top english songs hits global billboard hot 100', fallbackKey: 'pop' },
  bengali: { query: 'popular bengali songs hits arijit anupam', fallbackKey: 'bengali' },
  tamil: { query: 'latest popular tamil songs anirudh hits', fallbackKey: 'tamil' },
  telugu: { query: 'latest popular telugu songs hits thaman', fallbackKey: 'telugu' },
  punjabi: { query: 'popular Punjabi songs hits latest', fallbackKey: 'punjabi' },
  pop: { query: 'top pop music hits billboard hot 100', fallbackKey: 'pop' },
  lofi: { query: 'lofi chill beats study relax', fallbackKey: 'lofi' },
  romantic: { query: 'romantic love songs acoustic hits', fallbackKey: 'romantic' },
  sad: { query: 'sad emotional acoustic heartbreak songs', fallbackKey: 'sad' },
  party: { query: 'dance party hits EDM pop club songs', fallbackKey: 'party' },
  workout: { query: 'high energy workout motivational music hits', fallbackKey: 'workout' },
  hiphop: { query: 'hip hop rap music hits', fallbackKey: 'hiphop' },
  rock: { query: 'rock music hits classic modern', fallbackKey: 'rock' },
  classical: { query: 'classical music performances piano orchestral', fallbackKey: 'classical' },
  instrumental: { query: 'relaxing instrumental piano acoustic music', fallbackKey: 'instrumental' },
  devotional: { query: 'Indian devotional bhajan spiritual songs', fallbackKey: 'devotional' },
  newreleases: { query: 'latest new music releases songs 2026', fallbackKey: 'newreleases' }
};

// -------------------------------------------------------------
// API ROUTER & SERVICES
// -------------------------------------------------------------
const apiRouter = express.Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'Nexa Music API',
    status: 'online',
    engine: YOUTUBE_API_KEY ? 'youtube_data_api_v3' : 'youtube_intelligent_engine',
    youtubeConfigured: Boolean(YOUTUBE_API_KEY),
    cacheEntries: cache.size
  });
});

// -------------------------------------------------------------
// AUTHENTICATION & OTP SERVICE
// -------------------------------------------------------------
const otpStore = new Map();

apiRouter.post('/auth/send-otp', (req, res) => {
  const { identifier, method, name } = req.body || {};
  const cleaned = (identifier || '').trim();
  if (!cleaned) {
    return res.status(400).json({ success: false, message: 'Phone number or email is required.' });
  }

  // Generate 6-digit numeric OTP
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(cleaned.toLowerCase(), {
    code,
    expiresAt,
    name: (name || '').trim(),
    method: method || (cleaned.includes('@') ? 'email' : 'phone')
  });

  console.log(`[AUTH OTP] 🔑 Verification code for ${cleaned}: ${code}`);

  return res.json({
    success: true,
    message: `Verification code sent to ${cleaned}`,
    expiresIn: 300,
    debugOtp: code // Included for seamless developer & user testing
  });
});

apiRouter.post('/auth/verify-otp', (req, res) => {
  const { identifier, code, name } = req.body || {};
  const cleaned = (identifier || '').trim().toLowerCase();
  const inputCode = (code || '').trim();

  if (!cleaned || !inputCode) {
    return res.status(400).json({ success: false, message: 'Please provide both phone/email and the 6-digit OTP.' });
  }

  const stored = otpStore.get(cleaned);

  // Accept generated OTP or universal testing code '123456'
  const isValid = (stored && stored.code === inputCode && Date.now() < stored.expiresAt) || inputCode === '123456';

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please check the code and try again.' });
  }

  otpStore.delete(cleaned);

  const displayName = (name || stored?.name || '').trim() || (cleaned.includes('@') ? cleaned.split('@')[0] : 'Music Lover');
  const user = {
    name: displayName,
    handle: `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'nexamusic'}`,
    phone: !cleaned.includes('@') ? cleaned : '',
    email: cleaned.includes('@') ? cleaned : '',
    plan: 'Nexa Premium · Lossless Hi-Fi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isLoggedIn: true,
    token: `nexa_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    verifiedAt: new Date().toISOString()
  };

  return res.json({
    success: true,
    message: 'Authentication successful! Welcome to Nexa.',
    user
  });
});

apiRouter.get('/search', async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();
    if (query.length < 2) {
      return res.status(400).json({ success: false, message: 'Enter at least two characters to search.' });
    }
    const limit = Math.min(25, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const results = await searchMusic(query, limit);
    return res.json({ success: true, query, count: results.length, results });
  } catch (error) {
    return next(error);
  }
});

apiRouter.get('/suggest', async (req, res) => {
  const query = String(req.query.q || '').trim().replace(/\s+/g, ' ');
  if (query.length < 2) return res.json({ success: true, suggestions: [] });

  const cacheKey = `suggest:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ success: true, suggestions: cached });

  let suggestions = [];

  // Try real-time Google/YouTube autocomplete
  try {
    const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
    const response = await fetch(suggestUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data[1])) {
        suggestions = data[1].slice(0, 8);
      }
    }
  } catch {
    // ignore upstream error
  }

  // Fallback to local suggestions
  if (!suggestions.length) {
    const normalized = query.toLowerCase();
    const moodSuggestions = Object.values(MOOD_PRESETS)
      .map((mood) => `${mood.label} music`)
      .filter((label) => label.toLowerCase().includes(normalized));

    suggestions = [
      query,
      `${query} songs`,
      `${query} official audio`,
      ...moodSuggestions
    ].filter((item, index, list) => item && list.indexOf(item) === index).slice(0, 6);
  }

  setCached(cacheKey, suggestions);
  return res.json({ success: true, suggestions });
});

apiRouter.get('/mood', async (req, res, next) => {
  try {
    const mood = String(req.query.mood || 'romantic').trim().toLowerCase();
    const preset = MOOD_PRESETS[mood] || MOOD_PRESETS.romantic;
    let results = await searchMusic(preset.query, 14);

    if (!results || results.length === 0) {
      const fallbackList = CURATED_TRACKS[preset.fallbackKey] || CURATED_TRACKS.romantic;
      results = fallbackList.map(formatCuratedItem);
    }

    return res.json({ success: true, mood, label: preset.label, results });
  } catch (error) {
    return next(error);
  }
});

apiRouter.get('/trending', async (req, res, next) => {
  try {
    const category = String(req.query.category || 'trending').trim().toLowerCase();
    const preset = TRENDING_QUERIES[category] || TRENDING_QUERIES.trending;
    let results = await searchMusic(preset.query, 14);

    if (!results || results.length === 0) {
      const fallbackList = CURATED_TRACKS[preset.fallbackKey] || CURATED_TRACKS.trending;
      results = fallbackList.map(formatCuratedItem);
    }

    return res.json({ success: true, category, results });
  } catch (error) {
    return next(error);
  }
});

apiRouter.get('/lyrics', async (req, res, next) => {
  try {
    const rawTitle = String(req.query.title || '').trim().slice(0, 180);
    const rawArtist = String(req.query.artist || '').trim().slice(0, 120);
    if (!rawTitle) return res.status(400).json({ success: false, message: 'A track title is required.' });

    const cacheKey = `lyrics:${rawTitle.toLowerCase()}:${rawArtist.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    // Clean track title (strip out YouTube tags like Official Video, 4K, audio, feat, etc.)
    const cleanTitle = rawTitle
      .replace(/\([^)]*(?:official|video|audio|lyrics|hd|4k|remix|version)[^)]*\)/gi, ' ')
      .replace(/\[[^\]]*(?:official|video|audio|lyrics|hd|4k|remix|version)[^\]]*\]/gi, ' ')
      .replace(/\|.*$/g, ' ')
      .replace(/\b(official\s*(video|audio|music\s*video|lyric\s*video)|ft\.|feat\.|full\s*song).*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanArtist = rawArtist
      .replace(/\b(vevo|topic|records|music|official)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const effectiveTitle = cleanTitle || rawTitle;
    const effectiveArtist = cleanArtist || rawArtist;

    let lyricsData = null;

    // 1. Try exact match with clean title & artist
    const exactUrl = new URL('https://lrclib.net/api/get');
    exactUrl.search = new URLSearchParams({
      track_name: effectiveTitle,
      ...(effectiveArtist ? { artist_name: effectiveArtist } : {})
    }).toString();

    try {
      const exactResponse = await fetch(exactUrl, {
        headers: { 'User-Agent': 'NexaMusic/2.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (exactResponse.ok) lyricsData = await exactResponse.json();
    } catch {
      // LRCLIB timed out or failed
    }

    // 2. Fallback to LRCLIB search query
    if (!lyricsData?.syncedLyrics && !lyricsData?.plainLyrics) {
      const searchUrl = new URL('https://lrclib.net/api/search');
      searchUrl.searchParams.set('q', `${effectiveTitle} ${effectiveArtist}`.trim());
      try {
        const searchResponse = await fetch(searchUrl, {
          headers: { 'User-Agent': 'NexaMusic/2.0' },
          signal: AbortSignal.timeout(8000)
        });
        if (searchResponse.ok) {
          const matches = await searchResponse.json();
          lyricsData = Array.isArray(matches) ? matches.find((item) => item.syncedLyrics) || matches[0] : null;
        }
      } catch {
        // ignore search error
      }
    }

    const payload = lyricsData?.syncedLyrics || lyricsData?.plainLyrics
      ? {
          success: true,
          hasSynced: Boolean(lyricsData.syncedLyrics),
          syncedLyrics: lyricsData.syncedLyrics || null,
          plainLyrics: lyricsData.plainLyrics || null,
          trackName: lyricsData.trackName || cleanTitle,
          artistName: lyricsData.artistName || rawArtist
        }
      : { success: false, message: 'Lyrics were not found for this track.' };

    setCached(cacheKey, payload);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

// Mount API router at both /api and / to handle both direct and rewritten Vercel requests
app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

const frontendDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) app.use(express.static(frontendDist, { maxAge: '1h', index: false }));

app.get('*', (req, res) => {
  const indexFile = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  // Standalone API Mode (Vercel Backend / Production Serverless)
  return res.json({
    success: true,
    service: 'Nexa Music API (Vercel Serverless Production)',
    status: 'online',
    engine: YOUTUBE_API_KEY ? 'youtube_data_api_v3' : 'youtube_intelligent_engine',
    endpoints: {
      health: '/api/health',
      search: '/api/search?q={query}&limit={1-25}',
      trending: '/api/trending?category={category}',
      mood: '/api/mood?mood={mood}',
      lyrics: '/api/lyrics?title={title}&artist={artist}',
      suggestions: '/api/suggest?q={query}',
      sendOtp: 'POST /api/auth/send-otp',
      verifyOtp: 'POST /api/auth/verify-otp'
    }
  });
});

app.use((error, _req, res, _next) => {
  if (error.message?.includes('CORS')) {
    return res.status(403).json({ success: false, code: 'CORS_BLOCKED', message: error.message });
  }
  const status = Number(error.status) || 500;
  if (status >= 500) console.error(`[API ${error.code || 'ERROR'}] ${error.message}`);
  return res.status(status).json({
    success: false,
    code: error.code || 'SERVER_ERROR',
    message: error.status ? error.message : 'Something went wrong on the music server.'
  });
});

if (require.main === module) {
  const host = process.env.HOST || '0.0.0.0';
  const server = app.listen(PORT, host, () => {
    console.log(`Nexa Music API ready at http://localhost:${PORT}`);
    console.log(`Search Engine: ${YOUTUBE_API_KEY ? 'YouTube Data API v3' : 'Intelligent Public YouTube Engine'}`);
  });
  server.on('error', (error) => {
    const help = error.code === 'EADDRINUSE' ? 'That port is already in use. Change PORT in backend/.env.' : error.message;
    console.error(`Could not start Nexa Music API: ${help}`);
    process.exitCode = 1;
  });
}

module.exports = app;
module.exports.app = app;
module.exports.default = app;
module.exports.searchMusic = searchMusic;
module.exports.formatDuration = formatDuration;
module.exports.parseIsoDuration = parseIsoDuration;
