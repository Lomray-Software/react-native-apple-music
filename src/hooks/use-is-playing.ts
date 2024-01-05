import { useEffect, useState } from 'react';
import Player from '../modules/player';
import type { IPlaybackState } from '../types/playback-state';
import { PlaybackStatus } from '../types/playback-status';

/**
 * Custom React hook to track music playback status.
 * It interacts with the native music player via the MusicKit to determine
 * whether music is currently playing and provides a reactive `isPlaying` state.
 * @returns {{ isPlaying: boolean; error?: Error }} The `isPlaying` state indicating whether music is currently playing.
 */
const useIsPlaying = (): { isPlaying: boolean; error?: Error } => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    Player.getCurrentState()
      .then((state: IPlaybackState) =>
        setIsPlaying(state?.playbackStatus === PlaybackStatus.PLAYING),
      )
      .catch(setError);

    const listener = Player.addListener('onPlaybackStateChange', (state: IPlaybackState) => {
      setError(undefined);
      setIsPlaying(state.playbackStatus === PlaybackStatus.PLAYING);
    });

    return () => listener.remove();
  }, []);

  return { isPlaying, error };
};

export default useIsPlaying;
