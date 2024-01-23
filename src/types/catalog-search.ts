import type { IAlbum } from './album';
import type { ISong } from './song';

export enum CatalogSearchType {
  SONGS = 'songs',
  ALBUMS = 'albums',
}

export interface ICatalogSearch {
  songs: ISong[];
  albums: IAlbum[];
}
