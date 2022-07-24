module.exports = {
  env: {
    commonjs: {
      presets: [
        [
          '@babel/preset-env',
          {
            debug: false,
            modules: 'commonjs',
            corejs: { version: 3 },
            targets: {
              node: '14',
            },
            forceAllTransforms: false,
          },
        ],
      ],
      plugins: [
        [
          '@babel/plugin-transform-modules-commonjs',
          {
            loose: true,
          },
        ],
        '@babel/proposal-class-properties',
        '@babel/proposal-object-rest-spread',
      ],
    },
    es: {
      presets: [
        [
          '@babel/preset-env',
          {
            debug: false,
            modules: false,
            corejs: { version: 3 },
          },
        ],
      ],
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            absoluteRuntime: false,
            corejs: 3,
            version: '7.18.6'
          },
        ],
        '@babel/proposal-class-properties',
        '@babel/proposal-object-rest-spread',
      ],
    },
    browser: {
      sourceType: 'unambiguous', // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
      presets: [
        [
          '@babel/preset-env',
          {
            debug: false,
            corejs: { version: 3 },
            useBuiltIns: 'usage'
          },
        ],
      ],
      plugins: [
        // throws _includesInstanceProperty is not a function
        // [
        //   '@babel/plugin-transform-runtime',
        //   {
        //     corejs: 3,
        //     version: '7.18.6'
        //   },
        // ],
        '@babel/proposal-class-properties',
        '@babel/proposal-object-rest-spread',
      ],
    },
  },
};
