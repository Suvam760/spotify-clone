import { useEffect, useRef } from 'react';

let youtubeApiPromise;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const priorCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof priorCallback === 'function') priorCallback();
      resolve(window.YT);
    };

    let script = document.querySelector('script[data-youtube-iframe-api]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.youtubeIframeApi = 'true';
      script.onerror = () => reject(new Error('YouTube player could not be loaded.'));
      document.head.appendChild(script);
    }
  }).catch((error) => {
    youtubeApiPromise = null;
    throw error;
  });

  return youtubeApiPromise;
}

export function YouTubePlayer({
  videoId,
  shouldPlay,
  onPlayerReady,
  onPlaybackState,
  onProgress,
  onEnded,
  onError,
  isAudioOnly = false
}) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const loadedVideoRef = useRef(null);
  const progressTimerRef = useRef(null);
  const latestPropsRef = useRef({});

  useEffect(() => {
    latestPropsRef.current = { shouldPlay, onPlayerReady, onPlaybackState, onProgress, onEnded, onError };
  }, [shouldPlay, onPlayerReady, onPlaybackState, onProgress, onEnded, onError]);

  useEffect(() => {
    if (!playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState?.();
      if (shouldPlay && state !== 1 && state !== 3) {
        playerRef.current.playVideo?.();
      } else if (!shouldPlay && state === 1) {
        playerRef.current.pauseVideo?.();
      }
    } catch {
      // player might be initializing
    }
  }, [shouldPlay]);

  useEffect(() => {
    if (!videoId || !mountRef.current) return undefined;
    let cancelled = false;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current) return;

        if (playerRef.current) {
          if (loadedVideoRef.current !== videoId) {
            loadedVideoRef.current = videoId;
            try {
              if (latestPropsRef.current.shouldPlay) {
                playerRef.current.loadVideoById(videoId);
              } else {
                playerRef.current.cueVideoById(videoId);
              }
            } catch (err) {
              console.warn('Error cueing video:', err);
            }
          }
          return;
        }

        loadedVideoRef.current = videoId;
        playerRef.current = new YT.Player(mountRef.current, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady(event) {
              latestPropsRef.current.onPlayerReady?.(event.target);
              if (latestPropsRef.current.shouldPlay) {
                try {
                  event.target.playVideo();
                } catch {
                  // ignore autoplay block
                }
              }
            },
            onStateChange(event) {
              const state = event.data;
              const playing = state === YT.PlayerState.PLAYING;
              latestPropsRef.current.onPlaybackState?.(playing);

              if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
              if (playing) {
                progressTimerRef.current = window.setInterval(() => {
                  const player = playerRef.current;
                  if (!player?.getCurrentTime) return;
                  try {
                    latestPropsRef.current.onProgress?.({
                      currentTime: player.getCurrentTime() || 0,
                      duration: player.getDuration() || 0
                    });
                  } catch {
                    // ignore
                  }
                }, 400);
              } else {
                const player = event.target;
                try {
                  latestPropsRef.current.onProgress?.({
                    currentTime: player.getCurrentTime?.() || 0,
                    duration: player.getDuration?.() || 0
                  });
                } catch {
                  // ignore
                }
              }
              if (state === YT.PlayerState.ENDED) {
                latestPropsRef.current.onEnded?.();
              }
            },
            onError(event) {
              latestPropsRef.current.onPlaybackState?.(false);
              // Error 101 or 150: restricted embed
              // Error 100: video removed/private
              // Error 2: invalid ID
              // Error 5: HTML5 player error
              if ([2, 5, 100, 101, 150].includes(event.data)) {
                latestPropsRef.current.onError?.('Track cannot be played in embedded player. Skipping to next…');
                setTimeout(() => {
                  latestPropsRef.current.onEnded?.();
                }, 1200);
              } else {
                latestPropsRef.current.onError?.(event.data);
              }
            }
          }
        });
      })
      .catch((error) => {
        if (!cancelled) latestPropsRef.current.onError?.(error.message);
      });

    return () => { cancelled = true; };
  }, [videoId]);

  useEffect(() => () => {
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    playerRef.current?.destroy?.();
    playerRef.current = null;
    loadedVideoRef.current = null;
    latestPropsRef.current.onPlayerReady?.(null);
  }, []);

  return (
    <div
      className={`youtube-player-frame ${isAudioOnly ? 'audio-only-mode' : ''}`}
      ref={mountRef}
      aria-label="YouTube music player"
    />
  );
}
