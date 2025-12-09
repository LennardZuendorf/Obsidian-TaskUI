import type { SortingState, Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronDown, LayoutGrid } from "lucide-react";
import { titleCase } from "title-case";
import { Button } from "../../../base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "../../../base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../base/Popover";
import { getColumnDisplay } from "../../../lib/displayConfig/columnDisplayConfig"; // Adjusted path
import { cn } from "../../../utils"; // Adjusted path

interface DTableGroupByProps<TData> {
	table: Table<TData>;
}

export function DTableGroupBy<TData>({ table }: DTableGroupByProps<TData>) {
	const grouping = table.getState().grouping;
	const sorting = table.getState().sorting; // Get current sorting state

	// Helper to get groupable columns based on table configuration
	const groupableColumns = table.getAllLeafColumns().filter((col) => {
		const canGroup = col.getCanGroup();
		const hasLabel = !!getColumnDisplay(col.id).label;
		return canGroup && hasLabel;
	});

	// Explicitly sort columns by label for stable display order in the popover
	const sortedDisplayGroupableColumns = [...groupableColumns].sort((a, b) => {
		const labelA = getColumnDisplay(a.id).label || "";
		const labelB = getColumnDisplay(b.id).label || "";
		return labelA.localeCompare(labelB);
	});

	return (
		<div className="flex flex-col">
			{/* Label always present, hidden when inactive */}
			<span
				className={cn(
					"text-xs text-muted-foreground mb-1 ml-1",
					grouping.length === 0 ? "opacity-0" : "opacity-100",
				)}
			>
				{titleCase("Group By")}
			</span>
			<Popover>
				<PopoverTrigger asChild>
					<Button className="gap-1">
						{(() => {
							const activeGroupId = grouping[0];

							if (activeGroupId) {
								const displayInfo = getColumnDisplay(activeGroupId);
								const IconComponent = displayInfo.icon;
								const groupSortEntry = sorting.find(
									(s) => s.id === activeGroupId,
								);

								return (
									<>
										{IconComponent && <IconComponent className="h-4 w-4" />}
										<span className="text-sm">{displayInfo.label}</span>
										{groupSortEntry &&
											(groupSortEntry.desc ? (
												<ArrowDown className="h-4 w-4 ml-1 opacity-70" />
											) : (
												<ArrowUp className="h-4 w-4 ml-1 opacity-70" />
											))}
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
						{grouping.length === 0 && ( // Show chevron only when no group is active
							<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandList>
							<CommandGroup heading={titleCase("Group By & Sort")}>
								{sortedDisplayGroupableColumns.map((col) => {
									const columnId = col.id;
									const displayInfo = getColumnDisplay(columnId);
									const IconComponent = displayInfo.icon;
									const columnLabel = displayInfo.label;

									const isCurrentlyGroupedByThisColumn =
										grouping[0] === columnId;

									const handleSelect = () => {
										const currentActiveGroupId = table.getState().grouping[0];
										const currentTableSorting = table.getState().sorting;
										let newSortingState: SortingState = [];

										// Find the sort entry specifically for the current active group, if any
										const currentGroupSortEntry = currentActiveGroupId
											? currentTableSorting.find(
													(s) => s.id === currentActiveGroupId,
												)
											: undefined;
										// Find any other sort that is not the active group sort (user's secondary preference)
										const userSecondarySort = currentTableSorting.find((s) =>
											currentActiveGroupId
												? s.id !== currentActiveGroupId
												: true,
										);

										if (columnId === currentActiveGroupId) {
											// Scenario A: Clicked the currently active group column
											if (
												currentGroupSortEntry &&
												!currentGroupSortEntry.desc
											) {
												// Was active and ASC, change to DESC
												newSortingState = [
													{
														id: columnId,
														desc: true,
													},
												];
												if (
													userSecondarySort &&
													userSecondarySort.id !== columnId
												)
													newSortingState.push(userSecondarySort);
												table.setSorting(newSortingState.slice(0, 2));
												// Grouping [columnId] remains unchanged
											} else if (
												currentGroupSortEntry &&
												currentGroupSortEntry.desc
											) {
												// Was active and DESC, clear grouping
												table.setGrouping([]);
												newSortingState =
													userSecondarySort && userSecondarySort.id !== columnId
														? [userSecondarySort]
														: [];
												table.setSorting(newSortingState.slice(0, 2)); // Ensure it's an array, max 2
											} else {
												// Group is active by columnId, but no matching sort or inconsistent state. Set to ASC.
												newSortingState = [
													{
														id: columnId,
														desc: false,
													},
												];
												if (
													userSecondarySort &&
													userSecondarySort.id !== columnId
												)
													newSortingState.push(userSecondarySort);
												table.setGrouping([columnId]); // Ensure grouping is set
												table.setSorting(newSortingState.slice(0, 2));
											}
										} else {
											// Scenario B: Clicked a new or different column to group by
											table.setGrouping([columnId]);
											newSortingState = [{ id: columnId, desc: false }]; // New group sort is ASC
											// Preserve the user's sort if it existed and is not the new group column
											const previousUserSort = currentTableSorting.find(
												(s) => s.id !== currentActiveGroupId,
											); // This was the effective user sort
											if (
												previousUserSort &&
												previousUserSort.id !== columnId
											) {
												newSortingState.push(previousUserSort);
											}
											table.setSorting(newSortingState.slice(0, 2));
										}
									};

									// Determine icon for the popover item
									let popoverItemIcon = null;
									if (isCurrentlyGroupedByThisColumn) {
										const groupSortEntryForThisItem = sorting.find(
											(s) => s.id === columnId,
										);
										if (
											groupSortEntryForThisItem &&
											!groupSortEntryForThisItem.desc
										) {
											popoverItemIcon = (
												<ArrowUp className="h-4 w-4 opacity-70" />
											);
										} else if (
											groupSortEntryForThisItem &&
											groupSortEntryForThisItem.desc
										) {
											popoverItemIcon = (
												<ArrowDown className="h-4 w-4 opacity-70" />
											);
										} else {
											// Default for an active group if somehow sort state is missing (should be ASC by default)
											popoverItemIcon = (
												<ArrowUp className="h-4 w-4 opacity-70" />
											);
										}
									} else {
										// Not currently grouped by this column, show nothing or a generic group icon if desired
									}

									return (
										<CommandItem
											key={columnId}
											onSelect={handleSelect}
											className="flex items-center justify-between w-full"
										>
											<div className="flex items-center mr-2">
												{IconComponent && (
													<IconComponent className="mr-2 h-4 w-4 text-muted-foreground" />
												)}
												<span>{columnLabel}</span>
											</div>
											{/* Display the determined icon (ArrowUp, ArrowDown, or null) */}
											{popoverItemIcon}
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
										const currentActiveGroupId = table.getState().grouping[0];
										const currentTableSorting = table.getState().sorting;
										table.setGrouping([]);
										// Preserve user's secondary sort if it existed
										const userSecondarySort = currentTableSorting.find((s) =>
											currentActiveGroupId
												? s.id !== currentActiveGroupId
												: true,
										);
										table.setSorting(
											userSecondarySort ? [userSecondarySort] : [],
										);
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
