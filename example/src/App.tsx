import { Auth } from '@lomray/react-native-apple-music';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import LibraryScreen from './screens/library-screen';
import NowPlayingScreen from './screens/now-playing-screen';
import SearchScreen from './screens/search-screen';

type TabType = 'nowPlaying' | 'library' | 'search';

const AuthScreen: React.FC<{ onAuthorized: () => void }> = ({ onAuthorized }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthorize = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const status = await Auth.authorize();

      if (status === 'authorized') {
        const subscription = await Auth.checkSubscription();

        if (subscription.canPlayCatalogContent) {
          onAuthorized();
        } else {
          setError('Apple Music subscription required');
        }
      } else {
        setError(`Authorization ${String(status)}`);
      }
    } catch (err) {
      setError('Authorization failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>Apple Music</Text>
      <Text style={styles.authSubtitle}>Authorize to access your library and play music</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={styles.authButton}
        onPress={() => void handleAuthorize()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.authButtonText}>Authorize</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const TabBar: React.FC<{ activeTab: TabType; onTabPress: (tab: TabType) => void }> = ({
  activeTab,
  onTabPress,
}) => {
  const tabs: { key: TabType; label: string }[] = [
    { key: 'nowPlaying', label: 'Now Playing' },
    { key: 'library', label: 'Library' },
    { key: 'search', label: 'Search' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
          onPress={() => onTabPress(tab.key)}
        >
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('nowPlaying');

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const status = await Auth.authorize();

        if (status === 'authorized') {
          const subscription = await Auth.checkSubscription();

          if (subscription.canPlayCatalogContent) {
            setIsAuthorized(true);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    void checkAuthorization();
  }, []);

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthorized) {
    return <AuthScreen onAuthorized={() => setIsAuthorized(true)} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'nowPlaying':
        return <NowPlayingScreen />;
      case 'library':
        return <LibraryScreen />;
      case 'search':
        return <SearchScreen />;
      default:
        return <NowPlayingScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default App;
