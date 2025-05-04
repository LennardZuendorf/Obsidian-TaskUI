import { Table } from "@tanstack/react-table";
import { Check, ChevronDown, LayoutGrid } from "lucide-react";
import React from "react";

import { Button } from "../../../base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "../../../base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../base/Popover";
import { getColumnDisplayInfo } from "../../../lib/tableColumnDisplay"; // Adjusted path
import { cn } from "../../../utils"; // Adjusted path

interface DTableGroupByProps<TData> {
	table: Table<TData>;
}

export function DTableGroupBy<TData>({ table }: DTableGroupByProps<TData>) {
	const grouping = table.getState().grouping;

	// Helper to get groupable columns based on table configuration
	const groupableColumns = table.getAllLeafColumns().filter((col) => {
		const canGroup = col.getCanGroup();
		const hasLabel = !!getColumnDisplayInfo(col.id).label;
		const isAllowed =
			![col.id, col.accessorFn?.toString()].includes("scheduledDate") &&
			![col.id, col.accessorFn?.toString()].includes("dueDate");
		return canGroup && hasLabel && isAllowed;
	});

	const groupableColumnIds = groupableColumns.map((col) => col.id);

	return (
		<div className="flex flex-col">
			{/* Label always present, hidden when inactive */}
			<span
				className={cn(
					"text-xs text-muted-foreground mb-1 ml-1",
					grouping.length === 0 ? "opacity-0" : "opacity-100",
				)}
			>
				Group By:
			</span>
			<Popover>
				<PopoverTrigger asChild>
					<Button className="gap-1">
						{(() => {
							const activeGroupId = grouping[0];
							if (activeGroupId) {
								const displayInfo =
									getColumnDisplayInfo(activeGroupId);
								const IconComponent = displayInfo.icon;
								return (
									<>
										{IconComponent && (
											<IconComponent className="h-4 w-4" />
										)}
										<span className="text-sm">
											{displayInfo.label}
										</span>
									</>
								);
							}
							// Default view
							return (
								<>
									<LayoutGrid className="h-4 w-4" />
									<span className="text-sm">Group</span>
								</>
							);
						})()}
						<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandList>
							<CommandGroup heading="Group by">
								{groupableColumnIds.map((columnId) => {
									const displayInfo =
										getColumnDisplayInfo(columnId);
									const IconComponent = displayInfo.icon;
									const isSelected = grouping[0] === columnId;

									return (
										<CommandItem
											key={columnId}
											onSelect={() => {
												// Use table's API to set grouping
												table.setGrouping([columnId]);
											}}
											className="flex items-center justify-between w-full"
										>
											<div className="flex items-center mr-2">
												{IconComponent && (
													<IconComponent className="mr-2 h-4 w-4 text-muted-foreground" />
												)}
												<span>{displayInfo.label}</span>
											</div>
											<Check
												className={cn(
													"h-4 w-4",
													isSelected
														? "opacity-100"
														: "opacity-0",
												)}
											/>
										</CommandItem>
									);
								})}
							</CommandGroup>
							<CommandGroup>
								<CommandItem
									aria-disabled={grouping.length === 0}
									aria-label="Clear the Grouping"
									disabled={grouping.length === 0}
									onSelect={() => {
										// Use table's API to clear grouping
										table.setGrouping([]);
									}}
									className="border-t border-input pt-2 mt-2 text-muted-foreground hover:text-foreground"
								>
									Clear Grouping
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
