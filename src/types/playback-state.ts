import type PlaybackStatus from './playback-status';
import type Song from './song';

interface IPlaybackState {
  currentSong: Song;
  playbackRate: number;
  playbackStatus: PlaybackStatus;
}

export default IPlaybackState;
