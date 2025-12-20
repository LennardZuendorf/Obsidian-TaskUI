import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

/**
 * Bumps a semantic version string
 * @param version - Current version (e.g., "1.2.3")
 * @param type - Bump type: "major", "minor", or "patch"
 * @returns Bumped version
 */
function bumpVersion(version: string, type: "major" | "minor" | "patch"): string {
	const parts = version.split(".").map(Number);
	
	if (type === "major") {
		parts[0]++;
		parts[1] = 0;
		parts[2] = 0;
	} else if (type === "minor") {
		parts[1]++;
		parts[2] = 0;
	} else {
		// patch (default)
		parts[2]++;
	}
	
	return parts.join(".");
}

// Parse CLI arguments
const args = process.argv.slice(2);
let bumpType: "major" | "minor" | "patch" = "patch"; // default

if (args.includes("--major")) {
	bumpType = "major";
} else if (args.includes("--minor")) {
	bumpType = "minor";
} else if (args.includes("--patch")) {
	bumpType = "patch";
}

// Read current version from package.json
const packageJsonPath = path.join(projectRoot, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version: string };
const currentVersion = packageJson.version;
const newVersion = bumpVersion(currentVersion, bumpType);

console.log(`Bumping version: ${currentVersion} → ${newVersion} (${bumpType})`);

// Update package.json
packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "\t"));

// Read minAppVersion from manifest.json and update version
const manifestPath = path.join(projectRoot, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { version: string; minAppVersion: string };
const { minAppVersion } = manifest;
manifest.version = newVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t"));

// Update build folder manifest.json (both possible build directories)
const buildDirs = ["build/shards", "build/shards-dev"];
buildDirs.forEach((buildDir) => {
	const buildManifestPath = path.join(projectRoot, buildDir, "manifest.json");
	if (existsSync(buildManifestPath)) {
		const buildManifest = JSON.parse(readFileSync(buildManifestPath, "utf8")) as { version: string };
		buildManifest.version = newVersion;
		writeFileSync(buildManifestPath, JSON.stringify(buildManifest, null, "\t"));
		console.log(`✓ Updated ${buildManifestPath}`);
	}
});

// Update versions.json with new version and minAppVersion from manifest.json
const versionsPath = path.join(projectRoot, "build/versions.json");
const versions = JSON.parse(readFileSync(versionsPath, "utf8")) as Record<string, string>;
versions[newVersion] = minAppVersion;
writeFileSync(versionsPath, JSON.stringify(versions, null, "\t"));

console.log(`✓ Version bump complete: ${newVersion}`);

