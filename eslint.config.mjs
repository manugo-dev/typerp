import js from "@eslint/js";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { flatConfigs as importXConfig } from "eslint-plugin-import-x";
import sonarjs from "eslint-plugin-sonarjs";
import sort from "eslint-plugin-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";

const defaultTsRules = {
	// typescript-eslint rules
	"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_$|^err$" }],
	// eslint-plugin-import-x rules
	"import-x/newline-after-import": ["error", { count: 1 }],
	"import-x/no-dynamic-require": "warn",
	"import-x/no-unresolved": "off", // Let TS handle this
	// eslint core rules
	"no-unused-vars": "off",
	// eslint-plugin-sort rules
	"sort/imports": [
		"warn",
		{
			groups: [
				{ order: 1, type: "dependency" },
				{ order: 2, regex: "^@/" },
				{ order: 3, regex: "^@typerp/" },
				{ order: 6, regex: String.raw`\.(png|jpe?g|svg|gif|webp)$` },
				{ order: 7, regex: String.raw`\.(scss|css)$` },
				{ order: 4, type: "other" },
			],
			natural: true,
			separator: "\n",
			typeOrder: "first",
		},
	],
	"sort/string-enums": ["error", { caseSensitive: false, natural: true }],
	"sort/string-unions": ["error", { caseSensitive: false, natural: true }],
	"sort/type-properties": ["error", { caseSensitive: false, natural: true }],
	// eslint-plugin-unicorn rules
	"unicorn/filename-case": ["error", { case: "kebabCase", ignore: [/^fxmanifest\.lua$/i] }],
	"unicorn/import-style": ["error", { styles: { "node:path": false } }],
	"unicorn/no-array-reduce": "off",
	"unicorn/no-null": "off",
	"unicorn/no-useless-undefined": ["error", { checkArguments: false }],
	"unicorn/prevent-abbreviations": [
		"error",
		{
			allowList: {
				args: true,
				env: true,
				err: true,
				fn: true,
				lib: true,
				param: false,
				params: false,
				props: true,
				req: true,
				res: true,
				src: true,
			},
			replacements: {
				fn: false,
				param: false,
				params: false,
				props: false,
			},
		},
	],
};

export default defineConfigWithVueTs([
	globalIgnores(["tooling/scripts/*.mjs", "**/dist/**", "**/node_modules/**", "coverage"]),
	sonarjs.configs.recommended,
	importXConfig.recommended,
	importXConfig.typescript,
	eslintPluginUnicorn.configs.recommended,
	sort.configs["flat/recommended"],
	{
		files: ["**/*.{js,cjs,mjs}"],
		languageOptions: {
			ecmaVersion: 2022,
			globals: { ...globals.node },
			sourceType: "module",
		},
	},
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ["packages/**/*.ts"],
		languageOptions: { ecmaVersion: 2022, globals: { ...globals.node } },
		rules: {
			...defaultTsRules,
		},
	},
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ["resources-src/**/*.ts"],
		ignores: ["**/nui/**"],
		languageOptions: { ecmaVersion: 2022, globals: { ...globals.node } },
		rules: {
			...defaultTsRules,
		},
	},
	// NUI / Vue rules (Browser environment)
	...pluginVue.configs["flat/essential"],
	vueTsConfigs.recommended,
	{
		files: ["**/nui/**/*.{ts,vue,js}"],
		languageOptions: {
			ecmaVersion: 2022,
			globals: { ...globals.browser },
			sourceType: "module",
		},
		rules: {
			...defaultTsRules,
			"import-x/no-nodejs-modules": "warn",
		},
	},
	eslintConfigPrettier,
]);
