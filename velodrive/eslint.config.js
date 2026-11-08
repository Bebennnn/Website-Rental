import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // Folder dan file yang tidak perlu diperiksa
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'backend/node_modules/**',
    ],
  },

  // Konfigurasi utama JavaScript dan React
  {
    files: ['**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^React$' }],
      ...js.configs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,

      'no-useless-assignment': 'error',

      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
    },
  },

  // Global khusus pengujian backend menggunakan Jest
  {
    files: ['backend/tests/**/*.js'],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
];