const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
    configure: (webpackConfig, { env, paths }) => {
      // Only add bundle analyzer in production build when explicitly requested
      if (env === 'production' && process.env.ANALYZE) {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-report.html',
          })
        );
      }

      // Add compression plugin for production builds
      if (env === 'production') {
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240, // Only compress files > 10kb
            minRatio: 0.8,
          })
        );
      }

      // Split chunks optimization
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          name: false,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Get the name of the npm package
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                // Return a readable name for the package
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              test: /[\\/]src[\\/]components[\\/]/,
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };

      return webpackConfig;
    },
  },
  // Add Jest configuration for testing
  jest: {
    configure: {
      moduleNameMapper: {
        '^@components(.*)$': '<rootDir>/src/components$1',
        '^@context(.*)$': '<rootDir>/src/context$1',
        '^@hooks(.*)$': '<rootDir>/src/hooks$1',
        '^@services(.*)$': '<rootDir>/src/services$1',
        '^@utils(.*)$': '<rootDir>/src/utils$1',
      },
    },
  },
};
