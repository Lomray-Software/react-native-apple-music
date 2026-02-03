import { useEffect, useState } from 'react';
import Player from '../modules/player';
import type { IPlaybackState } from '../types/playback-state';
import type { ISong } from '../types/song';

/**
 * A hook to track the currently playing song from Apple Music.
 * Listens for changes from the native music player and updates the currentSong state.
 */
const useCurrentSong = (): { song?: ISong; error?: Error } => {
  const [currentSong, setCurrentSong] = useState<ISong>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    Player.getCurrentState()
      .then((state) => setCurrentSong(state.currentSong))
      .catch(setError);

    const listener = Player.addListener('onCurrentSongChange', (state: IPlaybackState) => {
      setError(undefined);
      setCurrentSong(state?.currentSong);
    });

    return () => listener.remove();
  }, []);

  return { song: currentSong, error };
};

export default useCurrentSong;
