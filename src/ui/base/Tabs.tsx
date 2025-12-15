import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/ui/utils";
import { buttonVariants } from "./Button";

function Tabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

function TabsList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				"inline-flex w-fit items-center justify-center p-0.5",
				className,
			)}
			{...props}
		/>
	);
}

interface TabsTriggerProps
	extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
	variant?: "default" | "icon";
}

function TabsTrigger({
	className,
	variant = "default",
	...props
}: TabsTriggerProps) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				buttonVariants({
					variant: "default",
					className: cn(
						"data-[state=active]:ring-2 data-[state=active]:ring-hover",
						"disabled:pointer-events-none",
						className,
					),
				}),
			)}
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("flex-grow h-fit overflow-auto w-full", className)}
			{...props}
		/>
	);
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
