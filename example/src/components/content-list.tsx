import React from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import EmptyState from './empty-state';
import Loader from './loader';

interface IContentListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

function ContentList<T>({
  data,
  renderItem,
  keyExtractor,
  emptyMessage,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
}: IContentListProps<T>): JSX.Element {
  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      {data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        data.map((item, index) => <View key={keyExtractor(item)}>{renderItem(item, index)}</View>)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 8,
  },
});

export default ContentList;
