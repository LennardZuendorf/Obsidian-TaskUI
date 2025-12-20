import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

/**
 * Copies build files to the appropriate locations
 * @param mode - "development" or "production"
 */
function copyFiles(mode: "development" | "production"): void {
	const isDevMode = mode === "development";
	const buildDir = isDevMode ? "build/shards-dev" : "build/shards";
	const buildPath = path.resolve(projectRoot, buildDir);

	// Copy manifest to build directory
	const manifestPath = path.join(projectRoot, "manifest.json");
	const buildManifestPath = path.join(buildPath, "manifest.json");
	
	if (existsSync(manifestPath)) {
		copyFileSync(manifestPath, buildManifestPath);
		console.log(`✓ Copied manifest.json to ${buildDir}`);
	} else {
		console.warn(`⚠ manifest.json not found at ${manifestPath}`);
	}

	// In development mode, also copy to dev vault if it exists
	if (isDevMode) {
		const devVaultPath = path.resolve(
			projectRoot,
			"dev-vault/.obsidian/plugins/shards",
		);

		if (existsSync(path.resolve(projectRoot, "dev-vault"))) {
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
	}
}

// Get mode from command line argument or environment variable
const modeArg = process.argv[2] || process.env.BUILD_MODE || "development";

if (modeArg !== "development" && modeArg !== "production") {
	console.error(`Invalid mode: ${modeArg}. Must be "development" or "production"`);
	process.exit(1);
}

copyFiles(modeArg as "development" | "production");

