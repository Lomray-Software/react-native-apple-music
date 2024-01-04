import { useEffect, useState } from 'react';
import Player from '../modules/player';
import type { IPlaybackState } from '../types/playback-state';

/**
 * Custom React hook to track music playback status.
 * It interacts with the native music player via the MusicKit to determine
 * whether music is currently playing and provides a reactive `isPlaying` state.
 * @returns {boolean} The `isPlaying` state indicating whether music is currently playing.
 */
const useIsPlaying = (): boolean => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const updateIsPlaying = (state: IPlaybackState) =>
      setIsPlaying(state?.playbackStatus === 'playing');

    Player.getCurrentState().then(updateIsPlaying).catch(console.error);

    Player.addListener('onPlaybackStateChange', updateIsPlaying);

    return () => Player.removeListener('onPlaybackStateChange', updateIsPlaying);
  }, []);

  return isPlaying;
};

export default useIsPlaying;
