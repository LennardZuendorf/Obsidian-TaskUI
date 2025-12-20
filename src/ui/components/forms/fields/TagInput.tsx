import * as React from "react";
import { Badge } from "@/ui/base/Badge";
import { inputVariants } from "@/ui/base/Input";
import { cn } from "@/ui/utils";

export type Tag = {
	id: string;
	text: string;
};

interface TagInputProps {
	tags: Tag[];
	setTags: (tags: Tag[]) => void;
	activeTagIndex: number | null;
	setActiveTagIndex: (index: number | null) => void;
	placeholder?: string;
	className?: string;
}

/**
 * Custom TagInput component built on Input component structure.
 * Uses Badge components for tags and a borderless input field.
 * Tags match Badge accent variant, container matches Input component.
 */
export function TagInput({
	tags,
	setTags,
	activeTagIndex,
	setActiveTagIndex,
	placeholder = "Add tags...",
	className,
}: TagInputProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [inputValue, setInputValue] = React.useState("");

	const handleAddTag = (tagText: string) => {
		const trimmedText = tagText.trim();
		if (!trimmedText) return;

		// Check for duplicates by text field
		const isDuplicate = tags.some(
			(tag) => tag.text.toLowerCase() === trimmedText.toLowerCase(),
		);
		if (isDuplicate) {
			setInputValue("");
			return;
		}

		// Create new tag
		const newTag: Tag = {
			id: trimmedText,
			text: trimmedText,
		};

		setTags([...tags, newTag]);
		setInputValue("");
	};

	const handleRemoveTag = (index: number) => {
		const newTags = tags.filter((_, i) => i !== index);
		setTags(newTags);
		// Reset active tag index if the removed tag was active
		if (activeTagIndex === index) {
			setActiveTagIndex(null);
		} else if (activeTagIndex !== null && activeTagIndex > index) {
			// Adjust active tag index if a tag before it was removed
			setActiveTagIndex(activeTagIndex - 1);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddTag(inputValue);
		} else if (e.key === ",") {
			e.preventDefault();
			handleAddTag(inputValue);
		} else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
			// Remove last tag when backspace is pressed on empty input
			const lastIndex = tags.length - 1;
			handleRemoveTag(lastIndex);
			setActiveTagIndex(lastIndex - 1 >= 0 ? lastIndex - 1 : null);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	return (
		<>
			{/* Style tag to force placeholder color - overrides Obsidian CSS */}
			<style>{`
				.tag-input-wrapper input::placeholder {
					color: var(--text-muted) !important;
				}
			`}</style>
			<div
				className={cn(
					inputVariants({ variant: "default" }),
					"flex items-center gap-2 flex-wrap tag-input-wrapper",
					className,
				)}
				onClick={() => inputRef.current?.focus()}
			>
				{tags.map((tag, index) => (
					<Badge
						key={tag.id}
						variant="accent"
						size="sm"
						onRemove={() => handleRemoveTag(index)}
						removeAriaLabel={`Remove tag ${tag.text}`}
					>
						{tag.text}
					</Badge>
				))}

				{/* Input field on the right */}
				<input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className={cn(
						"!text-primary-foreground !bg-transparent !border-none !ring-0 !shadow-none !focus:ring-0 !focus:shadow-none !focus:border-none flex-1 min-w-[60px] outline-none !placeholder:text-muted-foreground",
					)}
				/>
			</div>
		</>
	);
}
