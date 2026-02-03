/**
 * Subscription capabilities from MusicKit
 * @see https://developer.apple.com/documentation/musickit/musicsubscription
 */
export interface ICheckSubscription {
  /**
   * A capability that allows your app to play subscription content using a music player.
   */
  canPlayCatalogContent: boolean;
  /**
   * A capability that allows your app to present subscription offers for Apple Music.
   */
  canBecomeSubscriber: boolean;
  /**
   * A capability that allows your app to perform modifications to the user's iCloud Music Library.
   */
  hasCloudLibraryEnabled: boolean;
  /**
   * Same as canBecomeSubscriber. Kept for backward compatibility.
   */
  isMusicCatalogSubscriptionEligible: boolean;
}

export type MusicSubscriptionErrorCode =
  | 'unknown'
  | 'permissionDenied'
  | 'privacyAcknowledgementRequired';

export interface IMusicSubscriptionError extends Error {
  code: MusicSubscriptionErrorCode | string;
  message: string;
}

export const isMusicSubscriptionError = (
  error: unknown,
): error is IMusicSubscriptionError & { code: MusicSubscriptionErrorCode } =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  ['unknown', 'permissionDenied', 'privacyAcknowledgementRequired'].includes(
    (error as IMusicSubscriptionError).code,
  );
