import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface IScreenHeaderProps {
  title: string;
  onBackPress?: () => void;
}

const ScreenHeader: React.FC<IScreenHeaderProps> = ({ title, onBackPress }) => (
  <View style={styles.container}>
    <View style={styles.side}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
    <Text style={styles.title} numberOfLines={1}>
      {title}
    </Text>
    <View style={styles.side} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  side: {
    width: 60,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ScreenHeader;
