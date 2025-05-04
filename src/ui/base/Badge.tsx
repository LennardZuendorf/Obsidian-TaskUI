import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@//utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border-0 border-none px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 ring-1 ring-hover",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 ring-primary",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
				accent: "text-xs text-accent ring-1 ring-accent",
				outline: "text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {
	icon?: React.ReactNode;
	onRemove?: () => void;
	removeAriaLabel?: string;
}

function Badge({
	className,
	variant,
	icon,
	onRemove,
	removeAriaLabel = "Remove",
	children,
	...props
}: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props}>
			{icon && <span className="flex-shrink-0">{icon}</span>}
			<span className="flex-grow">{children}</span>
			{onRemove && (
				<X
					className="h-3 w-3 ml-1 cursor-pointer opacity-70 hover:opacity-100"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					aria-label={removeAriaLabel}
				/>
			)}
		</div>
	);
}

export { Badge, badgeVariants };
