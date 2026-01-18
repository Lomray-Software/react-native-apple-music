import type { EmitterSubscription } from 'react-native';
// eslint-disable-next-line import/named
import { NativeEventEmitter, NativeModules } from 'react-native';
import type { IPlaybackState } from '../types/playback-state';
import type { ISong } from '../types/song';

const { MusicModule } = NativeModules;

/**
 * Player type options:
 * - 'system': Uses SystemMusicPlayer - controls the system-wide Apple Music player.
 *   This is the same player used by the Apple Music app. Changes here affect the system player.
 * - 'application': Uses ApplicationMusicPlayer - app-specific player that can be configured
 *   to mix with other audio sources (like react-native-track-player).
 */
export type PlayerType = 'system' | 'application';

export interface IPlayerConfig {
  playerType: PlayerType;
  mixWithOthers: boolean;
}

interface IPlayerEvents {
  onPlaybackStateChange: IPlaybackState;
  onCurrentSongChange: ISong;
  onPlayerTypeChanged: IPlayerConfig;
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
  public static getCurrentState(): Promise<IPlaybackState> {
    return new Promise((res, rej) => {
      try {
        MusicModule.getCurrentState(res);
      } catch (error) {
        console.error('Apple Music Kit: getCurrentState failed.', error);

        rej(error);
      }
    });
  }

  /**
   * Method to add a listener for an event.
   * @param eventType - Type of the event to listen for.
   * @param listener - Function to execute when the event is emitted.
   * @returns An EmitterSubscription which can be used to remove the listener.
   */
  public static addListener(
    eventType: keyof IPlayerEvents,
    listener: (eventData: any) => void,
  ): EmitterSubscription {
    return nativeEventEmitter.addListener(eventType, listener);
  }

  /**
   * Method to remove all listeners of event
   * @param eventType - Type of the event to remove listener for.
   */
  public static removeAllListeners(eventType: keyof IPlayerEvents): void {
    return nativeEventEmitter.removeAllListeners(eventType);
  }

  /**
   * Configures the player type and audio session behavior.
   *
   * @param {PlayerType} type - 'system' for SystemMusicPlayer (default) or 'application' for ApplicationMusicPlayer
   * @param {boolean} mixWithOthers - If true and using 'application' player, allows mixing with other audio sources.
   *                                  This enables combining Apple Music with react-native-track-player.
   * @returns {Promise<IPlayerConfig>} The applied configuration
   *
   * @example
   * // Use application player with audio mixing (for combining with track-player)
   * await Player.configurePlayer('application', true);
   *
   * @example
   * // Use system player (default behavior, controls system Apple Music)
   * await Player.configurePlayer('system', false);
   */
  public static async configurePlayer(
    type: PlayerType,
    mixWithOthers = false,
  ): Promise<IPlayerConfig> {
    return MusicModule.configurePlayer(type, mixWithOthers);
  }

  /**
   * Gets the current player type.
   * @returns {Promise<PlayerType>} The current player type ('system' or 'application')
   */
  public static async getPlayerType(): Promise<PlayerType> {
    return MusicModule.getPlayerType();
  }
}

export default Player;
