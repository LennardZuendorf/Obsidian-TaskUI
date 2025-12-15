import React from "react";
import { TaskPriority } from "../../../data/types/tasks";
import { cn } from "../../utils";
import {
	LowestPriorityIcon,
	LowPriorityIcon,
	MediumPriorityIcon,
	HighPriorityIcon,
	HighestPriorityIcon,
} from "./PriorityFlagIcons";

interface PriorityFlagsProps {
	priority: TaskPriority;
	className?: string;
	size?: "sm" | "md" | "lg";
}

/**
 * PriorityFlags component that displays custom flag icons based on priority level
 * - Lowest: 1 non-filled flag (outline)
 * - Low: 1 partly filled flag
 * - Medium: 1 neutral flag (accent color)
 * - High: 1 red flag
 * - Highest: 2 overlapping red flags
 */
export function PriorityFlags({ priority, className, size = "md" }: PriorityFlagsProps) {
	const sizeClass = {
		sm: "h-4 w-4",
		md: "h-5 w-5",
		lg: "h-6 w-6",
	}[size];

	const IconComponent = {
		[TaskPriority.LOWEST]: LowestPriorityIcon,
		[TaskPriority.LOW]: LowPriorityIcon,
		[TaskPriority.MEDIUM]: MediumPriorityIcon,
		[TaskPriority.HIGH]: HighPriorityIcon,
		[TaskPriority.HIGHEST]: HighestPriorityIcon,
	}[priority];

	return <IconComponent className={cn(sizeClass, className)} />;
}

