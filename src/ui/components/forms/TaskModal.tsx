import { App, Modal } from "obsidian";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { Task } from "@/data/types/tasks";
import FullTaskForm from "./FullTaskForm"; // Import the updated React component

export class TaskModal extends Modal {
	private task: Task | null;
	private reactRoot: Root | null = null; // React root instance
	private onSubmitCallback: (task: Task) => void;

	constructor(app: App, onSubmit: (task: Task) => void, task?: Task) {
		super(app);
		this.task = task ? task : null;
		this.onSubmitCallback = onSubmit;
		this.setTitle(task ? "Edit Task" : "Create Task");
	}

	onOpen() {
		this.contentEl.empty(); // Clear any previous content
		this.reactRoot = createRoot(this.contentEl);
		this.reactRoot.render(
			<React.StrictMode>
				<FullTaskForm
					initialTask={this.task}
					onSubmit={this.handleFormSubmit}
					onCancel={this.handleCancel}
				/>
			</React.StrictMode>,
		);
	}

	onClose() {
		this.reactRoot?.unmount(); // Unmount React component
		this.contentEl.empty();
	}

	// Wrapper function to handle submit from React component
	private handleFormSubmit = (task: Task) => {
		this.onSubmitCallback(task); // Call the original callback
		this.close(); // Close the modal first
	};

	// Wrapper function to handle cancel from React component
	private handleCancel = () => {
		this.close(); // Just close the modal
	};

	// Removed buildForm() method
}
