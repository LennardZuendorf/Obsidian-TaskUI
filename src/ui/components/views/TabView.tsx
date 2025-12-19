import React from "react";
import { cn } from "@/ui/utils";

interface TabViewProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
	children: React.ReactNode;
}

/**
 * Reusable wrapper for tab content with consistent styling.
 * Passes children and adds utility classes; accepts custom className.
 */
export const TabView: React.FC<TabViewProps> = ({ className, children, ...props }) => {
	return (
		<div
			className={cn(
				"w-full h-full flex flex-col bg-secondary border border-border rounded-md m-4 transition-all overflow-hidden",
				className
			)}
			{...props}
		>
			<div className="p-2 h-full w-full">
				{children}
			</div>
		</div>
	);
};
