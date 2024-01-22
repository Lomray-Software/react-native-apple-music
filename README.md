# Apple MusicKit for React Native

A react native module for the Apple MusicKit ( [iOS](https://developer.apple.com/musickit/) )

## Supported Features

An [Example](./example) project was developed to exercise and test all functionality within this library. If you are curious about how to use something, or need to compare your application setup to something that works, check there first.

## Features

The following table shows the platform support for various Apple Music functionality within this library.

| Feature                | iOS |
|:-----------------------| :-: |
| **Auth**               |
| `authorize`            | ✅  |
| `checkSubscription`    | ✅  |
| **Player**             |
| `play`                 | ✅  |
| `pause`                | ✅  |
| `togglePlayerState`    | ✅  |
| `skipToNextEntry`      | ✅  |
| `getCurrentState`      | ✅  |
| `addListener`          | ✅  |
| `removeListener`       | ✅  |
| **MusicKit**           |
| `catalogSearch`        | ✅  |
| `getTracksFromLibrary` | ✅  |
| `setPlaybackQueue`     | ✅  |

## Installation

```sh
npm install @lomray/react-native-apple-music
```
- In your Podfile, set minimum IOS target for Pod installation:
```sh
platform :ios, 15.0
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
- It's highly recommended to set a minimum deployment target of your application to 16.0 and above, because MusicKit requires it to perform a catalog search and some convertation methods.

## Linking

As of React Native `> 0.61`, auto linking should work for iOS. There shouldn't be any modifications necessary and it _Should_ work out of the box.

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
Check if the user has an active Apple Music subscription:

```javascript
async function checkSubscription() {
  const subscriptionStatus = await Auth.checkSubscription();
  console.log('Subscription Status:', subscriptionStatus);
}
```

### Playing Music
Control playback using the Player module:

```javascript
// Play music
Player.play();

// Pause music
Player.pause();

// Toggle between play and pause
Player.togglePlayerState();

// Skip to the next song
Player.skipToNextEntry();
```

### Retrieving Playback State
Get the current playback state and listen for changes:

```javascript
Player.getCurrentState().then(state => {
  console.log('Current Playback State:', state);
});

// Listen for playback state changes
const playbackListener = Player.addListener('onPlaybackStateChange', state => {
  console.log('New Playback State:', state);
});

// Don't forget to remove the listener when it's no longer needed
playbackListener.remove();
```

### Managing Event Listeners
To maintain optimal performance and prevent memory leaks, it's important to manage your event listeners effectively. Here's how you can add and remove listeners using the `Player` class.
```javascript
const playbackListener = Player.addListener('onPlaybackStateChange', state => {
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
Get a list of recently played items:

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



### Set a playback Queue
Load a system Player with Song, Album, Playlist or Station, using their ID:

```javascript
async function setPlaybackQueue() {
  try {
    await MusicKit.setPlaybackQueue("123456", "album");
  } catch (error) {
    console.error('Setting playback queue:', error);
  }
}
```

### Using Hooks
The package provides hooks for reactive states in your components:

```javascript
import React from 'react';
import { View } from 'react-native';
import { useCurrentSong, useIsPlaying } from '@lomray/react-native-apple-music';

function MusicPlayerComponent() {
  const { song } = useCurrentSong();
  const { isPlaying } = useIsPlaying();

  return (
    <View>
      {isPlaying ? 'Playing' : 'Paused'} - {currentSong?.title || 'No song playing'}
    </View>
  );
}
```

## Bugs and feature requests

Bug or a feature request, [please open a new issue](https://github.com/Lomray-Software/react-native-apple-music/issues/new).

## License
Made with 💚

Published under [Apache License](./LICENSE).
