import react from "@vitejs/plugin-react";
import builtins from "builtin-modules";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		react(),
		// Only include the copy plugin when ENABLE_DEV_VAULT_COPY is set
		...(process.env.ENABLE_DEV_VAULT_COPY === "true"
			? [
					{
						name: "copy-to-obsidian-vault",
						closeBundle() {
							const devVaultPath = path.resolve(
								__dirname,
								"dev-vault/.obsidian/plugins/taskui-plugin",
							);
							const buildPath = path.resolve(__dirname, "build/taskui-plugin");

							// Copy manifest to build directory
							copyFileSync(
								"manifest.json",
								path.join(buildPath, "manifest.json"),
							);

							// Copy to dev vault if it exists
							if (existsSync(path.resolve(__dirname, "dev-vault"))) {
								// Ensure the plugin directory exists
								if (!existsSync(devVaultPath)) {
									mkdirSync(devVaultPath, { recursive: true });
								}

								// Copy files
								const filesToCopy = ["main.js", "styles.css", "manifest.json"];
								filesToCopy.forEach((file) => {
									const src = path.join(buildPath, file);
									const dest = path.join(devVaultPath, file);
									if (existsSync(src)) {
										copyFileSync(src, dest);
										console.log(`✓ Copied ${file} to dev vault`);
									}
								});

								// Create .hotreload file for hot-reload plugin
								const hotreloadFile = path.join(devVaultPath, ".hotreload");
								if (!existsSync(hotreloadFile)) {
									writeFileSync(hotreloadFile, "");
									console.log("✓ Created .hotreload file");
								}
							}
						},
					},
				]
			: [
					// Always copy manifest to build directory, even without dev vault copy
					{
						name: "copy-manifest",
						closeBundle() {
							const buildPath = path.resolve(__dirname, "build/taskui-plugin");
							copyFileSync(
								"manifest.json",
								path.join(buildPath, "manifest.json"),
							);
						},
					},
				]),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/main.ts"),
			name: "ShardsTaskUI",
			fileName: () => "main.js",
			formats: ["cjs"],
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
					return assetInfo.name || "asset";
				},
			},
		},
		outDir: "build/taskui-plugin",
		emptyOutDir: false,
		sourcemap: process.env.NODE_ENV === "development" ? "inline" : false,
		minify: process.env.NODE_ENV === "production",
	},
	css: {
		postcss: "./postcss.config.cjs",
	},
});
