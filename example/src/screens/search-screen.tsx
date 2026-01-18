import {
  MusicKit,
  CatalogSearchType,
  type ISong,
  type IAlbum,
} from '@lomray/react-native-apple-music';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import AlbumItem from '../components/album-item';
import EmptyState from '../components/empty-state';
import Loader from '../components/loader';
import TabBar from '../components/tab-bar';
import TrackItem from '../components/track-item';

type SearchTab = 'songs' | 'albums';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('songs');
  const [songs, setSongs] = useState<ISong[]>([]);
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await MusicKit.catalogSearch(
        query,
        [CatalogSearchType.SONGS, CatalogSearchType.ALBUMS],
        { limit: 25 },
      );

      if (response) {
        setSongs((response.songs ?? []) as ISong[]);
        setAlbums((response.albums ?? []) as IAlbum[]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const searchTabs: { key: SearchTab; label: string }[] = [
    { key: 'songs', label: `Songs (${songs.length})` },
    { key: 'albums', label: `Albums (${albums.length})` },
  ];

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (!hasSearched) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Search for songs and albums in Apple Music</Text>
        </View>
      );
    }

    if (activeTab === 'songs') {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        >
          {songs.length === 0 ? (
            <EmptyState message="No songs found" />
          ) : (
            songs.map((item) => <TrackItem key={item.id} track={item} showPlayButton />)
          )}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      >
        {albums.length === 0 ? (
          <EmptyState message="No albums found" />
        ) : (
          albums.map((item) => <AlbumItem key={item.id} album={item} />)
        )}
      </ScrollView>
    );
  };

  const isSearchDisabled = !searchQuery.trim();

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, albums..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => void handleSearch()}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => void handleSearch()}
          disabled={isSearchDisabled}
        >
          <Text style={[styles.searchButtonText, isSearchDisabled && styles.searchButtonDisabled]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {hasSearched && (
        <TabBar tabs={searchTabs} activeTab={activeTab} onTabPress={(tab) => setActiveTab(tab)} />
      )}

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000000',
  },
  searchButton: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonDisabled: {
    color: '#CCCCCC',
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 16,
  },
});

export default SearchScreen;
