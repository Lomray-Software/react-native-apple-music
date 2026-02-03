import {
  Player,
  useCurrentSong,
  useIsPlaying,
  usePlaybackState,
} from '@lomray/react-native-apple-music';
import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import ProgressBar from '../components/progress-bar';
import { formatTime } from '../utils/format-time';

const RESTART_THRESHOLD_SECONDS = 3;

const Artwork = React.memo<{ artworkUrl?: string }>(({ artworkUrl }) => {
  if (artworkUrl) {
    return <Image source={{ uri: artworkUrl }} style={styles.artwork} />;
  }

  return (
    <View style={[styles.artwork, styles.placeholderArtwork]}>
      <Text style={styles.placeholderText}>No Track</Text>
    </View>
  );
});

const TrackInfo = React.memo<{ title?: string; artistName?: string }>(({ title, artistName }) => (
  <View style={styles.trackInfo}>
    <Text style={styles.title} numberOfLines={1}>
      {title ?? 'Not Playing'}
    </Text>
    <Text style={styles.artist} numberOfLines={1}>
      {artistName ?? 'Select a track to play'}
    </Text>
  </View>
));

const Controls = React.memo<{
  isPlaying: boolean;
  onPrevious: () => void;
  onPlayPause: () => void;
  onNext: () => void;
}>(({ isPlaying, onPrevious, onPlayPause, onNext }) => (
  <View style={styles.controls}>
    <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
      <Text style={styles.controlText}>Prev</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
      <Text style={styles.playText}>{isPlaying ? 'Pause' : 'Play'}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onNext} style={styles.controlButton}>
      <Text style={styles.controlText}>Next</Text>
    </TouchableOpacity>
  </View>
));

const TimeDisplay = React.memo<{ currentTime: number; duration: number }>(
  ({ currentTime, duration }) => (
    <View style={styles.timeContainer}>
      <Text style={styles.time}>{formatTime(currentTime)}</Text>
      <Text style={styles.time}>{formatTime(duration)}</Text>
    </View>
  ),
);

const NowPlayingScreen: React.FC = () => {
  const { song } = useCurrentSong();
  const { isPlaying } = useIsPlaying();
  const { playbackTime } = usePlaybackState();

  const duration = useMemo(() => Number(song?.duration ?? 0) || 0, [song?.duration]);
  const currentTime = playbackTime ?? 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  const handlePrevious = useCallback(() => {
    void Player.getCurrentState().then((state) => {
      if ((state.playbackTime ?? 0) > RESTART_THRESHOLD_SECONDS) {
        Player.restartCurrentEntry();
      } else {
        Player.skipToPreviousEntry();
      }
    });
  }, []);

  const handlePlayPause = useCallback(() => {
    Player.togglePlayerState();
  }, []);

  const handleNext = useCallback(() => {
    Player.skipToNextEntry();
  }, []);

  const handleSeek = useCallback(
    (value: number) => {
      Player.seekToTime(Math.max(0, Math.min(value * duration, duration)));
    },
    [duration],
  );

  return (
    <View style={styles.container}>
      <View style={styles.artworkContainer}>
        <Artwork artworkUrl={song?.artworkUrl} />
      </View>

      <TrackInfo title={song?.title} artistName={song?.artistName} />

      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} onSeek={handleSeek} />
        <TimeDisplay currentTime={currentTime} duration={duration} />
      </View>

      <Controls
        isPlaying={isPlaying}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 12,
  },
  placeholderArtwork: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999999',
    fontSize: 16,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: '#666666',
  },
  progressContainer: {
    marginBottom: 32,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: {
    fontSize: 12,
    color: '#999999',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  controlButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  playButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
  },
  playText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default NowPlayingScreen;
