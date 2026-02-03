import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ITab<T extends string> {
  key: T;
  label: string;
}

interface ITabBarProps<T extends string> {
  tabs: ITab<T>[];
  activeTab: T;
  onTabPress: (tab: T) => void;
}

function TabBar<T extends string>({ tabs, activeTab, onTabPress }: ITabBarProps<T>): JSX.Element {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabPress(tab.key)}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    color: '#666666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default TabBar;
