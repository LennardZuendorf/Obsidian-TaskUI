"use client";

import {
	Check,
	ChevronDownIcon,
	ChevronUpIcon,
	ChevronsDownUp as ChevronsDownUpIcon,
	ChevronsUpDown, // Renamed alias to avoid conflict
	MinusIcon, // Example for Medium
} from "lucide-react";
import * as React from "react";

import type { JSX } from "react";
import { useId, useState } from "react";
import { TaskPriority } from "../../data/types/tasks"; // Use our enum
import { Button } from "../base/Button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "../base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../base/Popover";
import { cn } from "../utils/cn"; // Adjusted path

interface PrioritySelectProps {
	className?: string;
	value?: TaskPriority | null;
	onChange: (value: TaskPriority | null) => void;
}

export function PrioritySelect({
	className = "",
	value = null,
	onChange,
}: PrioritySelectProps) {
	const id = useId();
	const [open, setOpen] = React.useState(false);
	// Internal state to manage display while popover might be open
	const [currentDisplayPriority, setCurrentDisplayPriority] =
		useState<TaskPriority | null>(value);

	// Update internal state if the external value prop changes
	React.useEffect(() => {
		setCurrentDisplayPriority(value);
	}, [value]);

	const handleOpenChange = (newOpenState: boolean) => {
		console.log(`Popover onOpenChange called with: ${newOpenState}`);
		setOpen(newOpenState);
	};

	const handleSelect = (priority: TaskPriority | null) => {
		console.log(`Priority selected: ${priority}`);
		setCurrentDisplayPriority(priority);
		onChange(priority);
		setOpen(false); // This should only happen on selection
	};

	const handleTriggerClick = (event: React.MouseEvent) => {
		console.log("PopoverTrigger clicked!");
		// Explicitly stop propagation
		event.stopPropagation();
	};

	// Find the visual representation for the current value
	const displayVisual = currentDisplayPriority
		? mapPriorityToVisual(currentDisplayPriority)
		: null;

	return (
		<Popover open={open} onOpenChange={handleOpenChange} modal={true}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					size="sm"
					variant={"outline"}
					role="combobox"
					aria-expanded={open}
					onClick={handleTriggerClick}
					className={cn(
						"justify-between group bg-background hover:bg-background border-input flex font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
						className,
					)}
				>
					{displayVisual ? (
						<div className="flex items-center pr-2">
							{displayVisual.icon}
							<p className={displayVisual.className}>
								{displayVisual.label}
							</p>
						</div>
					) : (
						// Default text when no value is selected
						<div className="flex items-center group-hover:opacity-50 text-muted-foreground">
							<MinusIcon className="mr-2 h-4 w-4" />
							Priority
						</div>
					)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className={cn("w-[180px] z-[150] p-0", className)}>
				<Command>
					<CommandList>
						<CommandEmpty>No priority found.</CommandEmpty>
						<CommandGroup>
							{priorities.map((priority) => (
								<CommandItem
									key={priority.value}
									value={priority.label}
									onSelect={() => {
										handleSelect(priority.value);
									}}
								>
									<div className="flex items-center">
										{priority.icon}
										<span className={priority.className}>
											{priority.label}
										</span>
									</div>
									<Check
										className={cn(
											"ml-auto h-4 w-4",
											value === priority.value
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

interface PriorityVisual {
	value: TaskPriority;
	label: string;
	icon: JSX.Element;
	className: string;
}

function mapPriorityToVisual(priority: TaskPriority): PriorityVisual {
	const found = priorities.find((p) => p.value === priority);
	// Provide a default fallback if somehow priority value is invalid
	return found || priorities[2]; // Default to Medium
}

// Map our TaskPriority enum to visuals
const priorities: PriorityVisual[] = [
	{
		value: TaskPriority.HIGHEST,
		label: "Highest",
		icon: (
			<ChevronsDownUpIcon className="inline mr-2 h-4 w-4 text-destructive" />
		),
		className: "text-destructive",
	},
	{
		value: TaskPriority.HIGH,
		label: "High",
		icon: (
			<ChevronUpIcon className="inline mr-2 h-4 w-4 text-destructive" />
		),
		className: "text-destructive",
	},
	{
		value: TaskPriority.MEDIUM,
		label: "Medium",
		icon: (
			<MinusIcon className="inline mr-2 h-4 w-4 text-accent-foreground" />
		),
		className: "text-accent-foreground",
	},
	{
		value: TaskPriority.LOW,
		label: "Low",
		icon: (
			<ChevronDownIcon className="inline mr-2 h-4 w-4 text-muted-foreground" />
		),
		className: "text-muted-foreground",
	},
	{
		value: TaskPriority.LOWEST,
		label: "Lowest",
		icon: (
			<ChevronsUpDown className="inline mr-2 h-4 w-4 text-muted-foreground" />
		),
		className: "text-muted-foreground",
	},
];
