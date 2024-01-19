export type { IPlaybackState } from './types/playback-state';

export * from './types/song';

export * from './types/playback-status';

export * from './types/catalog-search-type';

export * from './types/auth-status';

export * from './types/check-subscription';

import useCurrentSong from './hooks/use-current-song';
import useIsPlaying from './hooks/use-is-playing';
import Auth from './modules/auth';
import MusicKit from './modules/music-kit';
import Player from './modules/player';

export { useCurrentSong, useIsPlaying, Auth, Player, MusicKit };
