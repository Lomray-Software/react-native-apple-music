const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');
const modules = Object.keys({
  ...pak.peerDependencies,
});

const defaultConfig = getDefaultConfig(__dirname);
const {
  resolver: { sourceExts, assetExts },
} = defaultConfig;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Resolve peer deps (react, react-native) from the monorepo root node_modules
 * so the library and example use the same React Native instance
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(root, 'node_modules', name);

      return acc;
    }, {}),
  },
  watchFolders: [root],
};

module.exports = mergeConfig(defaultConfig, config);
