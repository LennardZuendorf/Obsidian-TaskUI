import { Check, ChevronDown } from "lucide-react";
import React from "react";
import type { TaskPriority } from "../../../../data/types/tasks";
import { Button, ButtonProps } from "../../../base/Button";
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
	const [pSelectOpen, setPSelectOpen] = React.useState(false);
	const priorities = getOrderedTaskPriorities();

	return (
		<div className={cn("flex flex-col", className)}>
			{showLabel && (
				<span
					className={cn(
						"text-xs text-muted-foreground mb-1 ml-1",
						value == null ? "opacity-0" : "opacity-100",
					)}
				>
					Priority
				</span>
			)}
			<Popover open={pSelectOpen} onOpenChange={setPSelectOpen}>
				<PopoverTrigger asChild>
					<Button
						size={buttonSize}
						disabled={disabled}
						onClick={() => setPSelectOpen(true)}
					>
						{(() => {
							const activePriority = value;
							if (activePriority) {
								const displayInfo = getPriorityDisplay(activePriority);
								const IconComponent = displayInfo.icon;
								return (
									<>
										{IconComponent && <IconComponent className="h-4 w-4" />}
										<span className="text-sm">{displayInfo.label}</span>
									</>
								);
							}
							// Default view
							return (
								<>
									{/* Default Sort Icon (SVG) */}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-4 w-4"
									>
										<path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16" />
									</svg>
									<span className="text-sm">Sort</span>
								</>
							);
						})()}
						<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandList>
							<CommandGroup heading="Select Priority" className="space-y-1">
								{/* Use the explicitly sorted array */}
								{priorities.map((priority) => {
									const displayInfo = getPriorityDisplay(priority);
									const IconComponent = displayInfo.icon;
									const isCurrent = priority === value;

									const handleSelect = () => {
										onChange(priority);
										setPSelectOpen(false);
									};

									return (
										<CommandItem
											key={priority}
											onSelect={handleSelect}
											className={cn(
												"flex items-center justify-between w-full",
												isCurrent && "bg-secondary",
											)}
										>
											<div className="flex items-center mr-2">
												{IconComponent && (
													<IconComponent
														className={cn(
															"mr-2 h-4 w-4 text-muted-foreground",
															displayInfo.iconClassName,
														)}
													/>
												)}
												<span
													className={cn(
														"text-sm text-primary-foreground",
														displayInfo.className,
													)}
												>
													{displayInfo.label}
												</span>
											</div>
											{isCurrent ? (
												<Check
													className={cn(
														"h-4 w-4 text-primary-foreground",
														displayInfo.iconClassName,
													)}
												/>
											) : null}
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
