import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils";

const inputVariants = cva(
	"flex items-center rounded-md transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
	{
		variants: {
			variant: {
				default: "h-12 border border-input bg-secondary px-3 py-1 shadow-sm",
				bare: "h-12 border-0 shadow-none bg-transparent px-0 focus-within:ring-0 focus-within:ring-offset-0 has-[:disabled]:text-primary text-primary",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface InputProps
	extends Omit<
			React.InputHTMLAttributes<HTMLInputElement>,
			"size" | "value" | "onChange" | "onSubmit" | "onError"
		>,
		VariantProps<typeof inputVariants> {
	icon?: React.ReactNode;
	value?: string | number;
	onChange?: (value: string) => void;
	onError?: (error: string) => void;
	onSubmit?: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			type,
			variant,
			icon,
			value,
			onChange,
			onSubmit,
			onError,
			...props
		},
		ref,
	) => {
		const wrapperRef = React.useRef<HTMLDivElement>(null);
		const inputRef = React.useRef<HTMLInputElement>(null);

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" && onSubmit) {
				onSubmit((e.target as HTMLInputElement).value);
			}
			if (props.onKeyDown) {
				props.onKeyDown(e);
			}
		};

		React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

		return (
			<div
				ref={wrapperRef}
				className={cn(
					inputVariants({
						variant: variant || "default",
						className,
					}),
				)}
			>
				{icon && (
					<span className="mr-2 flex items-center justify-center">{icon}</span>
				)}
				<input
					type={type}
					className={cn(
						"!text-primary-foreground !bg-transparent !border-none !ring-0 !shadow-none flex-1 min-w-0 outline-none focus-visible:outline-none !placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
					)}
					ref={inputRef}
					value={value !== undefined ? value : undefined} // Support both controlled and uncontrolled
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						onChange?.(e.target.value)
					}
					{...props}
					onKeyDown={handleKeyDown} // Added for onSubmit - must be after props spread
				/>
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input, inputVariants };