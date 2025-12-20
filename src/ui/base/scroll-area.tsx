import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/ui/utils";

const ScrollArea = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
	return (
		<ScrollAreaPrimitive.Root
			ref={ref}
			data-slot="scroll-area"
			className={cn("relative", className)}
			{...props}
		>
			<ScrollAreaPrimitive.Viewport
				data-slot="scroll-area-viewport"
				className="size-full rounded-[inherit]"
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			<ScrollBar />
			<ScrollAreaPrimitive.Corner />
		</ScrollAreaPrimitive.Root>
	);
});
ScrollArea.displayName = "ScrollArea";

const ScrollBar = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => {
	return (
		<ScrollAreaPrimitive.ScrollAreaScrollbar
			ref={ref}
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			className={cn(
				"flex touch-none select-none",
				orientation === "vertical" &&
					"h-full w-2.5 border-l border-l-transparent p-px",
				orientation === "horizontal" &&
					"h-2.5 flex-col border-t border-t-transparent p-px",
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitive.ScrollAreaThumb
				data-slot="scroll-area-thumb"
				className="bg-border relative flex-1 rounded-full"
			/>
		</ScrollAreaPrimitive.ScrollAreaScrollbar>
	);
});
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
