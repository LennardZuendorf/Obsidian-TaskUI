import React from "react";
import { Input } from "../../../base/Input";

export type DescInputProps = {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	error?: string;
	className?: string;
	autoFocus?: boolean;
	placeholder?: string;
	id?: string;
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
}: DescInputProps) {
	return (
		<div className={`flex flex-col w-full ${className || ""}`}>
			<label
				htmlFor={id}
				className="text-xs text-muted-foreground mb-1 ml-1"
			>
				Task Description
			</label>
			<div className="flex flex-row items-center gap-1">
				<Input
					id={id}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					autoFocus={autoFocus}
					className="flex flex-shrink"
					aria-label="Set the Task Description"
					aria-invalid={!!error}
					disabled={disabled}
				/>
			</div>
			{error && (
				<span className="text-xs text-destructive mt-1 ml-1">
					{error}
				</span>
			)}
		</div>
	);
}
