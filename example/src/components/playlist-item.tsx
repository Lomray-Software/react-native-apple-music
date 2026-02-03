import { type IPlaylist } from '@lomray/react-native-apple-music';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface IPlaylistItemProps {
  playlist: IPlaylist;
  onPress: () => void;
}

const PlaylistItem: React.FC<IPlaylistItemProps> = ({ playlist, onPress }) => {
  const trackLabel = playlist.trackCount === 1 ? 'track' : 'tracks';

  const renderArtwork = () => {
    if (playlist.artworkUrl) {
      return <Image source={{ uri: playlist.artworkUrl }} style={styles.artwork} />;
    }

    return (
      <View style={[styles.artwork, styles.placeholderArtwork]}>
        <Text style={styles.placeholderIcon}>🎵</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {renderArtwork()}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {playlist.name}
        </Text>
        <Text style={styles.trackCount}>
          {playlist.trackCount} {trackLabel}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 6,
    marginRight: 12,
  },
  placeholderArtwork: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  trackCount: {
    fontSize: 13,
    color: '#666666',
  },
  chevron: {
    fontSize: 24,
    color: '#CCCCCC',
    marginLeft: 8,
  },
});

export default PlaylistItem;
