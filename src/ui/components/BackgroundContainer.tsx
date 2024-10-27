import React from "react";
import { cn } from "../../utils/styleUtils";

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
