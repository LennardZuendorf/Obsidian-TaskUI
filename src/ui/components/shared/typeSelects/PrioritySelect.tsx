import { ArrowUp, ChevronsUpDown } from "lucide-react";
import React from "react";
import type { TaskPriority } from "../../../../data/types/tasks";
import { Button } from "../../../base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "../../../base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../base/Popover";
import {
	getOrderedTaskPriorities,
	getPriorityDisplay,
} from "../../../lib/displayConfig/priorityDisplayConfig";
import { cn } from "../../../utils";

export type PrioritySelectProps = {
	value: TaskPriority | null;
	onChange: (priority: TaskPriority) => void;
	disabled?: boolean;
	className?: string;
};

export function PrioritySelect({
	value,
	onChange,
	disabled,
	className,
}: PrioritySelectProps) {
	const [pSelectOpen, setPSelectOpen] = React.useState(false);

	const priorities = getOrderedTaskPriorities();
	const selectedDisplay = getPriorityDisplay(value);

	return (
		<div className={cn("flex flex-col", className)}>
			<span
				className={cn(
					"text-xs text-muted-foreground mb-1 ml-1",
					value == null ? "opacity-0" : "opacity-100",
				)}
			>
				Priority
			</span>
			<Popover open={pSelectOpen} onOpenChange={setPSelectOpen}>
				<PopoverTrigger asChild>
					<Button
						className="gap-1"
						disabled={disabled}
						aria-label="Select priority"
						type="button"
					>
						{(() => {
							if (value) {
								const IconComponent = selectedDisplay.icon;
								return (
									<>
										{IconComponent && (
											<IconComponent
												className={cn(
													"h-4 w-4",
													selectedDisplay.iconClassName,
												)}
											/>
										)}
										<span className="text-sm">
											{selectedDisplay.label}
										</span>
									</>
								);
							}
							// Default view
							return (
								<>
									<ChevronsUpDown className="h-4 w-4 opacity-50" />
									<span className="text-sm">
										Select priority
									</span>
								</>
							);
						})()}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandList>
							<CommandGroup heading="Priority">
								{priorities.map((priority) => {
									const display =
										getPriorityDisplay(priority);
									const IconComponent = display.icon;
									const isSelected = value === priority;
									return (
										<CommandItem
											key={priority}
											onSelect={() => {
												onChange(priority);
												setPSelectOpen(false);
											}}
											className={cn(
												"flex items-center justify-between w-full cursor-pointer",
												isSelected &&
													"bg-accent text-accent-foreground",
											)}
											aria-selected={isSelected}
										>
											<div className="flex items-center mr-2">
												{IconComponent && (
													<IconComponent
														className={cn(
															"mr-2 h-4 w-4",
															display.iconClassName,
														)}
													/>
												)}
												<span>{display.label}</span>
											</div>
											{isSelected && (
												<ArrowUp className="h-4 w-4 text-primary" />
											)}
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
