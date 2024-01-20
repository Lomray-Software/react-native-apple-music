import type { PlaybackStatus } from './playback-status';
import type { ISong } from './song';

export interface IPlaybackState {
  currentSong: ISong;
  playbackRate: number;
  playbackStatus: PlaybackStatus;
  playbackTime: number;
}
