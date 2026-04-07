import type { EmitterSubscription } from 'react-native';
// eslint-disable-next-line import/named
import { NativeEventEmitter, NativeModules } from 'react-native';
import type { IPlaybackState } from '../types/playback-state';
import type { ISong } from '../types/song';

const { MusicModule } = NativeModules;

export interface IPlayerConfig {
  mixWithOthers: boolean;
}

interface IPlaybackTimeUpdate {
  playbackTime: number;
}

export interface IPlaybackError {
  message: string;
  code: number;
  domain: string;
  operation: 'play' | 'togglePlayback' | 'skipToNext' | 'skipToPrevious';
}

interface IPlayerEvents {
  onPlaybackStateChange: IPlaybackState;
  onCurrentSongChange: ISong;
  onPlaybackTimeUpdate: IPlaybackTimeUpdate;
  onPlaybackError: IPlaybackError;
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const nativeEventEmitter = new NativeEventEmitter(MusicModule);

class Player {
  /**
   * Skips to the next entry in the playback queue.
   */
  public static skipToNextEntry(): void {
    MusicModule.skipToNextEntry();
  }

  /**
   * Skips to the previous entry in the playback queue.
   */
  public static skipToPreviousEntry(): void {
    MusicModule.skipToPreviousEntry();
  }

  /**
   * Restarts the current entry from the beginning.
   */
  public static restartCurrentEntry(): void {
    MusicModule.restartCurrentEntry();
  }

  /**
   * Seeks to a specific time in the current track.
   * @param {number} time - The time in seconds to seek to.
   */
  public static seekToTime(time: number): void {
    MusicModule.seekToTime(time);
  }

  /**
   * Toggles the playback state between play and pause.
   */
  public static togglePlayerState(): void {
    MusicModule.togglePlayerState();
  }

  /**
   * Starts playback of the current song.
   */
  public static play(): void {
    MusicModule.play();
  }

  /**
   * Pauses playback of the current song.
   */
  public static pause(): void {
    MusicModule.pause();
  }

  /**
   * Retrieves the current playback state from the native music player.
   * This function returns a promise that resolves to the current playback state.
   * @returns {Promise<IPlaybackState>} A promise that resolves to the current playback state of the music player.
   */
  public static async getCurrentState(): Promise<IPlaybackState> {
    try {
      return await MusicModule.getCurrentState();
    } catch (error) {
      console.error('Apple Music Kit: getCurrentState failed.', error);
      throw error;
    }
  }

  /**
   * Method to add a listener for an event.
   * @param eventType - Type of the event to listen for.
   * @param listener - Function to execute when the event is emitted.
   * @returns An EmitterSubscription which can be used to remove the listener.
   */
  public static addListener(
    eventType: keyof IPlayerEvents,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (eventData: any) => void,
  ): EmitterSubscription {
    return nativeEventEmitter.addListener(eventType, listener);
  }

  /**
   * Method to remove all listeners of event.
   * @param eventType - Type of the event to remove listener for.
   */
  public static removeAllListeners(eventType: keyof IPlayerEvents): void {
    return nativeEventEmitter.removeAllListeners(eventType);
  }

  /**
   * Configures the audio session behavior for mixing with other audio sources.
   * @param {boolean} mixWithOthers - If true, allows mixing with other audio sources (like react-native-track-player).
   *                                  When true, uses .mixWithOthers and .duckOthers options.
   * @returns {Promise<IPlayerConfig>} The applied configuration
   */
  public static async configurePlayer(mixWithOthers = false): Promise<IPlayerConfig> {
    return MusicModule.configurePlayer(mixWithOthers);
  }
}

export default Player;
