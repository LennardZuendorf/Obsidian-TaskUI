import { CalendarIcon, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { parseDate } from "chrono-node";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { DateCategory } from "@/ui/lib/config/dateCategory";
import {
	dateToDateCategory,
	getDateCategoryDisplay,
} from "@/ui/lib/config/date";
import { cn } from "@/ui/utils";
import { Button } from "@/ui/base/Button";
import { Calendar } from "@/ui/base/Calendar";
import { Input } from "@/ui/base/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/base/Popover";

export interface DatePickerInputProps {
	label?: string;
	value: Date | null | undefined;
	onChange: (date: Date | null) => void;
	id?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	placeholder?: string;
	validation?: "any" | "future" | "past";
	className?: string;
	wrapperClassName?: string;
}

/**
 * Gets the display text for the input field - only shows DateCategory if applicable.
 * Returns the category label for Today, Tomorrow, This Week, and Next 7 Days.
 * For other dates, returns the formatted date.
 */
function getInputDisplayText(date: Date): string {
	const category = dateToDateCategory(date);
	
	const categoriesToShow = [
		DateCategory.TODAY,
		DateCategory.TOMORROW,
		DateCategory.THIS_WEEK,
		DateCategory.NEXT_7_DAYS,
	];
	
	if (categoriesToShow.includes(category)) {
		return category;
	}
	
	// For dates too far in the future, show formatted date
	return format(date, "MMMM d, yyyy");
}

/**
 * Gets the display text for the label preview (when not editing).
 * Uses the same logic as DateDisplay component for consistency.
 */
function getLabelDisplayText(date: Date): string {
	const category = dateToDateCategory(date);
	const config = getDateCategoryDisplay(category);

	const displayText = [
		DateCategory.TODAY,
		DateCategory.TOMORROW,
		DateCategory.THIS_WEEK,
		DateCategory.NEXT_7_DAYS,
	].includes(category)
		? config.label
		: format(date, "EEE, MMM d");

	return displayText;
}

/**
 * Validates a date against the validation prop.
 */
function validateDate(
	date: Date,
	validation: "any" | "future" | "past",
): boolean {
	if (validation === "any") {
		return true;
	}
	
	const today = startOfDay(new Date());
	const dateToCheck = startOfDay(date);
	
	if (validation === "future") {
		// Include today in "future" dates (common for scheduling)
		return !isBefore(dateToCheck, today);
	}
	
	if (validation === "past") {
		return isBefore(dateToCheck, today);
	}
	
	return true;
}

/**
 * DatePickerInput combines a natural language text input with a calendar popover.
 * Users can either type a date in natural language (e.g., "tomorrow", "in 2 days") 
 * or click the calendar button to select.
 * Uses modal={false} to avoid aria-hidden conflicts when used inside Obsidian modals.
 */
export function DatePickerInput({
	label,
	value,
	onChange,
	id,
	disabled,
	autoFocus,
	placeholder,
	validation = "any",
	className,
	wrapperClassName,
}: DatePickerInputProps) {
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [inputValue, setInputValue] = useState(
		value ? getInputDisplayText(value) : "",
	);
	const [month, setMonth] = useState<Date | undefined>(
		value ? new Date(value) : undefined,
	);
	const [isEditing, setIsEditing] = useState(false);
	const previousValueRef = useRef<Date | null | undefined>(value);

	// Initialize input value from prop, but only if not currently being edited
	useEffect(() => {
		// Only update from prop if:
		// 1. User is not currently editing
		// 2. The value actually changed (prevent unnecessary updates)
		if (!isEditing && value !== previousValueRef.current) {
			if (value) {
				setInputValue(getInputDisplayText(value));
				setMonth(new Date(value));
			} else {
				setInputValue("");
			}
			previousValueRef.current = value;
		}
	}, [value, isEditing]);

	const handleFocus = () => {
		// Mark as editing and clear the input when user starts editing
		setIsEditing(true);
		setInputValue("");
	};

	const handleBlur = () => {
		// Mark as no longer editing when user leaves the field
		setIsEditing(false);
		// Restore the display value if there's a valid date
		if (value) {
			setInputValue(getInputDisplayText(value));
		} else {
			setInputValue("");
		}
	};

	const handleInputChange = (newValue: string) => {
		// Mark as editing
		setIsEditing(true);
		setInputValue(newValue);
		
		// If input is empty, clear the date
		if (newValue.trim() === "") {
			onChange(null);
			setMonth(undefined);
			previousValueRef.current = null;
			return;
		}
		
		// Try to parse the input
		const parsedDate = parseDate(newValue);
		
		if (parsedDate && validateDate(parsedDate, validation)) {
			// Valid date parsed, update the date
			onChange(parsedDate);
			setMonth(new Date(parsedDate));
			previousValueRef.current = parsedDate;
			// Format the input value with category or formatted date
			setInputValue(getInputDisplayText(parsedDate));
			// Mark as no longer editing since we have a valid date
			setIsEditing(false);
		}
		// If parsing fails, keep the raw text so user can continue typing
	};

	const handleCalendarSelect = (date: Date | undefined) => {
		if (date) {
			setIsEditing(false);
			onChange(date);
			setInputValue(getInputDisplayText(date));
			setMonth(new Date(date));
			previousValueRef.current = date;
			setCalendarOpen(false);
		}
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsEditing(false);
		onChange(null);
		setInputValue("");
		setMonth(undefined);
		previousValueRef.current = null;
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setCalendarOpen(true);
		}
	};

	const inputElement = (
		<div className={cn("relative", className)}>
			<Input
				id={id}
				value={inputValue}
				onChange={handleInputChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				placeholder={
					placeholder ||
					(value
						? 'Change Date, i.e. "Today"'
						: 'Enter New Date, i.e. "Tomorrow"')
				}
				disabled={disabled}
				autoFocus={autoFocus}
				className={cn(value ? "pr-20" : "pr-10")}
			/>
			<div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
				{value && (
					<Button
						type="button"
						variant="ghost"
						disabled={disabled}
						className="size-6 p-0"
						aria-label="Clear date"
						onClick={handleClear}
						onPointerDown={(e) => e.stopPropagation()}
					>
						<X className="size-3.5" />
						<span className="sr-only">Clear date</span>
					</Button>
				)}
				<Popover modal={false} open={calendarOpen} onOpenChange={setCalendarOpen}>
					<PopoverTrigger asChild>
						<Button
							id="date-picker"
							type="button"
							variant="ghost"
							disabled={disabled}
							className="size-6 p-0"
							aria-label="Open calendar"
							onPointerDown={(e) => e.stopPropagation()}
						>
							<CalendarIcon className="size-3.5" />
							<span className="sr-only">Select date</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-auto overflow-hidden p-0"
						align="end"
						onOpenAutoFocus={(e) => e.preventDefault()}
					>
					<Calendar
						mode="single"
						selected={value || undefined}
						month={month}
						onMonthChange={setMonth}
						onSelect={handleCalendarSelect}
						disabled={
							validation === "future"
								? { before: new Date(new Date().setHours(0, 0, 0, 0)) }
								: validation === "past"
									? { after: new Date(new Date().setHours(23, 59, 59, 999)) }
									: undefined
						}
					/>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);

	if (label) {
		// When editing and value exists, show DateDisplay-style preview in label
		// When not editing, just show the label text (date is shown in input field)
		const showPreviewInLabel = isEditing && value;
		
		if (showPreviewInLabel) {
			const category = dateToDateCategory(value);
			const config = getDateCategoryDisplay(category);
			const Icon = config.icon;
			const displayText = getLabelDisplayText(value);
			
			return (
				<div className={cn("flex flex-col", wrapperClassName)}>
					<label
						htmlFor={id}
						className={cn(
							"text-xs mb-1 ml-1 flex items-center gap-1.5",
							config.className
						)}
					>
						<Icon className={cn("h-3.5 w-3.5", config.iconClassName)} />
						<span className="font-medium">{label}:</span>
						<span>{displayText}</span>
					</label>
					{inputElement}
				</div>
			);
		}
		
		// When not editing, just show the label text
		return (
			<div className={cn("flex flex-col", wrapperClassName)}>
				<label
					htmlFor={id}
					className="text-xs text-muted-foreground mb-1 ml-1"
				>
					{label}
				</label>
				{inputElement}
			</div>
		);
	}

	return inputElement;
}
