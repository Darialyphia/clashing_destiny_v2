module.exports = {
  root: true,
  extends: ['daria/vue'],
  rules: {
    '@typescript-eslint/no-floating-promises': 'error'
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  overrides: [
    {
      files: ['__test__/**/*.ts'],
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: __dirname
      },
      rules: {
        'import/default': 'off',
        'import/named': 'off'
      }
    }
  ]
};
