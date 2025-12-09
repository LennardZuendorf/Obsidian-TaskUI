import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import builtins from "builtin-modules";
import { resolve } from "path";
import { copyFileSync } from "fs";

export default defineConfig(({ mode }) => {
	const isProd = mode === "production";

	return {
		plugins: [
			react(),
			{
				name: "copy-manifest",
				closeBundle() {
					copyFileSync(
						"manifest.json",
						"build/taskui-plugin/manifest.json",
					);
				},
			},
		],
		resolve: {
			alias: {
				"@": resolve(__dirname, "./src/ui"),
			},
		},
		css: {
			postcss: "./postcss.config.cjs",
		},
		build: {
			lib: {
				entry: resolve(__dirname, "src/main.ts"),
				formats: ["cjs"],
				fileName: () => "main.js",
			},
			rollupOptions: {
				external: [
					"obsidian",
					"electron",
					"@codemirror/autocomplete",
					"@codemirror/collab",
					"@codemirror/commands",
					"@codemirror/language",
					"@codemirror/lint",
					"@codemirror/search",
					"@codemirror/state",
					"@codemirror/view",
					"@lezer/common",
					"@lezer/highlight",
					"@lezer/lr",
					...builtins,
				],
			output: {
				entryFileNames: "main.js",
				assetFileNames: (assetInfo) => {
					// Rename any CSS file to styles.css
					if (assetInfo.name?.endsWith(".css")) return "styles.css";
					return assetInfo.name || "assets/[name][extname]";
				},
				exports: "default",
			},
			},
			cssCodeSplit: false,
			outDir: "build/taskui-plugin",
			emptyOutDir: false,
			sourcemap: !isProd ? "inline" : false,
			minify: isProd,
		},
	};
});

