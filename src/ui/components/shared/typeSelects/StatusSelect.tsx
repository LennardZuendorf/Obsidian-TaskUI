import { ArrowUp, ChevronsUpDown } from "lucide-react";
import React from "react";
import type { TaskStatus } from "../../../../data/types/tasks";
import { Button } from "../../../base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "../../../base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../base/Popover";
import {
	getStatusDisplay,
	getStatusDisplayConfig,
} from "../../../lib/displayConfig/statusDisplayConfig";
import { cn } from "../../../utils";

export type StatusSelectProps = {
	value: TaskStatus | null;
	onChange: (status: TaskStatus) => void;
	disabled?: boolean;
	className?: string;
};

export function StatusSelect({
	value,
	onChange,
	disabled,
	className,
}: StatusSelectProps) {
	const [sSelectOpen, setSSelectOpen] = React.useState(false);

	const statuses = getStatusDisplayConfig();
	const selectedDisplay = getStatusDisplay(value);

	return (
		<div className={cn("flex flex-col", className)}>
			<span
				className={cn(
					"text-xs text-muted-foreground mb-1 ml-1",
					value == null ? "opacity-0" : "opacity-100",
				)}
			>
				Status
			</span>
			<Popover open={sSelectOpen} onOpenChange={setSSelectOpen}>
				<PopoverTrigger asChild>
					<Button
						className="gap-1"
						disabled={disabled}
						aria-label="Select status"
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
										Select status
									</span>
								</>
							);
						})()}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandList>
							<CommandGroup heading="Status">
								{statuses.map((status) => {
									const IconComponent = status.icon;
									const isSelected = value === status.enum;
									return (
										<CommandItem
											key={status.enum}
											onSelect={() => {
												onChange(status.enum);
												setSSelectOpen(false);
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
															status.iconClassName,
														)}
													/>
												)}
												<span>{status.label}</span>
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
