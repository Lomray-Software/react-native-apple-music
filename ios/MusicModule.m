// MusicModule.m
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(MusicModule, NSObject)

RCT_EXTERN_METHOD(authorization:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(checkSubscription:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(catalogSearch:(NSString *)term types:(NSArray<NSString *> *)types options:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(play)
RCT_EXTERN_METHOD(pause)
RCT_EXTERN_METHOD(skipToNextEntry)
RCT_EXTERN_METHOD(togglePlayerState)
RCT_EXTERN_METHOD(getCurrentState:(RCTResponseSenderBlock)callback)

// Определение, что этот модуль имеет события, которые могут быть отправлены в JavaScript.
// Эта функция сообщает React Native о событиях, которые этот модуль может отправить.
- (NSArray<NSString *> *)supportedEvents {
  return @[@"onPlaybackStateChange", @"onCurrentSongChange"]; // Список событий
}

@end
