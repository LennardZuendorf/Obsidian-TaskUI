import React from "react";
import type { TaskPriority } from "../../../data/types/tasks";
import { getPriorityDisplay } from "../../lib/displayConfig/priorityDisplayConfig";
import { cn } from "../../utils";

export interface PriorityTextProps {
	priority: TaskPriority | null;
	className?: string;
}

/**
 * Display priority as colored text using the priority display config.
 */
export function PriorityText({ priority, className }: PriorityTextProps) {
	const display = getPriorityDisplay(priority);

	return (
		<span
			className={cn("text-sm font-medium flex-shrink-0", display.className, className)}
		>
			{display.label}
		</span>
	);
}



