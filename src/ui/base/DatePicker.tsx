import { Button } from "./Button";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { cn } from "../utils";
import { Calendar } from "./Calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

export function DatePicker() {
	const [date, setDate] = React.useState<Date>();
	const [pSelectOpen, setPSelectOpen] = React.useState(false);

	return (
		<>
			<Popover open={pSelectOpen} onOpenChange={setPSelectOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-[240px] justify-start text-left font-normal",
							!date && "text-muted-foreground",
						)}
						onClick={() => setPSelectOpen(true)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? format(date, "PPP") : <span>Pick a date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={(newDate) => {
							setDate(newDate);
							setPSelectOpen(false);
						}}
						autoFocus={false}
					/>
				</PopoverContent>
			</Popover>
		</>
	);
}
