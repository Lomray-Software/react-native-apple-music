import {
  Auth,
  MusicKit,
  Player,
  useCurrentSong,
  useIsPlaying,
  CatalogSearchType,
} from '@lomray/react-native-apple-music';
import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';

const App = () => {
  const { isPlaying } = useIsPlaying();
  const { song } = useCurrentSong();

  const onAuth = () => {
    Auth.authorize()
      .then((status) => console.log('Authorize:', status))
      .catch(console.error);
  };

  const onCheck = () => {
    Auth.checkSubscription()
      .then((result) => console.log('CheckSubscription: ', result))
      .catch(console.error);
  };

  const onToggle = () => void Player.togglePlayerState();

  const onFetch = () => {
    MusicKit.catalogSearch('Taylor Swift', [CatalogSearchType.SONGS], {
      limit: 25,
      offset: 0,
    })
      .then((results) => {
        console.log('Search Results:', results);
      })
      .catch((error) => {
        console.error('Failed to perform catalog search:', error);
      });
  };

  const onSkip = () => void Player.skipToNextEntry();

  return (
    <View style={styles.container}>
      <Text>App</Text>
      <Button title="Authorize" onPress={onAuth} />
      <Button title="Check Status" onPress={onCheck} />
      <Button title="Fetch" onPress={onFetch} />
      <View style={styles.mt16}>
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={onToggle} />
        <Button title="Next" onPress={onSkip} />
      </View>
      <View style={styles.musicContainer}>
        <View style={[styles.indicator, { backgroundColor: isPlaying ? 'green' : 'red' }]} />
        {song && (
          <>
            {song.artworkUrl && <Image style={styles.image} source={{ uri: song.artworkUrl }} />}
            <View style={styles.content}>
              <Text>{song.title}</Text>
              <Text style={styles.artist}>{song.artistName}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  mt16: {
    marginTop: 16,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  content: {
    maxWidth: '80%',
  },
  artist: {
    fontWeight: '700',
  },
});
