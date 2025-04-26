"use client";

import {
	Check,
	CheckCircle2,
	Circle,
	HelpCircle,
	PlayCircle,
	XCircle,
} from "lucide-react";
import * as React from "react";

import type { JSX } from "react";
import { useId } from "react";
import { TaskStatus } from "../../data/types/tasks";
import { Button } from "../base/Button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "../base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../base/Popover";
import { cn } from "../utils/cn";

interface StatusSelectProps {
	className?: string;
	value?: TaskStatus | null;
	onChange: (value: TaskStatus) => void;
}

export function StatusSelect({
	className = "",
	value = TaskStatus.TODO,
	onChange,
}: StatusSelectProps) {
	const id = useId();
	const [open, setOpen] = React.useState(false);
	const currentStatusVisual = mapStatusToVisual(value || TaskStatus.TODO);

	const handleSelect = (status: TaskStatus) => {
		onChange(status);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen} modal={true}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant={"outline"}
					role="combobox"
					aria-expanded={open}
					size="icon"
					className={cn(
						"justify-center p-0",
						"group bg-background hover:bg-background border-input flex font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
						className,
					)}
				>
					{React.cloneElement(currentStatusVisual.icon, {
						className: "h-4 w-4",
					})}
				</Button>
			</PopoverTrigger>
			<PopoverContent className={cn("w-[180px] z-[150] p-0", className)}>
				<Command>
					<CommandList>
						<CommandEmpty>No status found.</CommandEmpty>
						<CommandGroup>
							{statusVisuals.map((statusVisual) => (
								<CommandItem
									key={statusVisual.value}
									value={statusVisual.label}
									onSelect={() => {
										handleSelect(statusVisual.value);
									}}
								>
									<div className="flex items-center">
										{statusVisual.icon}
										<span
											className={statusVisual.className}
										>
											{statusVisual.label}
										</span>
									</div>
									<Check
										className={cn(
											"ml-auto h-4 w-4",
											value === statusVisual.value
												? "opacity-100"
												: "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

interface StatusVisual {
	value: TaskStatus;
	label: string;
	icon: JSX.Element;
	className?: string;
}

function mapStatusToVisual(status: TaskStatus): StatusVisual {
	const found = statusVisuals.find((s) => s.value === status);
	return (
		found || {
			value: status,
			label: status,
			icon: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
			className: "text-muted-foreground",
		}
	);
}

const statusVisuals: StatusVisual[] = [
	{
		value: TaskStatus.TODO,
		label: "To Do",
		icon: <Circle className="h-4 w-4" />,
	},
	{
		value: TaskStatus.IN_PROGRESS,
		label: "In Progress",
		icon: <PlayCircle className="h-4 w-4" />,
	},
	{
		value: TaskStatus.DONE,
		label: "Done",
		icon: <CheckCircle2 className="h-4 w-4 text-muted" />,
	},
	{
		value: TaskStatus.CANCELLED,
		label: "Cancelled",
		icon: <XCircle className="h-4 w-4 text-destructive" />,
	},
];
