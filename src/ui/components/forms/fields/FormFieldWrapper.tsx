import * as React from "react";
import { cn } from "@/ui/utils";

export interface FormFieldWrapperProps {
	label?: string;
	htmlFor?: string;
	error?: string;
	className?: string;
	labelClassName?: string;
	children: React.ReactNode;
	showLabel?: boolean;
}

/**
 * Reusable wrapper for form fields that provides consistent label and error styling.
 * Reduces duplication across form components.
 */
export function FormFieldWrapper({
	label,
	htmlFor,
	error,
	className,
	labelClassName,
	children,
	showLabel = true,
}: FormFieldWrapperProps) {
	return (
		<div className={cn("flex flex-col w-full", className)}>
			{showLabel && label && (
				<label
					htmlFor={htmlFor}
					className={cn(
						"text-xs text-muted-foreground mb-1 ml-1",
						labelClassName,
					)}
				>
					{label}
				</label>
			)}
			{children}
			{error && (
				<span className="text-xs text-destructive mt-1 ml-1">{error}</span>
			)}
		</div>
	);
}




