import type { ISong } from './song';

export interface IPlaylist {
  id: string;
  name: string;
  description: string;
  artworkUrl: string;
  trackCount: number;
}

export interface IPlaylistsResponse {
  playlists: IPlaylist[];
}

export interface IPlaylistSongsResponse {
  songs: ISong[];
}
