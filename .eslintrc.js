module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'import'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        // Module Boundary Enforcement
        'import/no-restricted-paths': [
            'error',
            {
                zones: [
                    // 1. Common cannot import from specific modules (Upward Dependency Ban)
                    {
                        target: './src/common',
                        from: './src/orders',
                        message: 'Common module cannot import from Domain modules (Orders).',
                    },
                    // 2. Orders: No Deep Imports into other modules impl details
                    {
                        target: './src/orders',
                        from: './src/transport/!(index.ts)', // Allow only index.ts (Public API)
                        message: 'Orders module can only consume Transport via its Public API (index.ts).',
                    },
                    // 3. Billing: Same rule
                    {
                        target: './src/billing',
                        from: './src/orders/!(index.ts)',
                        message: 'Billing module can only consume Orders via its Public API (index.ts).',
                    },
                    // 4. Transport: No Deep Imports
                    {
                        target: './src/transport',
                        from: './src/orders/!(index.ts)',
                        message: 'Transport module can only consume Orders via its Public API (index.ts).',
                    },
                ],
            },
        ],
    },
};
