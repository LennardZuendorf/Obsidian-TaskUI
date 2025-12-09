import React from "react";
import { Input } from "../../../base/Input";
import { FormFieldWrapper } from "../../../base/FormFieldWrapper";

export type DescInputProps = {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	error?: string;
	className?: string;
	autoFocus?: boolean;
	placeholder?: string;
	id?: string;
	showLabel?: boolean;
};

export function DescInput({
	value,
	onChange,
	disabled,
	error,
	className,
	autoFocus,
	placeholder = "What needs to be done?",
	id = "description-input",
	showLabel = false,
}: DescInputProps) {
	return (
		<FormFieldWrapper
			label="Task Description"
			htmlFor={id}
			error={error}
			className={className}
			showLabel={showLabel}
		>
			<Input
				id={id}
				value={value}
				onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
					if (e.key === "Enter") {
						e.preventDefault();
						onChange(e.currentTarget.value);
					}
				}}
				placeholder={placeholder}
				autoFocus={autoFocus}
				className="text-xl w-full"
				aria-label={disabled ? "Task Description" : "Edit Task Description"}
				aria-invalid={!!error}
				disabled={disabled}
				variant="bare"
			/>
		</FormFieldWrapper>
	);
}
