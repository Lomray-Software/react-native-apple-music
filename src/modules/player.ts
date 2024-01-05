import type { EmitterSubscription } from 'react-native';
// eslint-disable-next-line import/named
import { NativeEventEmitter, NativeModules } from 'react-native';
import type { IPlaybackState } from '../types/playback-state';
import type { ISong } from '../types/song';

const { MusicModule } = NativeModules;

interface IPlayerEvents {
  onPlaybackStateChange: IPlaybackState;
  onCurrentSongChange: ISong;
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
}

export default Player;
