import * as React from "react";

interface ErrorProps {
	message: string;
	details?: string;
	onRetry?: () => void;
}

/**
 * A React functional component that displays an error message with optional details
 * and a retry button.
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
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-red-600 mb-4">
						Oops! Something went wrong.
					</h1>
					<p className="text-lg text-gray-700 mb-2">{message}</p>
					{details && (
						<p className="text-sm text-gray-500 mb-4">{details}</p>
					)}
					{onRetry && (
						<button
							onClick={onRetry}
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							Retry
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
