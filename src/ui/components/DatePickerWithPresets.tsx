"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "../base/Button";
import { Calendar } from "../base/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../base/Popover";
import { cn } from "../utils/cn";

interface DatePickerProps {
	className?: string;
	value?: Date | null;
	onChange: (value: Date | undefined) => void;
}

export function DatePickerWithPresets({
	className = "",
	value = null,
	onChange,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [internalDate, setInternalDate] = React.useState<Date | undefined>(
		value ?? undefined,
	);

	React.useEffect(() => {
		setInternalDate(value ?? undefined);
	}, [value]);

	const handleSelect = (selectedDate: Date | undefined) => {
		setInternalDate(selectedDate);
		onChange(selectedDate);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-[240px] justify-start text-left font-normal",
						className,
						!internalDate && "text-muted-foreground",
					)}
					onClick={(e) => e.stopPropagation()}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{internalDate ? (
						format(internalDate, "PPP")
					) : (
						<span>Pick a date</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0"
				align="start"
				onPointerDownOutside={(e) => e.preventDefault()}
				onClick={(e) => e.stopPropagation()}
			>
				<Calendar
					mode="single"
					selected={internalDate}
					onSelect={handleSelect}
				/>
			</PopoverContent>
		</Popover>
	);
}
