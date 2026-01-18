import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface IEmptyStateProps {
  message: string;
}

const EmptyState: React.FC<IEmptyStateProps> = ({ message }) => (
  <Text style={styles.text}>{message}</Text>
);

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 40,
    fontSize: 16,
  },
});

export default EmptyState;
