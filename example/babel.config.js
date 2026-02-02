const path = require('path');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [pak.name]: path.join(root, pak.source),
        },
      },
    ],
  ],
};
