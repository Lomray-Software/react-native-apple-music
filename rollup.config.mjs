import typescript from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import { folderInput } from 'rollup-plugin-folder-input';
import copy from 'rollup-plugin-copy';

export default {
  input: [
    'src/**/*.ts*',
  ],
  output: {
    dir: 'lib',
    format: 'es',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'auto',
  },
  external: [
    'react',
    'react-native',
  ],
  plugins: [
    folderInput(),
    typescript({
      tsconfig: resolvedConfig => ({
        ...resolvedConfig,
        declaration: true,
        importHelpers: true,
        plugins: [
          {
            "transform": "@zerollup/ts-transform-paths",
            "exclude": ["*"]
          }
        ]
      }),
    }),
    json(),
    copy({
      targets: [
        { src: 'ios/**/*', dest: 'lib/ios' },
        { src: 'package.json', dest: 'lib' },
        { src: 'README.md', dest: 'lib' },
        { src: 'RNAppleMusic.podspec', dest: 'lib'},
      ]
    })
  ],
};
