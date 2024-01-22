export interface ICheckSubscription {
  /**
   * The device allows playback of Apple Music catalog tracks
   */
  canPlayCatalogContent: boolean;
  /**
   * The device allows tracks to be added in user's library
   */
  hasCloudLibraryEnabled: boolean;
  /**
   * The device allows subscription to the Apple Music Catalog
   */
  isMusicCatalogSubscriptionEligible: boolean;
}
