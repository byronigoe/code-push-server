module.exports = {
    extends: ['@shm-open/eslint-config-bundle'],
    rules: {
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'default',
                format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
                leadingUnderscore: 'allowSingleOrDouble',
            },
            {
                selector: 'variable',
                modifiers: ['destructured'],
                format: null,
            },
            {
                selector: [
                    'classProperty',
                    'objectLiteralProperty',
                    'typeProperty',
                    'classMethod',
                    'objectLiteralMethod',
                    'typeMethod',
                    'accessor',
                    'enumMember',
                ],
                modifiers: ['requiresQuotes'],
                format: null,
            },
            {
                selector: 'enum',
                format: ['PascalCase'],
            },
            {
                selector: 'enumMember',
                format: ['UPPER_CASE'],
            },
            {
                selector: 'variableLike',
                format: ['camelCase', 'PascalCase'],
                leadingUnderscore: 'allow',
            },
            {
                selector: 'variable',
                modifiers: ['const'],
                format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
            {
                selector: 'objectLiteralProperty',
                format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'],
            },
        ],
    },
};
