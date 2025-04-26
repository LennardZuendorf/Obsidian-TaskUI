import { TaskMetadata } from "./tasks"; // Adjust import path

export enum storeOperation {
	ADD = "add",
	UPDATE = "update",
	DELETE = "delete",
	RESET = "reset",
	REPLACE = "replace",

	// New source-specific operations
	LOCAL_ADD = "local_add",
	LOCAL_UPDATE = "local_update",
	LOCAL_DELETE = "local_delete",
	REMOTE_UPDATE = "remote_update",
	SYNC_CONFIRMED = "sync_confirmed",
}

export interface UpdateMetadataPayload {
	taskId: string;
	metadataUpdates: Partial<TaskMetadata>; // Use Partial for flexibility
}
