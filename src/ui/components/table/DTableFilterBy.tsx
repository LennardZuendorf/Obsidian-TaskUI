import { Table } from "@tanstack/react-table";
import { Check, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
// Adjust path as needed
import { TaskPriority, TaskStatus } from "@/data/types/tasks"; // Adjust path as needed
import { Badge } from "@/ui/base/Badge";
import { Button } from "@/ui/base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/ui/base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/base/Popover";
import { getColumnDisplay } from "@/ui/lib/config/column";
import { priorityEnumToString } from "@/ui/lib/config/priority";
import { statusEnumToString } from "@/ui/lib/config/status";
import { cn } from "@/ui/utils"; // Adjust path as needed

interface DTableFilterByProps<TData> {
	table: Table<TData>;
}

// Helper to get filterable columns (adjust criteria as needed)
function getFilterableColumns<TData>(table: Table<TData>) {
	return table.getAllLeafColumns().filter((col) => {
		const canFilter = col.getCanFilter();
		const hasLabel = !!getColumnDisplay(col.id).label;
		const isAllowed =
			![col.id, col.accessorFn?.toString()].includes("scheduledDate") &&
			![col.id, col.accessorFn?.toString()].includes("dueDate");
		return canFilter && hasLabel && isAllowed;
	});
}

export function DTableFilterBy<TData>({ table }: DTableFilterByProps<TData>) {
	const [selectedFilterColumnId, setSelectedFilterColumnId] = useState<
		string | null
	>(null);
	const columnFilters = table.getState().columnFilters;
	const filterableColumns = getFilterableColumns(table);

	// Define options for specific filter types
	const filterOptionsMap: Record<string, { value: string; label: string }[]> = {
		status:
			Object.values(TaskStatus).map((val) => ({
				value: val,
				label: statusEnumToString[val],
			})) || [],
		priority:
			Object.values(TaskPriority).map((val) => ({
				value: val,
				label: priorityEnumToString[val],
			})) || [],
		scheduledDateCategory:
			[
				"Today",
				"Tomorrow",
				"This Week",
				"Next Week",
				"Later",
				"No Date",
				"Overdue", // Added Overdue
			].map((val) => ({ value: val, label: val })) || [],
		dueDateCategory:
			[
				"Today",
				"Tomorrow",
				"This Week",
				"Next Week",
				"Later",
				"No Date",
				"Overdue", // Added Overdue
			].map((val) => ({ value: val, label: val })) || [],
	};

	const handleFilterSelect = (columnId: string, value: unknown) => {
		const currentFilter = columnFilters.find((f) => f.id === columnId);

		// Check if the selected value is the same as the current filter's value
		// Need to handle potential type differences if value isn't just string
		if (currentFilter?.value === value) {
			// Remove filter if same value is selected again
			table.setColumnFilters((prev) => prev.filter((f) => f.id !== columnId));
		} else {
			// Set/Replace filter for this column
			table.setColumnFilters((prev) => [
				...prev.filter((f) => f.id !== columnId),
				{ id: columnId, value }, // value passed as unknown is acceptable here for state
			]);
		}
		setSelectedFilterColumnId(null); // Close options list after selection
	};

	const getFilterValueLabel = (columnId: string, value: unknown): string => {
		if (columnId === "status") {
			// Check if value is a valid TaskStatus before using it as key
			const statusKey = value as TaskStatus;
			if (Object.values(TaskStatus).includes(statusKey)) {
				return statusEnumToString[statusKey] || String(value);
			}
		} else if (columnId === "priority") {
			// Check if value is a valid TaskPriority before using it as key
			const priorityKey = value as TaskPriority;
			if (Object.values(TaskPriority).includes(priorityKey)) {
				return priorityEnumToString[priorityKey] || String(value);
			}
		}
		// For category filters or if type check fails, return string representation
		return String(value);
	};

	return (
		<div className="flex flex-col">
			{/* Label always present, hidden when inactive */}
			<span
				className={cn(
					"text-xs text-muted-foreground mb-1 ml-1",
					columnFilters.length === 0 ? "opacity-0" : "opacity-100",
				)}
			>
				Filter by:
			</span>
			<Popover
				onOpenChange={(open) => {
					if (!open) {
						setSelectedFilterColumnId(null);
					}
				}}
			>
				<PopoverTrigger asChild>
					<Button className="gap-1 flex items-center">
						{(() => {
							if (columnFilters.length === 1) {
								const filter = columnFilters[0];
								const displayInfo = getColumnDisplay(filter.id);
								const IconComponent = displayInfo.icon;
								return (
									<>
										{IconComponent && <IconComponent className="h-4 w-4" />}
										<span className="text-sm">{displayInfo.label}</span>
									</>
								);
							} else if (columnFilters.length > 1) {
								return (
									<div className="flex items-center -space-x-0.25">
										{columnFilters.slice(0, 4).map((filter) => {
											const displayInfo = getColumnDisplay(filter.id);
											const IconComponent = displayInfo.icon;
											return IconComponent ? (
												<IconComponent key={filter.id} className="h-4 w-4" />
											) : null;
										})}
									</div>
								);
							}
							// Default view
							return (
								<>
									<Filter className="h-4 w-4" />
									<span className="text-sm">Filter</span>
								</>
							);
						})()}
						{columnFilters.length > 0 && (
							<Badge
								variant="secondary"
								className="ml-1 rounded-full px-1.5 py-0.5 text-xs"
							>
								{columnFilters.length}
							</Badge>
						)}
						<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-[250px] p-0"
					// Reset selected column when popover closes
					onInteractOutside={() => setSelectedFilterColumnId(null)}
					onCloseAutoFocus={() => setSelectedFilterColumnId(null)}
				>
					{columnFilters.length > 0 && (
						<div className="p-2 border-b border-input">
							<div className="flex justify-between items-center mb-1">
								<span className="text-xs font-semibold text-muted-foreground">
									Active Filters:
								</span>
							</div>
							<div className="flex flex-wrap gap-1">
								{columnFilters.map((filter) => {
									const displayInfo = getColumnDisplay(filter.id);
									const IconComponent = displayInfo.icon;
									const valueLabel = getFilterValueLabel(
										filter.id,
										filter.value,
									);
									return (
										<Badge
											key={filter.id}
											variant="secondary"
											className="text-xs px-1.5 py-0.5"
											onRemove={() =>
												table.setColumnFilters((prev) =>
													prev.filter((f) => f.id !== filter.id),
												)
											}
											removeAriaLabel={`Remove filter ${displayInfo.label}: ${valueLabel}`}
											icon={
												IconComponent ? (
													<IconComponent className="h-3 w-3" />
												) : null
											}
										>
											{valueLabel}
										</Badge>
									);
								})}
							</div>
						</div>
					)}
					<Command>
						<CommandList>
							{selectedFilterColumnId ? (
								// Show Options for Selected Column
								(() => {
									const column =
										filterableColumns.find(
											(col) => col.id === selectedFilterColumnId,
										) || null;

									if (!column) return null;

									const columnId = column.id;
									const columnLabel =
										getColumnDisplay(columnId).label || columnId;
									const filterOptions = filterOptionsMap[columnId] || [];
									const currentFilterValue = columnFilters.find(
										(f) => f.id === columnId,
									)?.value;

									return (
										<CommandGroup heading={columnLabel}>
											<CommandItem
												onSelect={() => setSelectedFilterColumnId(null)}
												className="text-muted-foreground"
											>
												&larr; Back
											</CommandItem>
											{filterOptions.map(({ value, label }) => {
												const isSelected = currentFilterValue === value;
												return (
													<CommandItem
														key={`${columnId}-${value}`}
														onSelect={() => handleFilterSelect(columnId, value)}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																isSelected ? "opacity-100" : "opacity-0",
															)}
														/>
														{label}
													</CommandItem>
												);
											})}
										</CommandGroup>
									);
								})()
							) : (
								// Show List of Columns
								<>
									<CommandGroup heading="Filter by Column">
										{filterableColumns.map((col) => {
											const columnId = col.id;
											const displayInfo = getColumnDisplay(columnId);
											const IconComponent = displayInfo.icon;
											const columnLabel = displayInfo.label;

											if (!columnLabel) return null;

											const currentFilter = columnFilters.find(
												(filter) => filter.id === columnId,
											);

											return (
												<CommandItem
													key={columnId}
													onSelect={() => setSelectedFilterColumnId(columnId)}
													className="flex items-center justify-between w-full"
												>
													<div className="flex items-center mr-2">
														{IconComponent && (
															<IconComponent className="mr-2 h-4 w-4 text-muted-foreground" />
														)}
														<span>{columnLabel}</span>
													</div>
													{currentFilter && (
														<span className="ml-auto text-xs text-muted-foreground">
															{getFilterValueLabel(
																columnId,
																currentFilter.value,
															)}
														</span>
													)}
												</CommandItem>
											);
										})}
									</CommandGroup>
									<CommandGroup>
										<CommandItem
											disabled={columnFilters.length === 0}
											onSelect={() => table.setColumnFilters([])}
											className="border-t border-input pt-2 mt-2 text-muted-foreground hover:text-foreground"
										>
											Clear All Filters
										</CommandItem>
									</CommandGroup>
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
