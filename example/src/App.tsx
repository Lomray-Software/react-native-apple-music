import React from 'react';
import {View, Text, StyleSheet, Button, Image} from 'react-native';
import {NativeModules} from 'react-native';
import AppleMusic, {useIsPlaying, useCurrentSong} from 'react-native-apple-music';
import ICatalogSearchType from '../../src/types/catalog-search-type';

const {MusicModule} = NativeModules;

const App = props => {
  const isPlaying = useIsPlaying();
  const currentSong = useCurrentSong();

  const onAuth = () => {
    AppleMusic.Auth.authorize(status => {
      console.log('Authorization status:', status);
    });
  };

  const onCheck = () => {
    AppleMusic.Auth.checkSubscription().then(result => {
      console.log('CHECK RESULT: ', result);
    });
  };

  const onFetch = () => {
    AppleMusic.MusicKit.catalogSearch(
      'Taylor Swift',
      [ICatalogSearchType.SONGS],
      {
        limit: 25,
        offset: 0,
      },
    )
      .then(results => {
        console.log('Search Results:', results);
      })
      .catch(error => {
        console.error('Failed to perform catalog search:', error);
      });
  };

  const onSkip = () => AppleMusic.Player.skipToNextEntry();

  return (
    <View style={styles.container}>
      <Text>App</Text>
      <Button title="Authorize" onPress={onAuth} />
      <Button title="Check Status" onPress={onCheck} />
      <Button title="Fetch" onPress={onFetch} />
      <View style={{marginTop: 16}}>
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={() => MusicModule.togglePlayerState()}
        />
        <Button title="Next" onPress={onSkip} />
      </View>
      <View style={styles.musicContainer}>
        <View
          style={[
            styles.indicator,
            {backgroundColor: isPlaying ? 'green' : 'red'},
          ]}
        />
        {currentSong && (
          <>
            {currentSong.artworkUrl && (
              <>
                <Image
                  style={styles.image}
                  source={{uri: currentSong.artworkUrl}}
                />
              </>
            )}
            <View style={{maxWidth: '80%'}}>
              <Text>{currentSong.title}</Text>
              <Text style={{fontWeight: '700'}}>{currentSong.artistName}</Text>
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
});
