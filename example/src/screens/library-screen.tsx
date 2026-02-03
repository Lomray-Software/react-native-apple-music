import { MusicKit, type IPlaylist, type ISong } from '@lomray/react-native-apple-music';
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import ContentList from '../components/content-list';
import PlaylistItem from '../components/playlist-item';
import ScreenHeader from '../components/screen-header';
import TabBar from '../components/tab-bar';
import TrackItem from '../components/track-item';

type LibraryTab = 'playlists' | 'songs';

const LIBRARY_TABS: { key: LibraryTab; label: string }[] = [
  { key: 'playlists', label: 'Playlists' },
  { key: 'songs', label: 'Songs' },
];

const LibraryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('playlists');
  const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
  const [songs, setSongs] = useState<ISong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<IPlaylist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<ISong[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [playlistsRes, songsRes] = await Promise.all([
        MusicKit.getUserPlaylists({ limit: 50 }),
        MusicKit.getLibrarySongs({ limit: 50 }),
      ]);

      setPlaylists(playlistsRes.playlists as IPlaylist[]);
      setSongs(songsRes.songs as ISong[]);
    } catch (error) {
      console.error('Failed to fetch library:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlaylistSongs = useCallback(async (playlistId: string) => {
    setIsLoading(true);

    try {
      const response = await MusicKit.getPlaylistSongs(playlistId);

      setPlaylistSongs(response.songs as ISong[]);
    } catch (error) {
      console.error('Failed to fetch playlist songs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    if (selectedPlaylist) {
      await fetchPlaylistSongs(String(selectedPlaylist.id));
    } else {
      await fetchData();
    }

    setIsRefreshing(false);
  }, [fetchData, selectedPlaylist, fetchPlaylistSongs]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handlePlaylistPress = useCallback(
    (playlist: IPlaylist) => {
      setSelectedPlaylist(playlist);
      void fetchPlaylistSongs(String(playlist.id));
    },
    [fetchPlaylistSongs],
  );

  if (selectedPlaylist) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title={selectedPlaylist.name}
          onBackPress={() => {
            setSelectedPlaylist(null);
            setPlaylistSongs([]);
          }}
        />
        <ContentList
          data={playlistSongs}
          keyExtractor={(item) => item.id}
          emptyMessage="No songs in this playlist"
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          renderItem={(item, index) => (
            <TrackItem
              track={item}
              showPlayButton
              playlistId={String(selectedPlaylist.id)}
              trackIndex={index}
            />
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabBar tabs={LIBRARY_TABS} activeTab={activeTab} onTabPress={(tab) => setActiveTab(tab)} />

      {activeTab === 'playlists' ? (
        <ContentList
          data={playlists}
          keyExtractor={(item) => item.id}
          emptyMessage="No playlists found"
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          renderItem={(item) => (
            <PlaylistItem playlist={item} onPress={() => handlePlaylistPress(item)} />
          )}
        />
      ) : (
        <ContentList
          data={songs}
          keyExtractor={(item) => item.id}
          emptyMessage="No songs found"
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          renderItem={(item) => <TrackItem track={item} showPlayButton />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default LibraryScreen;
