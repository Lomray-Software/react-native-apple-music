// MusicModule.m
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(MusicModule, NSObject)

RCT_EXTERN_METHOD(authorization:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(checkSubscription:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(catalogSearch:(NSString *)term types:(NSArray<NSString *> *)types options:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setPlaybackQueue:(NSString *)itemId type:(NSString *)type resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getTracksFromLibrary:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

// Player configuration
RCT_EXTERN_METHOD(configurePlayer:(NSString *)type mixWithOthers:(BOOL)mixWithOthers resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getPlayerType:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

// Playback controls
RCT_EXTERN_METHOD(play)
RCT_EXTERN_METHOD(pause)
RCT_EXTERN_METHOD(skipToNextEntry)
RCT_EXTERN_METHOD(skipToPreviousEntry)
RCT_EXTERN_METHOD(restartCurrentEntry)
RCT_EXTERN_METHOD(seekToTime:(double)time)
RCT_EXTERN_METHOD(togglePlayerState)
RCT_EXTERN_METHOD(getCurrentState:(RCTResponseSenderBlock)callback)

// Library access
RCT_EXTERN_METHOD(getUserPlaylists:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getLibrarySongs:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)solve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getPlaylistSongs:(NSString *)playlistId options:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(playLibrarySong:(NSString *)songId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(playLibraryPlaylist:(NSString *)playlistId startingAt:(int)songIndex resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onPlaybackStateChange", @"onCurrentSongChange", @"onPlayerTypeChanged"];
}

@end
