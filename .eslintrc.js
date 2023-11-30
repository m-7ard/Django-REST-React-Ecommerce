module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: 'airbnb',
    overrides: [
        {
            env: {
                node: true,
            },
            files: ['.eslintrc.{js,cjs}'],
            parserOptions: {
                sourceType: 'script',
            },
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        indent: ['error', 4],
        'brace-style': ['error', 'stroustrup'],
        'linebreak-style': ['error', 'windows'],
        'react/jsx-filename-extension': [0],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
    },
};
