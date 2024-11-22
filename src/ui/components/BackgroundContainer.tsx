import React from "react";
import { cn } from "../utils/cn";

/**
 * Background container component to display a background container.
 * This component is used to display a background container with a shadow and rounded corners.
 */
export const BackgroundContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"shadow-lg justify-items-center bg-primary outline outline-secondary rounded-md",
				className,
			)}
		>
			{children}
		</div>
	);
};
