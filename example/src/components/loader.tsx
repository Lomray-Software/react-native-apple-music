import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface ILoaderProps {
  color?: string;
}

const Loader: React.FC<ILoaderProps> = ({ color = '#007AFF' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loader;
