import { cva, type VariantProps } from "class-variance-authority";
import { CalendarIcon as DateInputCalendarIcon } from "lucide-react";
import * as React from "react";
import { withMask as dateInputWithMask } from "use-mask-input";
import {
	dateToNumberString as dateInputDateToNumberString,
	isValidDateNumberString as dateInputIsValidDateNumberString,
	numberStringToDate as dateInputNumberStringToDate,
} from "../../data/utils/dateUtils";
import { cn } from "../utils";

// ===== Input Component =====

const inputVariants = cva(
	"flex items-center w-full rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"h-9 border border-input bg-secondary px-3 py-1 shadow-sm",
				bare: "h-12 border-0 shadow-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0",
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
	value?: string | number | readonly string[];
	onChange?: (value: string) => void;
	onError?: (error: string) => void;
	onSubmit?: (value: string) => void;
	// type is inherited from React.InputHTMLAttributes
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
		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" && onSubmit) {
				onSubmit((e.target as HTMLInputElement).value);
			}
			if (props.onKeyDown) {
				props.onKeyDown(e);
			}
		};

		return (
			<div
				className={cn(
					inputVariants({
						variant: variant || "default",
						className,
					}),
				)}
			>
				{icon && (
					<span className="mr-2 flex items-center justify-center">
						{icon}
					</span>
				)}
				<input
					type={type}
					className={cn(
						"!text-muted-foreground !bg-transparent !border-none !ring-0 !shadow-none !focus:ring-0 !focus:shadow-none !focus:border-none w-full",
					)}
					ref={ref}
					value={value ?? ""} // Ensure value is controlled
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						onChange?.(e.target.value)
					}
					onKeyDown={handleKeyDown} // Added for onSubmit
					{...props}
				/>
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input, inputVariants };

// ===== DateInput Component =====

// DateInputProps does NOT extend InputProps to avoid signature clashes
export interface DateInputProps {
	label?: string;
	value: Date; // This is the Date object for DateInput
	onChange: (value: Date) => void; // This is the Date callback for DateInput
	id?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	placeholder?: string;
	validation?: "any" | "future" | "past";
	inputClassName?: string; // Class for the underlying <Input> component's wrapper
	wrapperClassName?: string; // Class for DateInput's own wrapper (if label is present)
	// We can add specific props from InputProps if DateInput needs to configure them on the base Input
	// e.g. icon?: React.ReactNode (but DateInput sets its own icon by default)
}

export function DateInput({
	label,
	value,
	onChange: onDateChange, // Renamed to avoid confusion with base Input's onChange if it were in scope
	id,
	disabled,
	autoFocus,
	placeholder = "DD/MM/YYYY",
	validation = "any",
	inputClassName,
	wrapperClassName,
}: DateInputProps) {
	const [displayInputValue, setDisplayInputValue] = React.useState<string>(
		dateInputDateToNumberString(value),
	);

	React.useEffect(() => {
		const newDisplayValue = dateInputDateToNumberString(value);
		if (newDisplayValue !== displayInputValue.replace(/\D/g, "")) {
			setDisplayInputValue(newDisplayValue);
		}
	}, [value, displayInputValue, dateInputDateToNumberString]);

	const handleBaseInputValueChange = (newStringValue: string) => {
		setDisplayInputValue(newStringValue); // Update display with masked value
		const unmaskedValue = newStringValue.replace(/\D/g, "");

		if (dateInputIsValidDateNumberString(unmaskedValue, validation)) {
			const newDate = dateInputNumberStringToDate(unmaskedValue);
			if (newDate) {
				onDateChange(newDate); // Call DateInput's own onChange with the Date object
			}
		} else if (unmaskedValue === "") {
			// Handle case where input is cleared - currently does not call onDateChange
			// Consider if onDateChange(null) or similar is desired for clearing.
		}
	};

	const internalInputRef = React.useRef<HTMLInputElement>(null);
	const maskRef = dateInputWithMask("99/99/9999", {
		placeholder: "DD/MM/YYYY", // This placeholder is for the mask itself
		showMaskOnHover: false,
	});

	const combinedRef = React.useCallback(
		(instance: HTMLInputElement | null) => {
			maskRef(instance); // Apply mask to the native input element
			(
				internalInputRef as React.MutableRefObject<HTMLInputElement | null>
			).current = instance;
		},
		[maskRef],
	);

	const inputElement = (
		<Input // Using the base Input component from this file
			variant="default"
			className={inputClassName}
			icon={
				<DateInputCalendarIcon className="w-4 h-4 text-muted-foreground" />
			}
			type="text" // Masked input should be text
			value={displayInputValue} // Pass the string state to base Input
			onChange={handleBaseInputValueChange} // Pass the adapter function
			ref={combinedRef} // This ref is forwarded by base Input to its native input
			placeholder={placeholder} // This is the visual placeholder for the input field
			id={id}
			disabled={disabled}
			autoFocus={autoFocus}
		/>
	);

	if (label) {
		return (
			<div className={cn(wrapperClassName)}>
				<label
					htmlFor={id}
					className="text-xs text-muted-foreground mb-1 ml-1"
				>
					{label}
				</label>
				{inputElement}
			</div>
		);
	}

	return inputElement;
}
