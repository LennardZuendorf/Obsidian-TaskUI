import type { Table } from "@tanstack/react-table"
import { useState } from "react"
import {
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react"

import { Button } from "../../../base/Button"
import { Command, CommandGroup, CommandItem, CommandList } from "../../../base/Command"
import { Popover, PopoverContent, PopoverTrigger } from "../../../base/Popover"
import { cn } from "../../../utils"

interface DataTablePaginationProps<TData> {
	table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
	const pageSizes = [5, 10, 20, 25, 40, 50]
	const [open, setOpen] = useState(false)

	return (
		<div className="flex items-center justify-end px-2">
			<div className="flex items-end space-x-6 lg:space-x-8">
				<div className="flex flex-col">
					<span className="text-xs text-muted-foreground mb-1 ml-1">Showing Max:</span>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button className="min-w-[120px] gap-1">
								<span className="text-sm whitespace-nowrap">
									{table.getState().pagination.pageSize} Tasks
								</span>
								<ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-40 p-0">
							<Command>
								<CommandList>
									<CommandGroup>
										{pageSizes.map((pageSize) => {
											const isSelected = table.getState().pagination.pageSize === pageSize
											return (
												<CommandItem
													key={pageSize}
													onSelect={() => {
														table.setPageSize(Number(pageSize))
														setOpen(false)
													}}
													className="flex items-center justify-between w-full text-sm"
												>
													<span>{pageSize} Tasks</span>
													<Check
														className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
													/>
												</CommandItem>
											)
										})}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex flex-col">
					{(() => {
						const rawIndex = table.getState().pagination.pageIndex
						const rawPageCount = table.getPageCount()
						const pageIndexDisplay = Number.isFinite(rawIndex) ? rawIndex + 1 : 1
						const pageCountDisplay = Number.isFinite(rawPageCount) ? rawPageCount : 1
						return (
							<span className="text-xs text-muted-foreground mb-1 ml-1">
								Page {pageIndexDisplay} of {pageCountDisplay}
							</span>
						)
					})()}
					<div className="flex items-center space-x-2">
						<Button
							variant="default"
							size="icon"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to first page</span>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="default"
							size="icon"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="default"
							size="icon"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to next page</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<Button
							variant="default"
							size="icon"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to last page</span>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
