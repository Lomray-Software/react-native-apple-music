import { NativeModules } from 'react-native';
import type CatalogSearchType from '../types/catalog-search-type';
import type Song from '../types/song';

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
   * @param {EndlessListOptions} [options] - Additional options for the search.
   * @returns {Promise<Song[]>} A promise that resolves to the search results.
   */
  public static async catalogSearch(
    search: string,
    types: CatalogSearchType[],
    options?: IEndlessListOptions,
  ) {
    try {
      const response: { results: Song[] } = await MusicModule.catalogSearch(search, types, options);

      if (response.results) {
        return response.results;
      }

      throw new Error('Entities not found');
    } catch (error) {
      console.log('Error: ', error);
    }
  }
}

export default MusicKit;
