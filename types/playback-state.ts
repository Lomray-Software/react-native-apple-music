import PlaybackStatus from './playback-status';
import Song from './song';

interface PlaybackState {
  currentSong: Song;
  playbackRate: number;
  playbackStatus: PlaybackStatus;
}

export default PlaybackState;
