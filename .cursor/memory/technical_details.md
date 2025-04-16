# Technical Details

## Tech Stack

### Core Technologies
- TypeScript
- React
- TailwindCSS
- Obsidian API

### UI Components
- shadcn/ui as base component library
- Custom components built on top of shadcn/ui
- Obsidian CSS variables integration for theme consistency

### Development Tools
- ESBuild (bundler)
- ESLint (linting)
- Prettier (code formatting)
- Husky (git hooks)

### Dependencies
- Tasks Plugin (Obsidian)
- Dataview Plugin (compatibility)

## Project Structure
- `src/`: Source code directory
  - `api/`: Obsidian and Dataview API integration
    - `internalApi/`: Obsidian API abstractions
    - `types/`: API type definitions
    - `internalApiService.ts`: Core API service
  - `data/`: State and type management
    - `types/`: Data model type definitions
    - `utils/`: Data manipulation utilities
    - `taskMapper.ts`: Task data mapping logic
    - `taskBuilder.ts`: Task object construction
    - `taskAtoms.ts`: Jotai state atoms
  - `service/`: Business logic layer
    - `types/`: Service type definitions
    - `taskService.ts`: Task management logic
    - `taskSyncService.ts`: Sync orchestration
  - `ui/`: React components and views
    - `components/`: Shared UI components
    - `base/`: Base UI elements
    - `utils/`: UI utility functions
    - `BoardView.tsx`: Kanban board implementation
    - `ListView.tsx`: List view implementation
    - `ErrorView.tsx`: Error handling view
  - `config/`: Configuration management
  - `utils/`: Shared utilities
  - `main.ts`: Plugin entry point
  - `MainView.tsx`: Root view component
  - `styles.css`: Global styles

## Build Configuration
- TypeScript configuration in `tsconfig.json`
- ESBuild configuration in `esbuild.config.mjs`
- Tailwind CSS configuration in `tailwind.config.js`

## Code Style
- Follows Prettier configuration
- ESLint rules defined in `.eslintrc`
- Editor configuration in `.editorconfig`

## Architecture Notes
- Desktop-only application
- Plugin architecture following Obsidian plugin guidelines
- React-based UI components
- TailwindCSS with Obsidian theme integration
- Bi-directional Markdown sync
- Tasks plugin compatibility layer
- Dataview compatibility layer

## Styling Strategy
- Use shadcn/ui as foundation
- Reference Obsidian CSS variables for theming
- Maintain consistent styling with vault themes
- TailwindCSS for custom components
- Responsive design for different pane sizes

## View Architecture
- Tab-based navigation between views
- Core Views:
  - Kanban Board
  - List View
  - Calendar View
- Advanced Views (Future):
  - Due Date View
  - Project View
  - Tag View
  - Custom Views

## State Management
- Using Jotai for state management
- Centralized task state through `baseTasksAtom` and `tasksAtom`
- Derived read-only atoms for filtered views (todo, in progress, done)

## Sync Strategy
- Real-time bi-directional sync
- Dataview API integration for vault changes
  - Subscribe to task changes
  - Update Jotai state on vault modifications
- Immediate MD file updates on task changes
- Change detection through Dataview events
- Fallback polling for non-Dataview changes

## View Configuration
- Per-view settings persistence
- User-configurable view options:
  - Layout preferences
  - Sorting/filtering options
  - Display preferences
  - Custom fields visibility
- Settings stored in plugin data
- Migration path for settings updates

## Data Flow
1. Vault Changes:
   - Dataview API events → State Updates → UI Updates
2. UI Changes:
   - User Action → State Updates → Immediate MD File Updates
3. Settings Changes:
   - User Preferences → Plugin Storage → View Updates 

## Architecture Layers

### API Layer
- Abstracts Obsidian API interactions
- Manages Dataview plugin integration
- Handles internal API services
- Type-safe API interfaces

### Data Layer
- Task data model definitions
- State management with Jotai
- Data mapping and transformation
- Type builders and utilities

### Service Layer
- TaskService handles external operations (CRUD with Obsidian)
- Service layer integrates with state through direct updates
- Clear separation between local state operations and external service calls

### UI Layer
- View implementations
- Shared components
- Base UI elements
- Error boundaries 

## Architecture Overview

### Logging Implementation
- Using Pino logger with pretty-print in development
- Structured logging with consistent context
- Log levels:
  - info: Successful operations
  - warn: Non-error but noteworthy situations
  - error: Failures
  - debug: Hook-level operations

### Key Components
1. **Task Atoms (`src/data/taskAtoms.ts`)**
   - `baseTasksAtom`: Core state storage
   - `tasksAtom`: Main operation handler
   - Filtered view atoms (todo, inProgress, done)

2. **Task Service (`src/service/taskService.ts`)**
   - Handles external API operations
   - Integrates with Obsidian
   - Error handling and logging

3. **Logger (`src/utils/logger.ts`)**
   - Pino configuration
   - Pretty-print for development
   - Structured logging format

4. **Hooks (`useTasks`)**
   - Provides interface for components
   - Handles both local and service operations
   - Includes logging for operations

### Operation Types
- ADD: Add single or multiple tasks
- UPDATE: Update existing task
- DELETE: Remove task
- REPLACE: Replace entire task list
- RESET: Clear all tasks

### Current Implementation Decisions
1. Components work directly with state for local operations
2. Service methods available for external operations
3. Centralized logging for all operations
4. Clear separation between state management and business logic 