import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import configPlugins from '@expo/config-plugins';
import withReactNativeAppleMusic, { DEFAULT_MUSIC_USAGE } from './app.plugin.js';

const { compileModsAsync } = configPlugins;

const projectRoot = '/tmp/test-app';

const createBaseConfig = () => ({
  name: 'test-app',
  slug: 'test-app',
  _internal: {
    projectRoot,
    isDebug: false,
  },
});

const compileIosInfoPlist = async (config) => {
  const compiled = await compileModsAsync(config, {
    projectRoot,
    platforms: ['ios'],
    introspect: true,
  });

  return compiled.ios?.infoPlist?.NSAppleMusicUsageDescription;
};

describe('withReactNativeAppleMusic', () => {
  it('sets default NSAppleMusicUsageDescription when missing', async () => {
    const description = await compileIosInfoPlist(withReactNativeAppleMusic(createBaseConfig()));

    assert.equal(description, DEFAULT_MUSIC_USAGE);
  });

  it('uses musicUsageDescription when provided', async () => {
    const custom = 'We use Apple Music to import your library.';
    const description = await compileIosInfoPlist(
      withReactNativeAppleMusic(createBaseConfig(), { musicUsageDescription: custom }),
    );

    assert.equal(description, custom);
  });

  it('does not overwrite an existing non-empty value when option is omitted', async () => {
    const existing = 'Existing usage description from app config.';
    const config = withReactNativeAppleMusic({
      ...createBaseConfig(),
      ios: {
        infoPlist: {
          NSAppleMusicUsageDescription: existing,
        },
      },
    });
    const description = await compileIosInfoPlist(config);

    assert.equal(description, existing);
  });

  it('overwrites existing value when musicUsageDescription is provided', async () => {
    const existing = 'Existing usage description from app config.';
    const override = 'Override from plugin option.';
    const config = withReactNativeAppleMusic(
      {
        ...createBaseConfig(),
        ios: {
          infoPlist: {
            NSAppleMusicUsageDescription: existing,
          },
        },
      },
      { musicUsageDescription: override },
    );
    const description = await compileIosInfoPlist(config);

    assert.equal(description, override);
  });
});
