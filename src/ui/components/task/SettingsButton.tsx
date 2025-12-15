import React from "react";
import {Trash2, MoreVertical, Eye } from "lucide-react";
import { Button } from "@/ui/base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/ui/base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/base/Popover";

export interface SettingsButtonProps {
	onViewDetails: () => void;
	onDelete: () => void;
	disabled?: boolean;
}

/**
 * Settings button (⋮) that opens a popover menu with Edit/Delete options.
 */
export function SettingsButton({
	onViewDetails,
	onDelete,
	disabled,
}: SettingsButtonProps) {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					size="iconsm"
					variant="outline"
					disabled={disabled}
					aria-label="More Actions"
				>
					<MoreVertical className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="end">
				<Command>
					<CommandList>
						<CommandGroup heading="Actions">
							<CommandItem
								onSelect={() => {
									onViewDetails();
									setIsOpen(false);
								}}
								className="flex items-center justify-between w-full cursor-pointer"
								aria-label="View Task Details"
							>
								<div className="flex items-center mr-2">
									<Eye className="mr-2 h-4 w-4 text-muted-foreground" />
									<span>View Details & Edit </span>
								</div>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									onDelete();
									setIsOpen(false);
								}}
								className="flex items-center justify-between w-full cursor-pointer hover:bg-destructive/10"
								aria-label="Delete Task"
							>
								<div className="flex items-center mr-2">
									<Trash2 className="mr-2 h-4 w-4 text-destructive" />
									<span>Delete</span>
								</div>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

