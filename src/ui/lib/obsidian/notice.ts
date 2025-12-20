import { Notice } from "obsidian";

/**
 * Displays a formatted string as an Obsidian notice.
 * @param message - The formatted string to display.
 * @param duration - Optional duration in seconds for how long the notice should be displayed.
 * @param persistent - If true, the notice will stay until the user interacts with it.
 */
export function showNotice(
	message: string,
	persistent = false,
	duration = 5,
): void {
	// Create a temporary container to parse the HTML string
	const tempContainer = document.createElement("div");
	tempContainer.innerHTML = message;

	// Create a DocumentFragment and append the parsed elements
	const fragment = document.createDocumentFragment();
	while (tempContainer.firstChild) {
		fragment.appendChild(tempContainer.firstChild);
	}

	// If persistent is true, set duration to null to make the notice persistent
	const noticeDuration = persistent ? 0 : duration * 1000;

	new Notice(fragment, noticeDuration);
}

