import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle, CircleAlert, TriangleAlert } from "lucide-react";
import React from "react";

import { cn } from "../utils";

const alertVariants = cva(
	"flex flex-row items-center text-xs relative w-full h-9 rounded-md border px-3 py-1 [&>svg~*]:pl-6 [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-foreground",
	{
		variants: {
			variant: {
				error:
					"border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
				success:
					"border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-700",
				warn: "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-700",
			},
		},
		defaultVariants: {
			variant: "error",
		},
	},
);

export interface AlertProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
	({ className, variant, children, ...props }, ref) => {
		const Icon =
			variant === "success"
				? CheckCircle
				: variant === "warn"
					? TriangleAlert
					: CircleAlert;

		return (
			<div
				ref={ref}
				role="alert"
				className={cn(alertVariants({ variant }), className)}
				{...props}
			>
				<Icon className="h-4 w-4" aria-hidden="true" />
				{children}
			</div>
		);
	},
);
Alert.displayName = "Alert";

export { Alert, alertVariants };
