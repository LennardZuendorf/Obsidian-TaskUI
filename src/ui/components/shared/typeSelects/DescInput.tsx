import React from "react";
import { Input } from "../../../base/Input";
import { cn } from "@//utils";

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
		<div className={cn("flex flex-col w-full", className)}>
			{showLabel && (
				<label
					htmlFor={id}
					className="text-xs text-muted-foreground mb-1 ml-1"
				>
					Task Description
				</label>
			)}
			<div className="gap-1 w-full">
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
					aria-label={
						disabled ? "Task Description" : "Edit Task Description"
					}
					aria-invalid={!!error}
					disabled={disabled}
					variant="bare"
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
