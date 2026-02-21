import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import feedicFlatConfig from "@feedic/eslint-config";
import { commonTypeScriptRules } from "@feedic/eslint-config/typescript";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig([
    includeIgnoreFile(gitignorePath),
    {
        ignores: ["eslint.config.{js,cjs,mjs}"],
    },
    ...feedicFlatConfig,
    {
        files: ["**/*.ts"],
        extends: [...tseslint.configs.recommended],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                sourceType: "module",
                project: "./tsconfig.eslint.json",
            },
        },
        rules: {
            ...commonTypeScriptRules,
            "@typescript-eslint/no-unused-vars": 0,
        },
    },
    {
        files: ["**/*.spec.*"],
        languageOptions: {
            globals: globals.jest,
        },
        rules: {
            "unicorn/no-array-for-each": 0,
        },
    },
    eslintConfigPrettier,
]);
