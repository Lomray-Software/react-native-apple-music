import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import PlaybackStatus from '../types/playback-status';
import Song from '../types/song';

const {MusicModule} = NativeModules;

interface PlaybackState {
  currentSong: Song;
  playbackRate: number;
  playbackStatus: PlaybackStatus;
}

interface PlayerEvents {
  onPlaybackStateChange: PlaybackState;
  onCurrentSongChange: Song;
}

const nativeEventEmitter = new NativeEventEmitter(MusicModule);

// Initialize a structure to keep track of listeners
const eventListeners: Record<keyof PlayerEvents, Set<EmitterSubscription>> = {
  onPlaybackStateChange: new Set(),
  onCurrentSongChange: new Set(),
};

class Player {
  /**
   * Skips to the next entry in the playback queue.
   */
  public static skipToNextEntry() {
    MusicModule.skipToNextEntry();
  }

  /**
   * Toggles the playback state between play and pause.
   */
  public static togglePlayerState() {
    MusicModule.togglePlayerState();
  }

  /**
   * Starts playback of the current song.
   */
  public static play() {
    MusicModule.play();
  }

  /**
   * Pauses playback of the current song.
   */
  public static pause() {
    MusicModule.pause();
  }

  /**
   * Retrieves the current playback state from the native music player.
   * @param {function(PlaybackState):void} callback - The callback function to handle the playback state.
   */
  public static getCurrentState(callback: (state: PlaybackState) => void) {
    MusicModule.getCurrentState(callback);
  }

  /**
   * Method to add a listener for an event.
   * @param eventType - Type of the event to listen for.
   * @param listener - Function to execute when the event is emitted.
   * @returns An EmitterSubscription which can be used to remove the listener.
   */
  public static addListener(
    eventType: keyof PlayerEvents,
    listener: (eventData: any) => void,
  ): EmitterSubscription {
    const subscription = nativeEventEmitter.addListener(eventType, listener);
    eventListeners[eventType].add(subscription);
    return subscription;
  }

  /**
   * Method to remove a specific event listener.
   * @param subscription - The subscription returned from addListener to be removed.
   */
  public static removeListener(subscription: EmitterSubscription) {
    subscription.remove();
    const eventType = subscription.eventType as keyof PlayerEvents;
    if (eventListeners[eventType]) {
      eventListeners[eventType].delete(subscription);
    }
  }

  /**
   * Method to remove all listeners for a specific event type.
   * @param eventType - Type of the event to remove listeners for.
   */
  public static removeAllListeners(eventType: keyof PlayerEvents) {
    eventListeners[eventType].forEach(subscription => {
      subscription.remove();
    });
    eventListeners[eventType].clear();
  }
}

export default Player;
