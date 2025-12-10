import React from "react";
import type { TaskStatus } from "../../../../data/types/tasks";
import { EnumSelect } from "../../../base/EnumSelect";
import type { ButtonProps } from "../../../base/Button";
import { getStatusDisplayConfig } from "../../../lib/displayConfig/statusDisplayConfig";

export type StatusSelectProps = {
	value: TaskStatus | null;
	onChange: (status: TaskStatus) => void;
	disabled?: boolean;
	className?: string;
	buttonSize?: ButtonProps["size"];
	showLabel?: boolean;
};

export function StatusSelect({
	value,
	onChange,
	disabled,
	className,
	buttonSize = "icon",
	showLabel = false,
}: StatusSelectProps) {
	const statuses = getStatusDisplayConfig();

	return (
		<EnumSelect
			value={value}
			onChange={onChange}
			options={statuses}
			disabled={disabled}
			className={className}
			buttonSize={buttonSize}
			showLabel={showLabel}
			showInnerLabel={buttonSize !== "icon" && buttonSize !== "iconsm"}
			showChevron={buttonSize !== "icon" && buttonSize !== "iconsm"}
			label="Status"
			placeholder="Select Status"
			groupHeading="Status"
		/>
	);
}
