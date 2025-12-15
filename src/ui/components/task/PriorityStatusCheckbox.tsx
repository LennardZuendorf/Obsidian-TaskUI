import React from "react";
import { TaskPriority, TaskStatus } from "@/data/types/tasks";
import { Button, ButtonProps } from "@/ui/base/Button";
import { cn } from "@/ui/utils";
import { EnumCommandList } from "@/ui/components/forms/fields/EnumSelect";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/base/Popover";
import { getStatusDisplay } from "@/ui/lib/config/status";
import { getPriorityDisplay, getPriorityDisplayConfig } from "@/ui/lib/config/priority";

export interface PriorityStatusCheckboxProps {
	status: TaskStatus;
	priority: TaskPriority | null;
	onStatusChange: (status: TaskStatus) => void;
	onPriorityChange: (priority: TaskPriority) => void;
	disabled?: boolean;
	className?: string;
	variant?: ButtonProps["variant"];
	size?: ButtonProps["size"];
}

/**
 * Combined status and priority control with priority indicated by ring color.
 * - Click: Cycles through status states
 * - Right-click: Opens priority picker popover
 */
export function PriorityStatusCommand({
	status,
	priority,
	onStatusChange,
	onPriorityChange,
	disabled,
	className,
	variant = "ghost",
	size = "iconsm",
}: PriorityStatusCheckboxProps) {
	const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = React.useState(false);

	const statusDisplay = getStatusDisplay(status);
	const priorityDisplay = getPriorityDisplay(priority);
	const StatusIcon = statusDisplay.icon;
	const priorityClassName =  priorityDisplay.iconClassName;

	// Cycle through statuses on click
	const handleClick = (e: React.MouseEvent) => {
		if (disabled) return;
		e.preventDefault();
		
		// Simple cycle: TODO -> IN_PROGRESS -> DONE -> TODO
		const statusCycle: Record<TaskStatus, TaskStatus> = {
			[TaskStatus.TODO]: TaskStatus.IN_PROGRESS,
			[TaskStatus.IN_PROGRESS]: TaskStatus.DONE,
			[TaskStatus.DONE]: TaskStatus.TODO,
			[TaskStatus.CANCELLED]: TaskStatus.TODO,
		};
		
		onStatusChange(statusCycle[status]);
	};

	// Open priority picker on right-click
	const handleContextMenu = (e: React.MouseEvent) => {
		if (disabled) return;
		e.preventDefault();
		setIsPriorityPopoverOpen(true);
	};

	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<Popover open={isPriorityPopoverOpen} onOpenChange={setIsPriorityPopoverOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={variant}
					size={size}
					disabled={disabled}
					onClick={handleClick}
					onContextMenu={handleContextMenu}
					className={cn("flex-shrink-0", className)}
					aria-label={`Status: ${statusDisplay.label}, Priority: ${priorityDisplay.label} \n Click to for Status \n Right-Click for Priority`}
				>
					<StatusIcon className={cn("h-4 w-4", priorityClassName)} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
			<EnumCommandList
						value={priority}
						onChange={onPriorityChange}
						options={getPriorityDisplayConfig()}
						groupHeading={"Select Priority"}
						onSelect={() => setIsOpen(false)}
					/>
			</PopoverContent>
		</Popover>
	);
}

