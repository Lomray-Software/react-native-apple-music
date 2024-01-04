# Apple MusicKit for React Native

A react native module for the Apple MusicKit ( [iOS](https://developer.apple.com/musickit/) )

## Supported Features

An [Example](./example) project was developed to exercise and test all functionality within this library. If you are curious about how to use something, or need to compare your application setup to something that works, check there first.

## Features

The following table shows the platform support for various Apple Music functionality within this library.

| Feature                      | iOS |
| :--------------------------- | :-: |
| **Auth**           |
| `authorize`                  | ✅  |
| `checkSubscription`          | ✅  |
| **Player**                   |
| `play`                       | ✅  |
| `pause`                      | ✅  |
| `togglePlayerState`          | ✅  |
| `skipToNextEntry`            | ✅  |
| `getCurrentState`            | ✅  |
| `addListener`                | ✅  |
| `removeListener`             | ✅  |
| **MusicKit**                 |
| `catalogSearch`              | ✅  |

## Installation

```sh
npm install @lomray/react-native-apple-music
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

## Linking

As of React Native `> 0.61`, auto linking should work for iOS. There shouldn't be any modifications necessary and it _Should_ work out of the box.

## Usage


## Bugs and feature requests

Bug or a feature request, [please open a new issue](https://github.com/Lomray-Software/vite-ssr-boost/issues/new).

## License
Made with 💚

Published under [Apache License](./LICENSE).
