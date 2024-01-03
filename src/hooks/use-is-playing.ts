import { useEffect, useState } from 'react';
import AppleMusic from '..';

/**
 * Custom React hook to track music playback status.
 * It interacts with the native music player via the MusicKit to determine
 * whether music is currently playing and provides a reactive `isPlaying` state.
 * @returns {boolean} The `isPlaying` state indicating whether music is currently playing.
 */
const useIsPlaying = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    AppleMusic.Player.getCurrentState((state) =>
      setIsPlaying(state?.playbackStatus === 'playing')
    );

    const playbackStateSubscription = AppleMusic.Player.addListener(
      'onPlaybackStateChange',
      (state) => setIsPlaying(state?.playbackStatus === 'playing')
    );

    return () => playbackStateSubscription.remove();
  }, []);

  return isPlaying;
};

export default useIsPlaying;
