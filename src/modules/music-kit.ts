import { NativeModules } from 'react-native';
import type { CatalogSearchType, ICatalogSearch } from '../types/catalog-search';
import type { MusicItem } from '../types/music-item';
import type { IPlaylistsResponse, IPlaylistSongsResponse } from '../types/playlist';
import type { ISong } from '../types/song';
import type { ITracksFromLibrary } from '../types/tracks-from-library';

const { MusicModule } = NativeModules;

export interface IEndlessListOptions {
  offset?: number;
  limit?: number;
}

export interface ILibrarySongsResponse {
  songs: ISong[];
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

  /**
   * Get user's playlists from their library
   * @param {IEndlessListOptions} [options] - Pagination options
   * @return {Promise<IPlaylistsResponse>} A promise that resolves to the user's playlists
   */
  public static async getUserPlaylists(options?: IEndlessListOptions): Promise<IPlaylistsResponse> {
    try {
      const result = await MusicModule.getUserPlaylists(options ?? {});

      return result as IPlaylistsResponse;
    } catch (error) {
      console.error('Apple Music Kit: Getting user playlists failed.', error);

      return {
        playlists: [],
      };
    }
  }

  /**
   * Get songs from the user's library
   * @param {IEndlessListOptions} [options] - Pagination options
   * @return {Promise<ILibrarySongsResponse>} A promise that resolves to the library songs
   */
  public static async getLibrarySongs(
    options?: IEndlessListOptions,
  ): Promise<ILibrarySongsResponse> {
    try {
      const result = await MusicModule.getLibrarySongs(options ?? {});

      return result as ILibrarySongsResponse;
    } catch (error) {
      console.error('Apple Music Kit: Getting library songs failed.', error);

      return {
        songs: [],
      };
    }
  }

  /**
   * Get songs from a specific playlist
   * @param {string} playlistId - The ID of the playlist
   * @param {IEndlessListOptions} [options] - Pagination options
   * @return {Promise<IPlaylistSongsResponse>} A promise that resolves to the playlist songs
   */
  public static async getPlaylistSongs(
    playlistId: string,
    options?: IEndlessListOptions,
  ): Promise<IPlaylistSongsResponse> {
    try {
      const result = await MusicModule.getPlaylistSongs(playlistId, options ?? {});

      return result as IPlaylistSongsResponse;
    } catch (error) {
      console.error('Apple Music Kit: Getting playlist songs failed.', error);

      return {
        songs: [],
      };
    }
  }

  /**
   * Play a song from the user's library
   * @param {string} songId - The library song ID (usually starts with 'l.')
   * @return {Promise<void>}
   */
  public static async playLibrarySong(songId: string): Promise<void> {
    try {
      await MusicModule.playLibrarySong(songId);
    } catch (error) {
      console.error('Apple Music Kit: Playing library song failed.', error);
    }
  }

  /**
   * Play a playlist from the user's library
   * @param {string} playlistId - The library playlist ID
   * @param {number} [startingAt=-1] - Index of the song to start playing from (-1 for beginning)
   * @return {Promise<void>}
   */
  public static async playLibraryPlaylist(playlistId: string, startingAt = -1): Promise<void> {
    try {
      await MusicModule.playLibraryPlaylist(playlistId, startingAt);
    } catch (error) {
      console.error('Apple Music Kit: Playing library playlist failed.', error);
    }
  }
}

export default MusicKit;
