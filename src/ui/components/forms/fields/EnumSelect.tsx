import { Check, ChevronDown } from "lucide-react";
import React from "react";
import type { EnumDisplayConfig } from "@/ui/lib/config/types";
import { cn } from "@/ui/utils";
import { Button, ButtonProps } from "@/ui/base/Button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/ui/base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/base/Popover";

export interface EnumSelectProps<TEnum> {
	value: TEnum | null;
	onChange: (value: TEnum) => void;
	options: EnumDisplayConfig[];
	disabled?: boolean;
	className?: string;
	buttonSize?: ButtonProps["size"];
	buttonVariant?: ButtonProps["variant"];
	showLabel?: boolean;
	showInnerLabel?: boolean;
	showChevron?: boolean;
	label?: string;
	placeholder?: string;
	groupHeading?: string;
}

export interface EnumCommandListProps<TEnum> {
	value: TEnum | null;
	onChange: (value: TEnum) => void;
	options: EnumDisplayConfig[];
	groupHeading?: string;
	onSelect?: () => void;
}

/**
 * Command list component for enum-based values with display configurations.
 * Can be used standalone or within EnumSelect.
 */
export function EnumCommandList<TEnum>({
	value,
	onChange,
	options,
	groupHeading,
	onSelect,
}: EnumCommandListProps<TEnum>) {
	return (
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
									onSelect?.();
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
											className={cn("mr-2 h-5 w-5", option.iconClassName)}
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
	);
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
	buttonVariant = "default",
	showLabel = false,
	showInnerLabel = true,
	showChevron = true,
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
						type="button"
						variant={buttonVariant}
						size={buttonSize}
						disabled={disabled}
						onPointerDown={(e) => e.stopPropagation()}
						aria-label={disabled ? label : `Edit ${label}`}
					>
						{selectedDisplay ? (
							<>
								{selectedDisplay.icon && (
									<selectedDisplay.icon
										className={cn("h-5 w-5", selectedDisplay.iconClassName)}
									/>
								)}
								{showInnerLabel && (
									<span className={cn("text-sm", selectedDisplay.className)}>
										{selectedDisplay.label}
									</span>
								)}
							</>
						) : (
							<>
								<span className="text-sm text-muted-foreground">
									{placeholder}
								</span>
							</>
						)}
						{showChevron && <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<EnumCommandList
						value={value}
						onChange={onChange}
						options={options}
						groupHeading={groupHeading}
						onSelect={() => setIsOpen(false)}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export interface EnumIconButtonProps<TEnum> {
	value: TEnum | null;
	onChange: (value: TEnum) => void;
	options: EnumDisplayConfig[];
	disabled?: boolean;
	className?: string;
	size?: ButtonProps["size"];
	variant?: ButtonProps["variant"];
	iconSize?: string;
	onClick?: (e: React.MouseEvent) => void;
	ariaLabel?: string;
}

/**
 * Icon-only button that cycles through enum values on click.
 * Displays the current value's icon and cycles to the next value when clicked.
 * Values are cycled in the order defined by the options' `order` property.
 */
export function EnumIconButton<TEnum>({
	value,
	onChange,
	options,
	disabled,
	className,
	size = "icon",
	variant = "ghost",
	iconSize = "h-4 w-4",
	onClick,
	ariaLabel,
}: EnumIconButtonProps<TEnum>) {
	// Get ordered enum values from options
	const orderedEnums = React.useMemo(() => {
		return options
			.map((opt) => {
				// Handle both enum values and objects with enum property
				const optEnum = "enum" in opt ? opt.enum : opt;
				return { enum: optEnum as TEnum, order: opt.order ?? 0 };
			})
			.sort((a, b) => a.order - b.order)
			.map((item) => item.enum);
	}, [options]);

	// Find the display config for the current value
	const selectedDisplay = options.find((opt) => {
		const optEnum = "enum" in opt ? opt.enum : opt;
		return optEnum === value;
	}) || options[0];

	// Calculate next value for aria label
	const getNextValue = React.useMemo(() => {
		if (orderedEnums.length === 0) return null;
		
		const currentIndex = value != null 
			? orderedEnums.findIndex((e) => e === value)
			: -1;
		
		const nextIndex = currentIndex >= 0 
			? (currentIndex + 1) % orderedEnums.length
			: 0;
		
		return orderedEnums[nextIndex];
	}, [value, orderedEnums]);

	// Find display config for next value
	const nextDisplay = getNextValue != null
		? options.find((opt) => {
			const optEnum = "enum" in opt ? opt.enum : opt;
			return optEnum === getNextValue;
		}) || options[0]
		: null;

	// Cycle to next value on click
	const handleClick = (e: React.MouseEvent) => {
		if (disabled) return;
		onClick?.(e);
		
		if (orderedEnums.length === 0 || getNextValue == null) return;
		
		onChange(getNextValue);
	};

	const IconComponent = selectedDisplay?.icon;
	const currentLabel = selectedDisplay?.label || "Unknown";
	const nextLabel = nextDisplay?.label || "Unknown";
	
	// Generate dynamic aria label
	const dynamicAriaLabel = ariaLabel || 
		`Current: ${currentLabel}. Click to change to ${nextLabel}.`;

	return (
		<Button
			variant={variant}
			size={size}
			disabled={disabled}
			onClick={handleClick}
			className={cn("flex-shrink-0", className)}
			aria-label={dynamicAriaLabel}
		>
			{IconComponent && (
				<IconComponent
					className={cn(iconSize, selectedDisplay?.iconClassName)}
				/>
			)}
		</Button>
	);
}

export interface EnumIconSelectProps<TEnum> {
	value: TEnum | null;
	onChange: (value: TEnum) => void;
	options: EnumDisplayConfig[];
	disabled?: boolean;
	className?: string;
	size?: ButtonProps["size"];
	variant?: ButtonProps["variant"];
	iconSize?: string;
	groupHeading?: string;
	ariaLabel?: string;
}

/**
 * Icon-only button that opens a popover select on click.
 * Displays the current value's icon and opens a popover menu when clicked.
 */
export function EnumIconSelect<TEnum>({
	value,
	onChange,
	options,
	disabled,
	className,
	size = "icon",
	variant = "ghost",
	iconSize = "h-4 w-4",
	groupHeading,
	ariaLabel,
}: EnumIconSelectProps<TEnum>) {
	const [isOpen, setIsOpen] = React.useState(false);

	// Find the display config for the current value
	const selectedDisplay = options.find((opt) => {
		const optEnum = "enum" in opt ? opt.enum : opt;
		return optEnum === value;
	}) || options[0];

	const IconComponent = selectedDisplay?.icon;
	const displayLabel = selectedDisplay?.label || "Unknown";

	return (
		<Popover modal={false} open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant={variant}
					size={size}
					disabled={disabled}
					onPointerDown={(e) => e.stopPropagation()}
					className={cn("flex-shrink-0", className)}
					aria-label={ariaLabel || `${displayLabel}. Click to select.`}
				>
					{IconComponent && (
						<IconComponent
							className={cn(iconSize, selectedDisplay?.iconClassName)}
						/>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent 
				className="w-[200px] p-0" 
				align="start"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<EnumCommandList
					value={value}
					onChange={onChange}
					options={options}
					groupHeading={groupHeading}
					onSelect={() => setIsOpen(false)}
				/>
			</PopoverContent>
		</Popover>
	);
}
