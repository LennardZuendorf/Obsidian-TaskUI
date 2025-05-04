import { Table } from "@tanstack/react-table";
import {
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";

import { Button } from "../../../base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "../../../base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../base/Popover";
import { cn } from "../../../utils";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
}

export function DataTablePagination<TData>({
	table,
}: DataTablePaginationProps<TData>) {
	const pageSizes = [10, 20, 30, 40, 50];

	return (
		<div className="flex items-center justify-end px-2">
			<div className="flex items-end space-x-6 lg:space-x-8">
				<div className="flex flex-col">
					<span className="text-xs text-muted-foreground mb-1 ml-1">
						Showing Max:
					</span>
					<Popover>
						<PopoverTrigger asChild>
							<Button>
								<span className="text-sm">
									{table.getState().pagination.pageSize} Tasks
								</span>
								<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[100px] p-0">
							<Command>
								<CommandList>
									<CommandGroup>
										{pageSizes.map((pageSize) => {
											const isSelected =
												table.getState().pagination
													.pageSize === pageSize;
											return (
												<CommandItem
													key={pageSize}
													onSelect={() => {
														table.setPageSize(
															Number(pageSize),
														);
													}}
													className="flex items-center justify-between w-full text-sm"
												>
													<span>
														{pageSize} Tasks
													</span>
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
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex flex-col">
					<span className="text-xs text-muted-foreground mb-1 ml-1">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</span>
					<div className="flex items-center space-x-2">
						<Button
							size="icon"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to first page</span>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to next page</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							onClick={() =>
								table.setPageIndex(table.getPageCount() - 1)
							}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to last page</span>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
