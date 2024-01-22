import type { MusicItem } from './music-item';

export interface IUserTrack {
  id: number;
  title: string;
  subtitle: string;
  type: MusicItem;
}

export interface ITracksFromLibrary {
  recentlyPlayedItems: IUserTrack[];
}
