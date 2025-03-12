module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'commonjs',
      },
    ],
  ],
  plugins: [['@babel/plugin-transform-modules-commonjs', { strictMode: true }]],
  // 确保在测试环境中转换所有文件
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: { node: 'current' },
            modules: 'commonjs',
          },
        ],
      ],
      plugins: [['@babel/plugin-transform-modules-commonjs', { strictMode: true }]],
    },
  },
};
