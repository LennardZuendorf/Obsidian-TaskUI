import { useSettings } from "@/config/settings";
import { logger } from "@/utils/logger";

/**
 * Debug component to display current settings state
 * Shows both the React hook value and logs to console
 * Only renders when built in development mode (npm run dev or npm run build)
 * Will be completely removed in production builds (npm run build:release)
 */
export function SettingsDebug() {
	const settings = useSettings();

	// Only show in development builds
	// import.meta.env.DEV is a compile-time constant replaced by Vite
	// In production builds, this entire component will be tree-shaken away
	if (!import.meta.env.DEV) {
		return null;
	}

	// Log to console for debugging
	logger.debug("SettingsDebug: Current settings in React", settings);

	return (
		<div
			style={{
				position: "fixed",
				bottom: "10px",
				right: "10px",
				background: "var(--background-primary)",
				border: "1px solid var(--background-modifier-border)",
				borderRadius: "6px",
				padding: "12px",
				fontSize: "11px",
				fontFamily: "monospace",
				maxWidth: "300px",
				zIndex: 9999,
				boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
			}}
		>
			<div
				style={{
					fontWeight: "bold",
					marginBottom: "8px",
					color: "var(--text-accent)",
				}}
			>
				🔍 Settings Debug
			</div>
			<div style={{ color: "var(--text-normal)" }}>
				<div style={{ marginBottom: "4px" }}>
					<strong>defaultPath:</strong>{" "}
					<span style={{ color: "var(--text-muted)" }}>
						{settings.defaultPath}
					</span>
				</div>
				<div style={{ marginBottom: "4px" }}>
					<strong>defaultHeading:</strong>{" "}
					<span style={{ color: "var(--text-muted)" }}>
						{settings.defaultHeading}
					</span>
				</div>
				{settings.todoistApiKey && (
					<div style={{ marginBottom: "4px" }}>
						<strong>todoistApiKey:</strong>{" "}
						<span style={{ color: "var(--text-muted)" }}>
							{settings.todoistApiKey.slice(0, 8)}...
						</span>
					</div>
				)}
				<div
					style={{
						marginTop: "8px",
						paddingTop: "8px",
						borderTop: "1px solid var(--background-modifier-border)",
						fontSize: "10px",
						color: "var(--text-faint)",
					}}
				>
					Check console for full settings object
				</div>
			</div>
		</div>
	);
}

