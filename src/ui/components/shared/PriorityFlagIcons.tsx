import React from "react";
import { TaskPriority } from "../../../data/types/tasks";
import { cn } from "../../utils";

/**
 * Individual flag icon components for each priority level
 * These are used in the EnumSelect dropdown and task cards
 * All icons use the same viewBox="0 0 24 24" for consistent sizing
 */

interface FlagIconProps {
	className?: string;
}

/**
 * Lowest Priority: 1 non-filled flag (outline only)
 */
export const LowestPriorityIcon = ({ className }: FlagIconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		className={cn("h-5 w-5 text-muted-foreground", className)}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3 3v18M3.75 3.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55"
		/>
	</svg>
);

/**
 * Low Priority: 1 flag with diagonal color split (half filled)
 */
export const LowPriorityIcon = ({ className }: FlagIconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		className={cn("h-5 w-5 text-primary-foreground", className)}
	>
		<defs>
			<linearGradient id="lowPriorityDiagonal" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="48%" stopColor="currentColor" stopOpacity="1" />
				<stop offset="52%" stopColor="currentColor" stopOpacity="0.3" />
			</linearGradient>
		</defs>
		<path
			fillRule="evenodd"
			fill="url(#lowPriorityDiagonal)"
			d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
			clipRule="evenodd"
		/>
	</svg>
);

/**
 * Medium Priority: 1 fully filled flag in text color
 */
export const MediumPriorityIcon = ({ className }: FlagIconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className={cn("h-5 w-5 text-primary-foreground", className)}
	>
		<path
			fillRule="evenodd"
			d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
			clipRule="evenodd"
		/>
	</svg>
);

/**
 * High Priority: 1 red flag
 */
export const HighPriorityIcon = ({ className }: FlagIconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className={cn("h-5 w-5 text-destructive", className)}
	>
		<path
			fillRule="evenodd"
			d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
			clipRule="evenodd"
		/>
	</svg>
);

/**
 * Highest Priority: 2 red flags overlapping
 * Uses same viewBox as single flags for consistent sizing
 */
export const HighestPriorityIcon = ({ className }: FlagIconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className={cn("h-5 w-5 text-destructive", className)}
	>
		{/* First flag - slightly transparent */}
		<path
			fillRule="evenodd"
			d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
			clipRule="evenodd"
			opacity="0.6"
		/>
		{/* Second flag - offset and slightly lower, fully opaque */}
		<path
			fillRule="evenodd"
			d="M6 4.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 21 6.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V23a.75.75 0 0 1-1.5 0V5A.75.75 0 0 1 6 4.25Z"
			clipRule="evenodd"
			transform="translate(3, 1)"
		/>
	</svg>
);

/**
 * Helper to get the appropriate flag icon component for a priority
 */
export const getPriorityFlagIcon = (priority: TaskPriority) => {
	switch (priority) {
		case TaskPriority.LOWEST:
			return LowestPriorityIcon;
		case TaskPriority.LOW:
			return LowPriorityIcon;
		case TaskPriority.MEDIUM:
			return MediumPriorityIcon;
		case TaskPriority.HIGH:
			return HighPriorityIcon;
		case TaskPriority.HIGHEST:
			return HighestPriorityIcon;
		default:
			return MediumPriorityIcon;
	}
};

