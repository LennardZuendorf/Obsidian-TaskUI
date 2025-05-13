import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";

const buttonVariants = cva(
	"relative inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground hover:bg-primary/90",
				accent: "!bg-accent text-accent-foreground hover:ring-2 hover:ring-hover",
				destructive:
					"!bg-destructive/50 text-primary-foreground hover:bg-destructive/50",
				outline:
					"border border-input border-1 !bg-transparent hover:ring-2 hover:ring-hover disabled:text-primary-foreground text-primary-foreground",
				secondary: "!bg-secondary text-secondary-foreground",
				ghost: "!bg-transparent hover:ring-2 hover:ring-hover !shadow-none border-secom disabled:text-primary text-primary",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-8 px-3",
				lg: "h-12 px-8 py-4",
				fill: "h-full w-full",
				icon: "h-10 w-10",
				iconsm: "h-8 w-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	endIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, endIcon, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			>
				{props.children}
				{endIcon && (
					<div className="absolute inset-y-0 right-3 flex items-center gap-1 text-muted">
						<span>{endIcon}</span>
					</div>
				)}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
