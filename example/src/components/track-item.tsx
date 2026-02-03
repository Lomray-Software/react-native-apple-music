import {
  isLibraryItem,
  type ISong,
  MusicItem,
  MusicKit,
  Player,
} from '@lomray/react-native-apple-music';
import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatTime } from '../utils/format-time';

interface ITrackItemProps {
  track: ISong;
  showPlayButton?: boolean;
  playlistId?: string;
  trackIndex?: number;
}

const TrackItem: React.FC<ITrackItemProps> = ({
  track,
  showPlayButton = false,
  playlistId,
  trackIndex,
}) => {
  const handlePlay = useCallback(async () => {
    try {
      // If we have playlist context, play the playlist starting from this track
      if (playlistId !== undefined && trackIndex !== undefined) {
        await MusicKit.playLibraryPlaylist(playlistId, trackIndex);
      } else if (isLibraryItem(track?.id)) {
        await MusicKit.playLibrarySong(track.id);
      } else {
        await MusicKit.setPlaybackQueue(track.id, MusicItem.SONG);
      }

      Player.play();
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  }, [track.id, playlistId, trackIndex]);

  const renderArtwork = () => {
    if (track.artworkUrl) {
      return <Image source={{ uri: track.artworkUrl }} style={styles.artwork} />;
    }

    return <View style={[styles.artwork, styles.placeholderArtwork]} />;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={showPlayButton ? () => void handlePlay() : undefined}
      activeOpacity={showPlayButton ? 0.7 : 1}
    >
      {renderArtwork()}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artistName}
        </Text>
      </View>
      <Text style={styles.duration}>{formatTime(Number(track.duration))}</Text>
      {showPlayButton && (
        <TouchableOpacity style={styles.playButton} onPress={() => void handlePlay()}>
          <Text style={styles.playIcon}>▶</Text>
        </TouchableOpacity>
      )}
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
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  placeholderArtwork: {
    backgroundColor: '#E5E5E5',
  },
  info: {
    flex: 1,
    marginRight: 12,
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
  },
  duration: {
    fontSize: 13,
    color: '#999999',
    marginRight: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 2,
  },
});

export default TrackItem;
