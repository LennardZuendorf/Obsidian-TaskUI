import react from "@vitejs/plugin-react";
import builtins from "builtin-modules";
import { execSync } from "child_process";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
	const isDevMode = mode === "development";
	const buildDir = isDevMode ? "build/shards-dev" : "build/shards";

	return {
		plugins: [
			react(),
			// File copy and version bump plugin
			{
				name: "copy-and-version",
				closeBundle() {
					// Always copy files first
					try {
						execSync(`tsx ./build/copy-files.ts ${mode}`, {
							stdio: "inherit",
							cwd: __dirname,
						});
					} catch (error) {
						console.error("File copy failed:", error);
						throw error;
					}

					// In production mode, also bump version
					if (!isDevMode) {
						const versionType = process.env.VERSION_TYPE || "patch";
						const flag =
							versionType === "major"
								? "--major"
								: versionType === "minor"
									? "--minor"
									: "--patch";

						try {
							execSync(`tsx ./build/version-bump.ts ${flag}`, {
								stdio: "inherit",
								cwd: __dirname,
							});

							// Copy updated manifest after version bump
							execSync(`tsx ./build/copy-files.ts ${mode}`, {
								stdio: "inherit",
								cwd: __dirname,
							});
						} catch (error) {
							console.error("Version bump failed:", error);
							throw error;
						}
					}
				},
			},
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		build: {
			lib: {
				entry: path.resolve(__dirname, "src/main.ts"),
				name: "Shards",
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
			outDir: buildDir,
			emptyOutDir: false,
			sourcemap: isDevMode ? "inline" : false,
			minify: !isDevMode,
		},
		css: {
			postcss: "./postcss.config.cjs",
		},
	};
});
