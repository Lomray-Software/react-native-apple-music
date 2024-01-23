import { NativeModules } from 'react-native';
import type { CatalogSearchType, ICatalogSearch } from '../types/catalog-search';
import type { MusicItem } from '../types/music-item';
import type { ITracksFromLibrary } from '../types/tracks-from-library';

const { MusicModule } = NativeModules;

interface IEndlessListOptions {
  offset?: number;
  limit?: number;
}

class MusicKit {
  /**
   * Searches the Apple Music catalog using the specified search terms, types, and options.
   * @param {string} search - The search query string.
   * @param {CatalogSearchType[]} types - The types of catalog items to search for.
   * @param {IEndlessListOptions} [options] - Additional options for the search.
   * @returns {Promise<ISong[]>} A promise that resolves to the search results.
   */
  public static async catalogSearch(
    search: string,
    types: CatalogSearchType[],
    options?: IEndlessListOptions,
  ): Promise<ICatalogSearch | undefined> {
    try {
      return (await MusicModule.catalogSearch(search, types, options)) as ICatalogSearch;
    } catch (error) {
      console.error('Apple Music Kit: Catalog Search failed.', error);

      return {
        songs: [],
        albums: [],
      };
    }
  }

  /**
   * @param itemId - ID of collection to be set in a player's queue
   * @param {MusicItem} type - Type of collection to be found and set
   * @returns {Promise<boolean>} A promise is resolved when tracks successfully added to a queue
   */
  public static async setPlaybackQueue(itemId: string, type: MusicItem): Promise<void> {
    try {
      await MusicModule.setPlaybackQueue(itemId, type);
    } catch (error) {
      console.error('Apple Music Kit: Setting Playback Failed.', error);
    }
  }

  /**
   * Get a list of recently played items in user's library
   * @return {Promise<ITracksFromLibrary[]>} A promise returns a list of recently played items including tracks, playlists, stations, albums
   */
  public static async getTracksFromLibrary(): Promise<ITracksFromLibrary> {
    try {
      const result = await MusicModule.getTracksFromLibrary();

      return result as ITracksFromLibrary;
    } catch (error) {
      console.error('Apple Music Kit: Getting tracks from user library failed.', error);

      return {
        recentlyPlayedItems: [],
      };
    }
  }
}

export default MusicKit;
