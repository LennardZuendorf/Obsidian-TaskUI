import React from "react";
import { Trash2, MoreVertical, Eye } from "lucide-react";
import { Button, ButtonProps } from "@/ui/base/Button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/ui/base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/base/Popover";
import { cn } from "@/ui/utils";

export interface SettingsButtonProps {
	onViewDetails: () => void;
	onDelete: () => void;
	disabled?: boolean;
	/**
	 * Display variant: "icon" for icon-only button (default), "full" for button with text label
	 * @default "icon"
	 */
	variant?: "icon" | "full";
	/**
	 * Button size. Only applies when variant is "full"
	 * @default "sm"
	 */
	buttonSize?: ButtonProps["size"];
	/**
	 * Button variant style. Only applies when variant is "full"
	 */
	buttonVariant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
	/**
	 * Custom className for the button
	 */
	className?: string;
}

/**
 * Settings button that opens a popover menu with Edit/Delete options.
 * Supports both icon-only and full button with text label variants.
 */
export function SettingsButton({
	onViewDetails,
	onDelete,
	disabled,
	variant = "icon",
	buttonSize = variant === "icon" ? "iconsm" : "sm",
	buttonVariant = variant === "icon" ? "outline" : "default",
	className,
}: SettingsButtonProps) {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					size={buttonSize}
					variant={buttonVariant}
					disabled={disabled}
					aria-label="More Actions"
					className={className}
				>
					<MoreVertical className={cn("h-4 w-4", variant === "icon" && "mr-2")} />
					{variant === "full" && "Options"}
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

