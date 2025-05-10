import type { SortingState } from "@tanstack/react-table";
import { Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronDown, ChevronsUpDown } from "lucide-react";

import { getColumnDisplay } from "../../../lib/displayConfig/columnDisplayConfig"; // Adjusted path
import { Button } from "../../../base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "../../../base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../base/Popover";
import { cn } from "../../../utils"; // Adjusted path

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
	const sortableColumns = getSortableColumns(table);

	// Explicitly sort columns by label for stable display order
	const sortedDisplayColumns = [...sortableColumns].sort((a, b) => {
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
					sorting.length === 0 ? "opacity-0" : "opacity-100",
				)}
			>
				Sort by:
			</span>
			<Popover>
				<PopoverTrigger asChild>
					<Button className="gap-1">
						{(() => {
							const activeSort = sorting[0];
							if (activeSort) {
								const displayInfo = getColumnDisplay(
									activeSort.id,
								);
								const IconComponent = displayInfo.icon;
								return (
									<>
										{IconComponent && (
											<IconComponent className="h-4 w-4" />
										)}
										<span className="text-sm">
											{displayInfo.label}
										</span>
										{activeSort.desc ? (
											<ArrowDown className="h-4 w-4 ml-1" />
										) : (
											<ArrowUp className="h-4 w-4 ml-1" />
										)}
									</>
								);
							}
							// Default view
							return (
								<>
									{/* Default Sort Icon (SVG) */}
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
						{sorting.length === 0 && (
							<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandList>
							<CommandGroup heading="Sort by">
								{/* Use the explicitly sorted array */}
								{sortedDisplayColumns.map((col) => {
									const columnId = col.id;
									const displayInfo =
										getColumnDisplay(columnId);
									const IconComponent = displayInfo.icon;
									const columnLabel = displayInfo.label;

									// We already filtered for columns with labels
									// if (!columnLabel) return null;

									const currentSort = sorting[0];
									const isCurrentlySorted =
										currentSort?.id === columnId;
									const isDesc =
										isCurrentlySorted && !!currentSort.desc;

									const handleSelect = () => {
										let newSort: SortingState = [];
										if (!isCurrentlySorted) {
											newSort = [
												{ id: columnId, desc: false },
											];
										} else if (!isDesc) {
											newSort = [
												{ id: columnId, desc: true },
											];
										} // else newSort remains []
										table.setSorting(newSort);
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
											{isCurrentlySorted ? (
												isDesc ? (
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
									disabled={sorting.length === 0}
									onSelect={() => table.setSorting([])}
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
