module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
    'react-native/no-inline-styles': 'off',
    'no-console': 'warn',
  },
};
