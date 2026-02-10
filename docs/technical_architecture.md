# Technical Architecture

## Core Technologies

-   **TypeScript**: Static type checking
-   **Zod**: Runtime schema validation
-   **Jotai**: Atomic state management
-   **React**: UI components
-   **Obsidian API**: Platform integration
-   **Dataview API**: Data source integration

## Key Interfaces and Types

### Task Schema

```typescript
export const TaskSchema = z.object({
	id: z.string(),
	description: z.string(),
	priority: z.nativeEnum(TaskPriority),
	recurs: z.string().nullable().optional(),
	dueDate: z.date().nullable().optional(),
	scheduledDate: z.date().nullable().optional(),
	startDate: z.date().nullable().optional(),
	blocks: z.array(z.string()).optional(),
	status: z.nativeEnum(TaskStatus),
	createdDate: z.date().nullable().optional(),
	doneDate: z.date().nullable().optional(),
	path: z.string(),
	symbol: z.string().optional(),
	source: z.nativeEnum(TaskSource),
	line: z.number().optional(),
	subtasks: z.lazy(() => z.array(TaskSchema)).optional(),
	lineDescription: z.string(),
	tags: z.array(z.string()).optional(),
});
```

### State Operations

```typescript
export enum storeOperation {
	ADD = "add",
	UPDATE = "update",
	DELETE = "delete",
	RESET = "reset",
	REPLACE = "replace",
	// Source-specific operations
	LOCAL_ADD = "local_add",
	LOCAL_UPDATE = "local_update",
	LOCAL_DELETE = "local_delete",
	REMOTE_UPDATE = "remote_update",
	SYNC_CONFIRMED = "sync_confirmed",
}
```

### Transfer Objects

```typescript
export type taskObject = {
	status: boolean;
	task?: Task;
	lineString?: string;
};

export type tasksObject = {
	status: boolean;
	tasks?: Task[];
};
```

## Service Architecture

### InternalApiService

-   Handles communication with Obsidian and Dataview APIs
-   Manages periodic task fetching
-   Emits events for task updates

### TaskSyncService

-   Bridges API layer and state management
-   Handles task synchronization
-   Validates incoming task updates

### TaskMapper

-   Converts between different task representations
-   Handles data format transformations
-   Ensures type safety during conversions

## State Management Architecture

### Atom Structure

```typescript
// Base storage
const baseTasksAtom = atom<Task[]>([]);

// Operation handling
const changeTasksAtom = atom(
	(get) => get(baseTasksAtom),
	(get, set, change: { operation: storeOperation; tasks: Task[] }) => {
		const tasks = get(baseTasksAtom);
		switch (change.operation) {
			case storeOperation.ADD:
				set(baseTasksAtom, [...tasks, ...change.tasks]);
				break;
			case storeOperation.UPDATE:
			// ... handle other operations
		}
	},
);
```

### Component Integration

```typescript
// Example of component-level atom usage
const taskAtom = atom(
	// Read
	(get) => get(changeTasksAtom).find((task) => task.id === taskId),
	// Write
	(get, set, update: Partial<Task>) => {
		// Handle updates
	},
);
```

## Validation Architecture

### Validation Points

1. **Data Entry**

    - Raw data validation
    - Type conversion checks
    - Schema compliance

2. **State Updates**

    - Pre-update validation
    - Type checking
    - Schema verification

3. **UI Interactions**
    - Input validation
    - Update validation
    - Type safety checks

### Error Handling Strategy

```typescript
const validationResult = validateTasks(mappedTasks);
if (!validationResult.isValid) {
	logger.error(`Validation error: ${validationResult.message}`);
	// Handle error appropriately
	return;
}
// Process valid data
```

## Testing Strategy

### Unit Tests

-   Validation function tests
-   Mapper function tests
-   State operation tests

### Integration Tests

-   API service tests
-   State management tests
-   Component interaction tests

## Performance Considerations

### State Updates

-   Atomic updates for better performance
-   Minimized re-renders
-   Efficient data transformations

### Data Validation

-   Strategic validation points
-   Cached schema results
-   Optimized type checking

## Security Considerations

### Data Validation

-   Input sanitization
-   Type checking
-   Schema validation

### State Management

-   Immutable updates
-   Controlled access
-   Validated modifications
