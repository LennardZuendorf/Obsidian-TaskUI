import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingScreenProps {
	message?: string;
}

/**
 * Reusable loading screen component with spinner and optional message.
 * Uses semantic colors and consistent styling.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
	message = "Loading...",
}) => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="flex flex-col items-center space-y-4">
			<Loader2 className="h-8 w-8 animate-spin text-accent" />
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	</div>
);



