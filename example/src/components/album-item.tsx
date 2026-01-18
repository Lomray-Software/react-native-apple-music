import { MusicKit, Player, type IAlbum, MusicItem } from '@lomray/react-native-apple-music';
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface IAlbumItemProps {
  album: IAlbum;
}

const AlbumItem: React.FC<IAlbumItemProps> = ({ album }) => {
  const handlePlay = useCallback(async () => {
    try {
      await MusicKit.setPlaybackQueue(album.id, MusicItem.ALBUM);

      Player.play();
    } catch (error) {
      console.error('Failed to play album:', error);
    }
  }, [album.id]);

  const renderArtwork = () => {
    if (album.artworkUrl) {
      return <Image source={{ uri: album.artworkUrl }} style={styles.artwork} />;
    }

    return (
      <View style={[styles.artwork, styles.placeholderArtwork]}>
        <Text style={styles.placeholderIcon}>💿</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => void handlePlay()}
      activeOpacity={0.7}
    >
      {renderArtwork()}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {album.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {album.artistName}
        </Text>
        <Text style={styles.trackCount}>{album.trackCount} tracks</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={() => void handlePlay()}>
        <Text style={styles.playIcon}>▶</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  artwork: {
    width: 64,
    height: 64,
    borderRadius: 6,
    marginRight: 12,
  },
  placeholderArtwork: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  artist: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  trackCount: {
    fontSize: 12,
    color: '#999999',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 2,
  },
});

export default AlbumItem;
