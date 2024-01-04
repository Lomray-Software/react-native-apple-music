import { useEffect, useState } from 'react';
import Player from '../modules/player';
import type { IPlaybackState } from '../types/playback-state';
import type { ISong } from '../types/song';

/**
 * A hook to track the currently playing song from Apple Music.
 * It listens for changes from the native music player and updates the `currentSong` state accordingly.
 *
 * @returns {Song | null} The `currentSong` state indicating the current song details or null if no song is playing.
 */
const useCurrentSong = (): ISong | null => {
  const [currentSong, setCurrentSong] = useState<ISong | null>(null);

  useEffect(() => {
    const updateCurrentSong = (state: IPlaybackState) => setCurrentSong(state?.currentSong);

    Player.getCurrentState().then(updateCurrentSong).catch(console.error);

    Player.addListener('onCurrentSongChange', updateCurrentSong);

    return () => Player.removeListener('onCurrentSongChange', updateCurrentSong);
  }, []);

  return currentSong;
};

export default useCurrentSong;
