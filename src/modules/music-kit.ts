import { NativeModules } from 'react-native';
import type { CatalogSearchType } from '../types/catalog-search-type';
import type { ISong } from '../types/song';

const { MusicModule } = NativeModules;

interface IEndlessListOptions {
  offset?: number;
  limit?: number;
}

class MusicKit {
  /**
   * Searches the Apple Music catalog using the specified search terms, types, and options.
   * @param {string} search - The search query string.
   * @param {ICatalogSearchType[]} types - The types of catalog items to search for.
   * @param {IEndlessListOptions} [options] - Additional options for the search.
   * @returns {Promise<ISong[]>} A promise that resolves to the search results.
   */
  public static async catalogSearch(
    search: string,
    types: CatalogSearchType[],
    options?: IEndlessListOptions,
  ): Promise<ISong[]> {
    try {
      const response: { results: ISong[] } = await MusicModule.catalogSearch(
        search,
        types,
        options,
      );

      if (response.results) {
        return response.results;
      }

      throw new Error('Apple Music Kit: Entities not found.');
    } catch (error) {
      console.error('Apple Music Kit: ', error);

      return [];
    }
  }
}

export default MusicKit;
