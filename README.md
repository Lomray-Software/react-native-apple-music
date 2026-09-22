# Apple MusicKit for React Native

Use this package for Apple Music authorization, catalog/library access and playback in an iOS React Native app. It does not provide Android or web playback, and it is not a general-purpose audio-file player.

The examples describe `@lomray/react-native-apple-music@1.4.0`. The package declares React `*` and React Native `>=0.61`; this is not evidence that every matching version or architecture has been tested. Verify the native build and MusicKit behavior on your target iOS device.

A react native module for the Apple MusicKit ( [iOS](https://developer.apple.com/musickit/) ).

The podspec includes legacy and new-architecture dependency setup. Native compatibility still needs verification with your React Native and Xcode versions.

## Supported Features

An [Example](./example) project was developed to exercise and test all functionality within this library. If you are curious about how to use something, or need to compare your application setup to something that works, check there first.

**To run the example app:** Override the example app with your own **bundle ID** that has the **MusicKit capability** enabled in your Apple Developer account. Replace the bundle identifier in the example’s Xcode project and entitlements with yours; otherwise MusicKit APIs will not be authorized.

## Features

The following table shows the platform support for various Apple Music functionality within this library.

| Feature                | iOS |
| :--------------------- | :-: |
| **Auth**               |
| `authorize`            | ✅  |
| `checkSubscription`    | ✅  |
| **Player**             |
| `play`                 | ✅  |
| `pause`                | ✅  |
| `togglePlayerState`    | ✅  |
| `skipToNextEntry`      | ✅  |
| `skipToPreviousEntry`  | ✅  |
| `restartCurrentEntry`  | ✅  |
| `seekToTime`           | ✅  |
| `getCurrentState`      | ✅  |
| `configurePlayer`      | ✅  |
| `addListener`          | ✅  |
| `removeAllListeners`   | ✅  |
| **MusicKit**           |
| `catalogSearch`        | ✅  |
| `getTracksFromLibrary` | ✅  |
| `getUserPlaylists`     | ✅  |
| `getLibrarySongs`      | ✅  |
| `getPlaylistSongs`     | ✅  |
| `setPlaybackQueue`     | ✅  |

## Installation

```sh
npm install @lomray/react-native-apple-music
```

- In your Podfile, set minimum IOS target for Pod installation:

```ruby
platform :ios, '15.0'
```

```sh
npx pod-install
```

### iOS Requirements

- Ensure your iOS deployment target is 15.0 or higher, as this library relies on the Apple MusicKit, which requires iOS 15.0+.
- Add the following line to your info.plist file to include a description for the Media Library usage permission:

```
<key>NSAppleMusicUsageDescription</key>
<string>Allow to continue</string>
```

- Ensure that your Apple Developer account has the MusicKit entitlement enabled and the appropriate MusicKit capabilities are set in your app's bundle identifier.
- The podspec declares iOS 15.0, and `CatalogService` is annotated for iOS 15.0. Library methods such as `getTracksFromLibrary`, `getUserPlaylists`, `getLibrarySongs` and `getPlaylistSongs` are annotated for iOS 16.0. These source annotations are not a native-build compatibility test; verify your deployment target and the methods you use in Xcode and on a device.

## Linking

The package provides a podspec for React Native autolinking. Install pods and rebuild the iOS app after adding it; JavaScript installation alone does not install the native MusicModule. The MusicKit entitlement and usage description above are still required.

## Usage

The `@lomray/react-native-apple-music` package provides a set of tools to interact with Apple MusicKit in your React Native application. Here's how to get started:

### Importing the Module

First, import the necessary modules from the package:

```javascript
import {
  Auth,
  Player,
  MusicKit,
  useCurrentSong,
  useIsPlaying,
  usePlaybackState,
} from '@lomray/react-native-apple-music';
```

### Authentication

Before accessing Apple Music data, you need to authenticate the user and obtain permissions:

```javascript
async function authenticate() {
  try {
    const authStatus = await Auth.authorize();
    console.log('Authorization Status:', authStatus);
  } catch (error) {
    console.error('Authorization failed:', error);
  }
}
```

### Checking Subscription

Check the user’s Apple Music subscription capabilities via MusicKit’s `MusicSubscription.current` (async). The response matches the [MusicSubscription](https://developer.apple.com/documentation/musickit/musicsubscription) struct:

```javascript
import { Auth, isMusicSubscriptionError } from '@lomray/react-native-apple-music';

async function checkSubscription() {
  try {
    const subscription = await Auth.checkSubscription();
    if (subscription.canPlayCatalogContent) {
      console.log('User can play Apple Music catalog');
    }
    if (subscription.canBecomeSubscriber) {
      console.log('App can present subscription offers');
    }
    if (subscription.hasCloudLibraryEnabled) {
      console.log('User has iCloud Music Library enabled');
    }
  } catch (error) {
    // MusicSubscription.Error: code is 'unknown' | 'permissionDenied' | 'privacyAcknowledgementRequired'
    if (isMusicSubscriptionError(error)) {
      if (error.code === 'permissionDenied') {
        console.warn('User denied access to Apple Music data');
      } else if (error.code === 'privacyAcknowledgementRequired') {
        console.warn('User must acknowledge the latest Apple Music privacy policy');
      }
    } else {
      console.error('Subscription check failed', error?.message ?? error);
    }
  }
}
```

Use `isMusicSubscriptionError(error)` from the package to narrow the error type and access `error.code` safely.

### Playing Music

Control playback using the Player module:

```javascript
Player.play();
Player.pause();
Player.togglePlayerState();
Player.skipToNextEntry();
Player.skipToPreviousEntry();
Player.restartCurrentEntry();
Player.seekToTime(30); // Seek to 30 seconds
```

### Retrieving Playback State

Get the current playback state and listen for changes:

```javascript
Player.getCurrentState().then((state) => {
  console.log('Current Playback State:', state);
});

// Listen for playback state changes
const playbackListener = Player.addListener('onPlaybackStateChange', (state) => {
  console.log('New Playback State:', state);
});

// Don't forget to remove the listener when it's no longer needed
playbackListener.remove();
```

### Managing Event Listeners

To maintain optimal performance and prevent memory leaks, it's important to manage your event listeners effectively. Here's how you can add and remove listeners using the `Player` class.

```javascript
const playbackListener = Player.addListener('onPlaybackStateChange', (state) => {
  console.log('New Playback State:', state);
});
```

```javascript
// This will remove all listeners for 'onPlaybackStateChange' event
Player.removeAllListeners('onPlaybackStateChange');
```

### Searching the Catalog

Search the Apple Music catalog:

```javascript
async function searchCatalog(query) {
  try {
    const types = ['songs', 'albums']; // Define the types of items you're searching for. The result will contain items among songs/albums
    const results = await MusicKit.catalogSearch(query, types);
    console.log('Search Results:', results);
  } catch (error) {
    console.error('Search failed:', error);
  }
}
```

### Getting user's recently played songs or albums

`getTracksFromLibrary` is annotated for iOS 16.0 in the native module. Get a list of recently played items:

```javascript
async function getTracksFromLibrary() {
  try {
    const results = await MusicKit.getTracksFromLibrary();
    console.log('User`s library Results:', results);
  } catch (error) {
    console.error('Getting user tracks failed:', error);
  }
}
```

### Accessing User's Library

The three methods below are annotated for iOS 16.0 in the native module. Fetch playlists and songs from the user's library:

```javascript
// Get user's playlists
const { playlists } = await MusicKit.getUserPlaylists({ limit: 50 });

// Get songs from user's library
const { songs } = await MusicKit.getLibrarySongs({ limit: 50 });

// Get songs from a specific playlist
const { songs } = await MusicKit.getPlaylistSongs(playlistId);
```

### Set a playback Queue

Load the player with Song, Album, Playlist or Station using their ID:

```javascript
await MusicKit.setPlaybackQueue('123456', 'album');
```

### Player Configuration

Configure the audio session behavior for mixing with other audio sources:

```javascript
// Default: Exclusive playback (pauses other audio)
await Player.configurePlayer(false);

// Enable audio mixing (for use alongside react-native-track-player or other audio sources)
await Player.configurePlayer(true);
```

When `mixWithOthers` is `true`, the audio session uses `.mixWithOthers` and `.duckOthers` options, allowing Apple Music to play alongside other audio sources while lowering their volume.

### Using Hooks

The package provides hooks for reactive states in your components:

<!-- docs-example: music-hooks -->
```tsx
import React from 'react';
import { Text, View } from 'react-native';
import { useCurrentSong, useIsPlaying, usePlaybackState } from '@lomray/react-native-apple-music';

export default function MusicPlayerComponent() {
  const { song } = useCurrentSong();
  const { isPlaying } = useIsPlaying();
  const { playbackTime } = usePlaybackState();
  const duration = Number(song?.duration ?? 0);
  const currentTime = playbackTime ?? 0;

  return (
    <View>
      <Text>{song?.title || 'No song playing'}</Text>
      <Text>{isPlaying ? 'Playing' : 'Paused'}</Text>
      <Text>
        {currentTime}s / {duration}s
      </Text>
    </View>
  );
}
```

The hooks remove their own event listeners on unmount. For listeners you add yourself, retain the returned subscription and call `.remove()` on cleanup. `Player.removeAllListeners` affects every listener for that event, including other components.

## Bugs and feature requests

Bug or a feature request, [please open a new issue](https://github.com/Lomray-Software/react-native-apple-music/issues/new).

## License

Made with 💚

Published under [Apache License](./LICENSE).
