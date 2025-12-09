import { Check, ChevronDown } from "lucide-react";
import React from "react";
import type { EnumDisplayConfig } from "../lib/displayConfig/displayConfigTypes";
import { cn } from "../utils";
import { Button, ButtonProps } from "./Button";
import { Command, CommandGroup, CommandItem, CommandList } from "./Command";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export interface EnumSelectProps<TEnum> {
	value: TEnum | null;
	onChange: (value: TEnum) => void;
	options: EnumDisplayConfig[];
	disabled?: boolean;
	className?: string;
	buttonSize?: ButtonProps["size"];
	showLabel?: boolean;
	label?: string;
	placeholder?: string;
	groupHeading?: string;
}

/**
 * Generic select component for enum-based values with display configurations.
 * Supports status, priority, date categories, and any other enum with display config.
 */
export function EnumSelect<TEnum>({
	value,
	onChange,
	options,
	disabled,
	className,
	buttonSize = "default",
	showLabel = false,
	label = "Select",
	placeholder = "Select option",
	groupHeading,
}: EnumSelectProps<TEnum>) {
	const [isOpen, setIsOpen] = React.useState(false);

	// Find the display config for the current value
	const selectedDisplay = options.find((opt) => {
		// Handle both enum values and objects with enum property
		const optEnum = "enum" in opt ? opt.enum : opt;
		return optEnum === value;
	});

	return (
		<div className={cn("flex flex-col", className)}>
			{showLabel && (
				<span
					className={cn(
						"text-xs text-muted-foreground mb-1 ml-1",
						value == null ? "opacity-0" : "opacity-100",
					)}
				>
					{label}
				</span>
			)}
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						size={buttonSize}
						disabled={disabled}
						onClick={() => setIsOpen(true)}
						aria-label={disabled ? label : `Edit ${label}`}
					>
						{selectedDisplay ? (
							<>
								{selectedDisplay.icon && (
									<selectedDisplay.icon
										className={cn("h-4 w-4", selectedDisplay.iconClassName)}
									/>
								)}
								<span className={cn("text-sm", selectedDisplay.className)}>
									{selectedDisplay.label}
								</span>
							</>
						) : (
							<>
								<span className="text-sm text-muted-foreground">
									{placeholder}
								</span>
							</>
						)}
						<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandList>
							<CommandGroup heading={groupHeading}>
								{options.map((option) => {
									const optionEnum = "enum" in option ? option.enum : option;
									const IconComponent = option.icon;
									const isSelected = optionEnum === value;

									return (
										<CommandItem
											key={String(optionEnum)}
											onSelect={() => {
												onChange(optionEnum as TEnum);
												setIsOpen(false);
											}}
											className={cn(
												"flex items-center justify-between w-full cursor-pointer",
												isSelected && "bg-secondary",
											)}
											aria-selected={isSelected}
										>
											<div className="flex items-center mr-2">
												{IconComponent && (
													<IconComponent
														className={cn("mr-2 h-4 w-4", option.iconClassName)}
													/>
												)}
												<span className={cn("text-sm", option.className)}>
													{option.label}
												</span>
											</div>
											{isSelected && <Check className="h-4 w-4" />}
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

