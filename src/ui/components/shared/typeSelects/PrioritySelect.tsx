import React from "react";
import type { TaskPriority } from "../../../../data/types/tasks";
import { EnumSelect } from "../../../base/EnumSelect";
import type { ButtonProps } from "../../../base/Button";
import { getPriorityDisplayConfig } from "../../../lib/displayConfig/priorityDisplayConfig";

export type PrioritySelectProps = {
	value: TaskPriority | null;
	onChange: (priority: TaskPriority) => void;
	disabled?: boolean;
	className?: string;
	buttonSize?: ButtonProps["size"];
	showLabel?: boolean;
};

export function PrioritySelect({
	value,
	onChange,
	disabled,
	className,
	buttonSize = "default",
	showLabel = false,
}: PrioritySelectProps) {
	const priorities = getPriorityDisplayConfig();

	return (
		<EnumSelect
			value={value}
			onChange={onChange}
			options={priorities}
			disabled={disabled}
			className={className}
			buttonSize={buttonSize}
			showLabel={showLabel}
			label="Priority"
			placeholder="Select Priority"
			groupHeading="Select Priority"
		/>
	);
}
