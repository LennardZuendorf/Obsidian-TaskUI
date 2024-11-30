import { App, Modal, Setting, Notice } from "obsidian";
import { Task, TaskPriority, TaskStatus } from "../../data/types/tasks";
import { TaskBuilder } from "../../data/taskBuilder";

export class TaskModal extends Modal {
	private task: Task | null;
	private onSubmit: (task: Task) => void;

	constructor(app: App, onSubmit: (task: Task) => void, task?: Task) {
		super(app);
		this.task = task ? task : null;
		this.onSubmit = onSubmit;
		this.setTitle(task ? "Edit Task" : "Create Task");
		this.buildForm();
	}

	private buildForm() {
		let description = this.task ? this.task.description : "";
		let priority = this.task ? this.task.priority : TaskPriority.MEDIUM;
		let status = this.task ? this.task.status : TaskStatus.TODO;

		new Setting(this.contentEl).setName("Description").addText((text) =>
			text.setValue(description).onChange((value) => {
				description = value;
			}),
		);

		new Setting(this.contentEl)
			.setName("Priority")
			.addDropdown((dropdown) => {
				Object.values(TaskPriority).forEach((priorityLevel) => {
					dropdown.addOption(priorityLevel, priorityLevel);
				});
				dropdown.setValue(priority).onChange((value) => {
					priority = value as TaskPriority;
				});
			});

		new Setting(this.contentEl)
			.setName("Status")
			.addDropdown((dropdown) => {
				Object.values(TaskStatus).forEach((statusLevel) => {
					dropdown.addOption(statusLevel, statusLevel);
				});
				dropdown.setValue(status).onChange((value) => {
					status = value as TaskStatus;
				});
			});

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText(this.task ? "Update Task" : "Create Task")
				.setCta()
				.onClick(() => {
					if (!description.trim()) {
						new Notice("Description cannot be empty.");
						return;
					}

					const updatedTask = TaskBuilder.create(this.task || undefined)
						.setDescription(description)
						.setPriority(priority)
						.setStatus(status)
						.build();

					this.close();
					this.onSubmit(updatedTask);
				}),
		);
	}
}
