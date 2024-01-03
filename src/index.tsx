export type { default as PlaybackState } from './types/playback-state';

export type { default as Song } from './types/song';

export type { default as PlaybackStatus } from './types/playback-status';

export { default as CatalogSearchType } from './types/catalog-search-type';

import Auth from './modules/auth';
import MusicKit from './modules/music-kit';
import Player from './modules/player';

export default { Auth, Player, MusicKit };
