export type { IPlaybackState } from './types/playback-state';

export type { ISong } from './types/song';

export type { default as PlaybackStatus } from './types/playback-status';

export { default as CatalogSearchType } from './types/catalog-search-type';

import { useCurrentSong, useIsPlaying } from './hooks';
import Auth from './modules/auth';
import MusicKit from './modules/music-kit';
import Player from './modules/player';

export { useCurrentSong, useIsPlaying };

export default { Auth, Player, MusicKit };
