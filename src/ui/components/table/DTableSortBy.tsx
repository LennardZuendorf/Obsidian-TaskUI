import type { SortingState } from "@tanstack/react-table";
import { Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { titleCase } from "title-case";

import { Button } from "@/ui/base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/ui/base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/base/Popover";
import { getColumnDisplay } from "@/ui/lib/config/column";
import { cn } from "@/ui/utils"; // Adjusted path

interface DTableSortByProps<TData> {
	table: Table<TData>;
}

// Helper function to get sortable columns (moved here or keep in DTable and pass as prop)
function getSortableColumns<TData>(table: Table<TData>) {
	// Filter leaf columns that have sorting enabled and a label for display
	return table
		.getAllLeafColumns()
		.filter((col) => col.getCanSort() && getColumnDisplay(col.id).label);
}

export function DTableSortBy<TData>({ table }: DTableSortByProps<TData>) {
	const sorting = table.getState().sorting;
	const grouping = table.getState().grouping;
	const sortableColumns = getSortableColumns(table);

	// Explicitly sort columns by label for stable display order
	const sortedDisplayColumns = [...sortableColumns].sort((a, b) => {
		const labelA = getColumnDisplay(a.id).label || "";
		const labelB = getColumnDisplay(b.id).label || "";
		return labelA.localeCompare(labelB);
	});

	// Determine which sort entry to display on the button (user-defined sort)
	let displaySortEntry: SortingState[0] | undefined;
	const activeGroupId = grouping[0];
	if (activeGroupId) {
		// If grouping, displaySortEntry is sorting[1] if it exists and sorting[0] is the group sort
		if (sorting.length > 1 && sorting[0]?.id === activeGroupId) {
			displaySortEntry = sorting[1];
		}
	} else {
		// No grouping, displaySortEntry is sorting[0]
		displaySortEntry = sorting.length > 0 ? sorting[0] : undefined;
	}

	// Determine if the "Clear Sort" button should be active for the user-defined sort
	let canClearUserSort = false;
	if (activeGroupId) {
		canClearUserSort = !!(
			sorting.length > 1 &&
			sorting[0]?.id === activeGroupId &&
			sorting[1]
		);
	} else {
		canClearUserSort = !!(sorting.length > 0 && sorting[0]);
	}

	return (
		<div className="flex flex-col">
			{/* Label shown only if a user-defined sort is active */}
			<span
				className={cn(
					"text-xs text-muted-foreground mb-1 ml-1",
					displaySortEntry ? "opacity-100" : "opacity-0",
				)}
			>
				{titleCase("Sort By:")}
			</span>
			<Popover>
				<PopoverTrigger asChild>
					<Button className="gap-1">
						{(() => {
							if (displaySortEntry) {
								const displayInfo = getColumnDisplay(displaySortEntry.id);
								const IconComponent = displayInfo.icon;
								return (
									<>
										{IconComponent && <IconComponent className="h-4 w-4" />}
										<span className="text-sm">{displayInfo.label}</span>
										{displaySortEntry.desc ? (
											<ArrowDown className="h-4 w-4 ml-1" />
										) : (
											<ArrowUp className="h-4 w-4 ml-1" />
										)}
									</>
								);
							}
							// Default view (no displayable sort or only group sort active)
							return (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-4 w-4"
									>
										<path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16" />
									</svg>
									<span className="text-sm">Sort</span>
								</>
							);
						})()}
						{/* Show chevron when no user-defined sort is active */}
						{sorting.length === 0 && (
							<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandList>
							<CommandGroup heading={titleCase("Sort by")}>
								{sortedDisplayColumns.map((col) => {
									const columnId = col.id;
									const displayInfo = getColumnDisplay(columnId);
									const IconComponent = displayInfo.icon;
									const columnLabel = displayInfo.label;

									// Determine sort state for this columnId based on user-defined sort context
									let columnSortEntryForDisplay: SortingState[0] | undefined;
									const currentTableSorting = table.getState().sorting; // Get fresh state
									const currentActiveGroupId = table.getState().grouping[0];

									if (currentActiveGroupId) {
										// Grouping active: icon reflects state of sorting[1] if columnId matches sorting[1]
										if (
											currentTableSorting.length > 1 &&
											currentTableSorting[0]?.id === currentActiveGroupId &&
											currentTableSorting[1]?.id === columnId
										) {
											columnSortEntryForDisplay = currentTableSorting[1];
										}
										// If columnId is the active group, it should appear neutral in this popover
									} else {
										// No grouping: icon reflects state of sorting[0] if columnId matches sorting[0]
										if (
											currentTableSorting.length > 0 &&
											currentTableSorting[0]?.id === columnId
										) {
											columnSortEntryForDisplay = currentTableSorting[0];
										}
									}
									const isCurrentlySortedByUser = !!columnSortEntryForDisplay;
									const isDescByUser = columnSortEntryForDisplay
										? !!columnSortEntryForDisplay.desc
										: false;

									const handleSelect = () => {
										const currentFullSorting = table.getState().sorting;
										const currentGroupId = table.getState().grouping[0]; // Renamed for clarity
										let newSortState: SortingState = [];

										if (currentGroupId) {
											const groupSortEntry = currentFullSorting.find(
												(s) => s.id === currentGroupId,
											);
											if (!groupSortEntry) {
												// This case should ideally not happen if grouping always sets a sort
												table.setSorting([]);
												return;
											}
											newSortState.push(groupSortEntry); // Always preserve group sort as sorting[0]

											// DTableSortBy only manages sorting[1] when grouping is active
											// It will NOT change sorting[0] (group sort) even if columnId matches currentGroupId
											const currentSecondarySort =
												currentFullSorting.length > 1 &&
												currentFullSorting[0]?.id === currentGroupId
													? currentFullSorting[1]
													: undefined;

											if (currentSecondarySort?.id === columnId) {
												// Clicking current secondary sort
												if (!currentSecondarySort.desc) {
													// was asc, now desc
													newSortState.push({
														id: columnId,
														desc: true,
													});
												} // else was desc, now clear secondary (newSortState only has primary)
											} else {
												// New or different secondary sort (or columnId is group id but we set as secondary)
												newSortState.push({
													id: columnId,
													desc: false,
												});
											}
										} else {
											// No grouping, DTableSortBy manages sorting[0]
											const currentPrimarySort = currentFullSorting[0];
											if (currentPrimarySort?.id === columnId) {
												// Clicking current primary
												if (!currentPrimarySort.desc) {
													newSortState = [
														{
															id: columnId,
															desc: true,
														},
													];
												} // else was desc, now clear primary (newSortState remains [])
											} else {
												// New or different primary sort
												newSortState = [
													{
														id: columnId,
														desc: false,
													},
												];
											}
										}
										table.setSorting(newSortState.slice(0, 2)); // Ensure max 2 sorts
									};

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
											{isCurrentlySortedByUser ? (
												isDescByUser ? (
													<ArrowDown className="h-4 w-4" />
												) : (
													<ArrowUp className="h-4 w-4" />
												)
											) : (
												<ChevronsUpDown className="h-4 w-4 opacity-30" />
											)}
										</CommandItem>
									);
								})}
							</CommandGroup>
							<CommandGroup>
								<CommandItem
									disabled={!canClearUserSort}
									onSelect={() => {
										const currentFullSorting = table.getState().sorting;
										const currentGroupId = table.getState().grouping[0];
										if (currentGroupId) {
											// Clear only user-defined sort (sorting[1]), keep group sort (sorting[0])
											const groupSortEntry = currentFullSorting.find(
												(s) => s.id === currentGroupId,
											);
											table.setSorting(groupSortEntry ? [groupSortEntry] : []);
										} else {
											// No grouping, clear all sorts
											table.setSorting([]);
										}
									}}
									className="border-t border-input pt-2 mt-2 text-muted-foreground hover:text-foreground"
								>
									Clear Sort
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
