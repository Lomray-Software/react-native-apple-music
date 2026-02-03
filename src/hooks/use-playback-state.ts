import { useEffect, useState } from 'react';
import Player from '../modules/player';
import type { IPlaybackState } from '../types/playback-state';
import type { PlaybackStatus } from '../types/playback-status';

/**
 * Hook to track playback state (playbackTime, playbackStatus) from native events.
 * Use with useCurrentSong for duration and Player.seekToTime() for seeking.
 */
const usePlaybackState = (): {
  playbackTime: number;
  playbackStatus: PlaybackStatus | string;
  error?: Error;
} => {
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus | string>('stopped');
  const [error, setError] = useState<Error>();

  useEffect(() => {
    Player.getCurrentState()
      .then((state: IPlaybackState) => {
        setPlaybackTime(state.playbackTime ?? 0);
        setPlaybackStatus(state.playbackStatus ?? 'stopped');
      })
      .catch(setError);

    const stateListener = Player.addListener('onPlaybackStateChange', (next: IPlaybackState) => {
      setError(undefined);

      if (next.playbackTime !== undefined) {
        setPlaybackTime(next.playbackTime);
      }

      if (next.playbackStatus !== undefined) {
        setPlaybackStatus(next.playbackStatus);
      }
    });

    const timeListener = Player.addListener(
      'onPlaybackTimeUpdate',
      (next: { playbackTime: number }) => {
        if (next.playbackTime !== undefined) {
          setPlaybackTime(next.playbackTime);
        }
      },
    );

    return () => {
      stateListener.remove();
      timeListener.remove();
    };
  }, []);

  return { playbackTime, playbackStatus, error };
};

export default usePlaybackState;
