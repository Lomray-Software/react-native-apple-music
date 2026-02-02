import { useEffect, useState } from 'react';
import Player from '../modules/player';
import type { IPlaybackState } from '../types/playback-state';
import { PlaybackStatus } from '../types/playback-status';

/**
 * Hook to track whether music is currently playing via native playback state events.
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
      setIsPlaying(state?.playbackStatus === PlaybackStatus.PLAYING);
    });

    return () => listener.remove();
  }, []);

  return { isPlaying, error };
};

export default useIsPlaying;
