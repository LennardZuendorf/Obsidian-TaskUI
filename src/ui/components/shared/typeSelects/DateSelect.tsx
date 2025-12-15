import React from "react";
import type { ButtonProps } from "../../../base/Button";
import { Calendar } from "../../../base/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../base/Popover";
import { Button } from "../../../base/Button";
import { getMatchingDisplay } from "../../../lib/displayConfig/utils";
import { cn } from "../../../utils";
import { ChevronDown } from "lucide-react";

export type DateSelectProps = {
	value: Date | null;
	type: "dueDate" | "scheduledDate";
	onChange: (date: Date) => void;
	disabled?: boolean;
	className?: string;
	buttonSize?: ButtonProps["size"];
	showLabel?: boolean;
};

/**
 * DateSelect component for selecting dates with a calendar interface.
 * Unlike other selects, this uses a calendar picker rather than enum options.
 */
export function DateSelect({
	value,
	onChange,
	disabled,
	className,
	buttonSize = "default",
	showLabel = false,
}: DateSelectProps) {
	const [dSelectOpen, setDSelectOpen] = React.useState(false);

	return (
		<div className={cn("flex flex-col", className)}>
			{showLabel && (
				<span
					className={cn(
						"text-xs text-muted-foreground mb-1 ml-1",
						value == null ? "opacity-0" : "opacity-100",
					)}
				>
					Date
				</span>
			)}
		<Popover modal={false} open={dSelectOpen} onOpenChange={setDSelectOpen}>
			<PopoverTrigger asChild>
				<Button
					size={buttonSize}
					disabled={disabled}
					onClick={() => setDSelectOpen(true)}
				>
					{(() => {
						if (value) {
							const displayInfo = getMatchingDisplay(value);
							const IconComponent = displayInfo.icon;
							return (
								<>
									{IconComponent && (
										<IconComponent
											className={cn("h-4 w-4", displayInfo.iconClassName)}
										/>
									)}
									<span className={cn("text-sm", displayInfo.className)}>
										{displayInfo.label}
									</span>
								</>
							);
						}
						// Default view when no value is set
						return (
							<>
								<span className="text-sm text-muted-foreground">
									Select Date
								</span>
							</>
						);
					})()}
					<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={value || undefined}
					onSelect={(date) => {
						if (date) {
							onChange(date);
							setDSelectOpen(false);
						}
					}}
				/>
			</PopoverContent>
		</Popover>
		</div>
	);
}
