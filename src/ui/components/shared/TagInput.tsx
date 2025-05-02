import { Plus, Tag as TagIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { Input } from "../../base/Input";

interface TagInputProps {
	field: ControllerRenderProps<{ tags: string[] }, "tags">;
	availableTags: string[]; // List of available tag names
	onTagCreate?: (tagName: string) => void; // Optional: Callback when a new tag is created
	placeholder?: string;
}

export function TagInput({
	field,
	availableTags,
	onTagCreate,
	placeholder = "Add tags...",
}: TagInputProps) {
	const [inputValue, setInputValue] = useState("");
	const [searchResults, setSearchResults] = useState<string[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// We still need selectedTags to filter search results correctly
	const selectedTags: string[] = field.value || [];

	// --- Tag Search ---
	useEffect(() => {
		if (inputValue.trim() === "") {
			setSearchResults([]);
			setIsDropdownOpen(false);
			return;
		}

		const lowerInput = inputValue.toLowerCase();
		const results = availableTags.filter(
			(tag) =>
				tag.toLowerCase().includes(lowerInput) &&
				!selectedTags.includes(tag), // Exclude already selected tags
		);
		setSearchResults(results);
		setIsDropdownOpen(
			results.length > 0 ||
				(!availableTags.includes(inputValue.trim()) &&
					!selectedTags.includes(inputValue.trim())), // Open if results or creatable and not already selected/available
		);
	}, [inputValue, availableTags, selectedTags]);

	// --- Event Handlers ---
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const addTag = (tagName: string) => {
		const trimmedName = tagName.trim();
		if (trimmedName && !selectedTags.includes(trimmedName)) {
			field.onChange([...selectedTags, trimmedName]); // Update RHF state
		}
		setInputValue("");
		setIsDropdownOpen(false);
	};

	const createNewTag = () => {
		const newTagName = inputValue.trim();
		if (
			newTagName &&
			!availableTags.includes(newTagName) &&
			!selectedTags.includes(newTagName)
		) {
			// Optionally call the creation callback
			onTagCreate?.(newTagName);
			addTag(newTagName); // Add the newly created tag
		} else if (newTagName && availableTags.includes(newTagName)) {
			// If tag exists in available but not selected, just add it
			addTag(newTagName);
		}
		setInputValue("");
		setIsDropdownOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (searchResults.length > 0) {
				addTag(searchResults[0]); // Add the top search result
			} else if (inputValue.trim()) {
				createNewTag(); // Attempt to create a new tag
			}
		}
	};

	// --- Close dropdown on outside click ---
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [containerRef]);

	return (
		<div className="flex flex-col" ref={containerRef}>
			<div className="relative">
				{/* Remove layout and focus styles from the wrapper div, keeping only flex items-center */}
				<div className="flex items-center">
					{/* Input takes full space */}
					<Input
						icon={<TagIcon className="h-4 w-4 text-muted" />}
						id="description-input"
						placeholder="Add Tags..."
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						value={inputValue}
						aria-label="task-tag-input"
					/>
				</div>

				{/* Suggestions Dropdown */}
				{isDropdownOpen &&
					(searchResults.length > 0 ||
						(inputValue.trim() &&
							!availableTags.includes(inputValue.trim()) &&
							!selectedTags.includes(inputValue.trim()))) && (
						<div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
							<ul className="py-1 max-h-60 overflow-auto">
								{searchResults.map((tag) => (
									<li
										key={tag}
										onClick={() => addTag(tag)}
										className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-secondary"
									>
										<span>{tag}</span>
									</li>
								))}
								{inputValue.trim() &&
									!availableTags.includes(
										inputValue.trim(),
									) &&
									!selectedTags.includes(
										inputValue.trim(),
									) && (
										<li
											className="px-3 py-2 text-sm cursor-pointer hover:bg-secondary flex items-center gap-2"
											onClick={createNewTag}
										>
											<Plus className="h-4 w-4" />
											Create tag "{inputValue.trim()}"
										</li>
									)}
							</ul>
						</div>
					)}
			</div>
		</div>
	);
}
