import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: ["**/node_modules/", "**/main.js"],
	},
	// Spread the base linting configurations
	...compat.extends(
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
	),
	// Project-specific configurations
	{
		files: ["src/**/*.js", "src/**/*.ts", "src/**/*.tsx", "src/**/*.mjs"],
		plugins: {
			"@typescript-eslint": typescriptEslint,
		},
		languageOptions: {
			globals: {
				...globals.node,
			},
			parser: tsParser,
			ecmaVersion: 5,
			sourceType: "module",
		},
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					args: "none",
				},
			],
			"@typescript-eslint/ban-ts-comment": "off",
			"no-prototype-builtins": "off",
			"@typescript-eslint/no-empty-function": "off",
		},
	},
	// Spread Prettier configuration last to override styles
	...compat.extends("prettier"),
];
