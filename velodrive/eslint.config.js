import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // Folder dan file yang tidak perlu diperiksa
  {
    ignores: [
      'dist/**',
      'coverage/**',
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
      ...js.configs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,

      // Aturan custom diletakkan di bawah agar tidak tertimpa bawaan
      'no-unused-vars': ['warn', { varsIgnorePattern: '^(React|_.*)$' }],
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