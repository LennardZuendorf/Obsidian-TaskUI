import React from "react";
import { Input } from "@/ui/base/Input";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/ui/utils";

export type DescInputProps = {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	error?: string;
	className?: string;
	wrapperClassName?: string;
	autoFocus?: boolean;
	placeholder?: string;
	id?: string;
	showLabel?: boolean;
	label?: string;
	variant?: "default" | "compact";
	onBlur?: () => void;
	inputRef?: React.Ref<HTMLInputElement>;
};

export function DescInput({
	value,
	onChange,
	disabled,
	error,
	className,
	wrapperClassName,
	autoFocus,
	placeholder = "What needs to be done?",
	id = "description-input",
	showLabel = false,
	label = "Task Description",
	variant = "default",
	onBlur,
	inputRef,
}: DescInputProps) {
	const inputElement = (
		<Input
			id={id}
			value={value}
			onChange={(stringValue) => onChange(stringValue)}
			onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
				if (e.key === "Enter") {
					e.preventDefault();
					onChange(e.currentTarget.value);
				}
			}}
			onBlur={onBlur}
			ref={inputRef}
			placeholder={placeholder}
			autoFocus={autoFocus}
			className={variant === "default" ? "text-xl w-full" : "w-full min-w-0"}
			aria-label={disabled ? label : `Edit ${label}`}
			aria-invalid={!!error}
			disabled={disabled}
			variant={variant === "default" ? "bare" : undefined}
		/>
	);

	if (variant === "compact") {
		// For compact variant, don't use FormFieldWrapper, just return the input with optional label
		return (
			<div className={cn("flex flex-col min-w-40 flex-1 basis-0", wrapperClassName, className)}>
				{showLabel && (
					<label htmlFor={id} className="text-xs text-muted-foreground mb-1 ml-1">
						{label}
					</label>
				)}
				{inputElement}
				{error && (
					<span className="text-xs text-destructive mt-1 ml-1">{error}</span>
				)}
			</div>
		);
	}

	// Default variant uses FormFieldWrapper
	return (
		<FormFieldWrapper
			label={label}
			htmlFor={id}
			error={error}
			className={className}
			showLabel={showLabel}
		>
			{inputElement}
		</FormFieldWrapper>
	);
}
