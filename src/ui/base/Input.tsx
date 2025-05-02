import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";

// Styles for the wrapper div
const inputVariants = cva(
	// Base wrapper styles: flex layout, alignment, rounded corners, transitions, focus ring setup (offset)
	"flex items-center w-full rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				// Default wrapper: border, background, padding, height, shadow
				default:
					"h-9 border border-input bg-secondary px-3 py-1 shadow-sm",
				// Bare wrapper: different height, no border/bg/shadow/padding, no focus ring
				bare: "h-12 border-0 shadow-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

// Base styles for the actual <input> element itself
const inputElementStyles =
	"flex-1 w-full bg-transparent text-base file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground outline-none border-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
// Specific text size for bare variant input
const bareInputElementStyles = "text-xxl";

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, // Omit HTML size attribute
		VariantProps<typeof inputVariants> {
	icon?: React.ReactNode; // Optional icon node
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, variant, icon, ...props }, ref) => {
		return (
			// Render the wrapper div, applying CVA variants and any extra className
			<div className={cn(inputVariants({ variant, className }))}>
				{/* Render the icon if provided */}
				{icon && (
					<span className="mr-2 flex items-center justify-center">
						{icon}
					</span>
				)}
				{/* Render the actual input element */}
				<input
					type={type}
					className={cn(
						inputElementStyles, // Apply base input styles
						variant === "bare" && bareInputElementStyles, // Apply bare specific styles
					)}
					ref={ref}
					{...props}
				/>
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input, inputVariants };
