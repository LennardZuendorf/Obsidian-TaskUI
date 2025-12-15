import * as React from "react";
import { Alert } from "../base/Alert";
import { Button } from "../base/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../base/Card";

interface ErrorProps {
	message: string;
	details?: string;
	onRetry?: () => void;
}

/**
 * A React functional component that displays an error message with optional details
 * and a retry button. Uses base components and semantic color variables.
 *
 * @param {ErrorProps} props - The properties for the ErrorView component.
 * @param {string} props.message - The main error message to display.
 * @param {string} [props.details] - Additional details about the error, if available.
 * @param {() => void} [props.onRetry] - An optional callback function to be called when the retry button is clicked.
 * @returns {JSX.Element} A JSX element representing the error view.
 */
export const ErrorView: React.FC<ErrorProps> = ({
	message,
	details,
	onRetry,
}: ErrorProps): JSX.Element => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<Card className="max-w-md w-full">
				<CardHeader>
					<CardTitle className="text-destructive">
						Oops! Something went wrong.
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Alert variant="error">
						<p className="text-lg">{message}</p>
						{details && <p className="text-sm mt-2">{details}</p>}
					</Alert>
					{onRetry && (
						<Button
							onClick={onRetry}
							variant="accent"
							className="w-full"
						>
							Retry
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
