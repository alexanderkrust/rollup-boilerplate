/* eslint-disable import/no-default-export */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';
import alias from '@rollup/plugin-alias';
import url from 'rollup-plugin-url';
import copy from 'rollup-plugin-copy';
import * as pkg from './package.json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;

const styledComponentsTransformer = createStyledComponentsTransformer();

const externals = [...Object.keys(pkg.peerDependencies), 'tslib'].concat(
  Object.keys(pkg.dependencies),
);

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
        sourcemap: true,
        exports: 'named',
      },
      {
        dir: 'dist',
        format: 'esm',
        chunkFileNames: '[name].esm.js',
        entryFileNames: '[name].esm.js',
        sourcemap: true,
        exports: 'named',
      },
    ],
    preserveModules: true,
    plugins: [
      del({
        targets: ['dist/*'],
        force: true,
      }),
      alias({
        applicationRoot: `${__dirname}/src`,
        entries: [
          { find: '@atoms', replacement: 'atoms' },
          { find: '@molecules', replacement: 'molecules' },
          { find: '@organisms', replacement: 'organisms' },
        ],
      }),
      excludeDependenciesFromBundle(),
      resolve(),
      commonjs(),
      typescript({
        // eslint-disable-next-line global-require
        tsconfig: 'tsconfig.bundle.json',
        typescript: require('ttypescript'),
        tsconfigDefaults: {
          compilerOptions: {
            plugins: [
              { transform: 'typescript-transform-paths' },
              { transform: 'typescript-transform-paths', afterDeclarations: true },
            ],
          },
        },
        useTsconfigDeclarationDir: true,
        transformers: [
          () => ({
            before: [styledComponentsTransformer],
          }),
        ],
      }),
      url({
        include: ['**/*.woff', '**/*.woff2'],
        limit: Infinity,
      }),
      copy({
        targets: [
          { src: 'src/**/*.graphql', dest: 'dist/graphql' },
          { src: 'src/@types', dest: 'dist/' },
        ],
      }),
    ],
    external: externals,
  },
];
