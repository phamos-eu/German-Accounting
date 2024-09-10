/* eslint-env node */

/** @type {import("eslint/lib/cli-engine/cli-engine")} */
module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/eslint-recommended", "plugin:canonical/recommended", "prettier"],
    ignorePatterns: ["**/*.min.js", "**/*.d.ts", "**/*.ts", "**/*.vue"],
    parserOptions: {
        ecmaVersion: "latest",
        files: ["*.js", "*.ts", "*.d.ts"],
        parser: "@typescript-eslint/parser",
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "canonical"],
    root: true,
    rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "canonical/destructuring-property-newline": "off",
        "canonical/export-specifier-newline": "off",
        "canonical/id-match": "off",
        "canonical/import-specifier-newline": "off",
        "canonical/sort-keys": "warn",
        "no-console": "warn",
        "no-debugger": "warn",
        "no-undef": "off",
        "no-unused-vars": "off",
        "sort-imports": [
            "warn",
            {
                allowSeparatedGroups: false,
                ignoreCase: false,
                ignoreDeclarationSort: true,
                ignoreMemberSort: false,
                memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
            },
        ],
    },
};
