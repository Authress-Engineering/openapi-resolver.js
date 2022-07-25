import path from 'path';
import webpack from 'webpack';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import { DuplicatesPlugin } from 'inspectpack/plugin';
import { WebpackBundleSizeAnalyzerPlugin } from 'webpack-bundle-size-analyzer';
import TerserPlugin from 'terser-webpack-plugin';
import { cloneDeep } from 'lodash';

const module = {
  rules: [
    {
      test: /\.js$/,
      // exclude: /node_modules\//,
      use: {
        loader: 'babel-loader',
      },
    },
  ],
};

const browser = {
  mode: 'production',
  entry: {
    main: './src/index.js',
  },
  target: 'web',
  performance: {
    hints: false,
  },
  output: {
    path: path.resolve('./dist'),
    filename: 'openapi-resolver.browser.js',
    library: {
      name: 'OpenApiResolver',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.json'],
    fallback: {
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      buffer: require.resolve('buffer'),
    },
  },
  module,
  plugins: [
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    new webpack.ProvidePlugin({ process: 'process/browser' }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
    new DuplicatesPlugin({
      // emit compilation warning or error? (Default: `false`)
      emitErrors: true,
      // display full duplicates information? (Default: `false`)
      verbose: true,
    }),
    new WebpackBundleSizeAnalyzerPlugin('openapi-resolver.browser-sizes.txt'),
    new StatsWriterPlugin({
      filename: path.join('openapi-resolver.browser-stats.json'),
      fields: null,
    }),
  ],
  optimization: {
    minimize: false,
    usedExports: false,
    concatenateModules: false,
  },
};

const browserMin = cloneDeep(browser);
browserMin.devtool = 'source-map';
browserMin.performance = {
  hints: 'error',
  maxEntrypointSize: 270000,
  maxAssetSize: 1300000,
};
browserMin.output.filename = 'openapi-resolver.browser.min.js';
browserMin.plugins = [
  new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
  new webpack.ProvidePlugin({ process: 'process/browser' }),
  new webpack.LoaderOptionsPlugin({
    minimize: true,
  }),
];

browserMin.optimization = {
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          warnings: false,
        },
        output: {
          comments: false,
        },
      },
    }),
  ],
};

export default [browser, browserMin];
