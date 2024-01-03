import { useEffect, useState } from 'react';
import type { PlaybackState } from '..';
import AppleMusic from '..';
import type Song from '../types/song';

/**
 * A hook to track the currently playing song from Apple Music.
 * It listens for changes from the native music player and updates the `currentSong` state accordingly.
 *
 * @returns {Song | null} The `currentSong` state indicating the current song details or null if no song is playing.
 */
const useCurrentSong = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    AppleMusic.Player.getCurrentState((currentState) =>
      setCurrentSong(currentState?.currentSong)
    );

    const playbackStateSubscription = AppleMusic.Player.addListener(
      'onCurrentSongChange',
      (state: PlaybackState) => setCurrentSong(state?.currentSong)
    );

    return () => playbackStateSubscription.remove();
  }, []);

  return currentSong;
};

export default useCurrentSong;
