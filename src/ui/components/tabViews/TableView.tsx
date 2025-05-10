import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { Task } from "../../../../data/types/tasks";
import { formatDate } from "../../../data/utils/dateUtils";
import { Button } from "../../base/Button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../base/Table";
import { DataTablePagination } from "../custom/dtable/DTablePagination";
import type { TabViewProps } from "../TaskView";

export function TableView<TData extends Task>({
	table,
	handleEditTask,
	handleDeleteTask,
	handleTaskStatusChange,
}: TabViewProps<TData>) {
	const grouping = table.getState().grouping;

	return (
		<>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									style={{ width: header.getSize() }}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
							{/* Extra header for actions */}
							<TableHead key="actions-header">Actions</TableHead>
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => {
							if (row.getIsGrouped()) {
								return (
									<TableRow key={row.id}>
										<TableCell
											colSpan={
												table.getVisibleLeafColumns()
													.length + 1
											}
										>
											<button
												type="button"
												onClick={row.getToggleExpandedHandler()}
												style={{ cursor: "pointer" }}
												className="flex items-center space-x-1"
											>
												{row.getIsExpanded() ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
												<span>
													{row.getValue(
														grouping[0] as string,
													)}{" "}
													({row.subRows.length})
												</span>
											</button>
										</TableCell>
									</TableRow>
								);
							} else {
								return (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => {
											if (
												cell.column.id ===
													"scheduledDate" ||
												cell.column.id === "dueDate"
											) {
												const dateValue = cell.getValue<
													string | null | undefined
												>();
												return (
													<TableCell key={cell.id}>
														{formatDate(
															dateValue
																? new Date(
																		dateValue,
																	)
																: null,
														)}
													</TableCell>
												);
											} else {
												return (
													<TableCell key={cell.id}>
														{flexRender(
															cell.column
																.columnDef.cell,
															cell.getContext(),
														)}
													</TableCell>
												);
											}
										})}
										{/* Extra cell for actions */}
										<TableCell
											key="actions-cell"
											className="text-right"
										>
											<div className="flex justify-end space-x-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														handleEditTask(
															row.original,
														)
													}
													className="text-muted-foreground hover:text-foreground"
													aria-label="Edit Task"
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														handleDeleteTask(
															row.original,
														)
													}
													className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
													aria-label="Delete Task"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							}
						})
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getAllColumns().length + 1}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<DataTablePagination table={table} />
		</>
	);
}
