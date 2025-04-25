# Project Brief

This project aims to build a task management application with seamless synchronization capabilities between a local datastore and a remote backend. The core goal is to ensure data consistency and provide a reliable user experience across different sessions and potentially devices.

## Key Objectives

-   Implement CRUD operations for tasks locally.
-   Implement synchronization logic to push local changes to the remote.
-   Implement synchronization logic to pull remote changes to the local store.
-   Ensure conflict resolution mechanisms are in place (details TBD).
-   Provide a clear and intuitive user interface.

## Overview

Shards MD is a task management plugin for Obsidian that provides a modern UI for managing tasks within markdown files. It synchronizes tasks between the UI and markdown files while maintaining data integrity.

## Core Goals

1. Provide a modern, intuitive UI for task management in Obsidian
2. Maintain bidirectional sync between UI and markdown files
3. Support rich task metadata and status tracking
4. Ensure data integrity and prevent sync conflicts

## Key Features

-   Task creation, editing, and deletion with real-time sync
-   Status tracking (todo, in-progress, done, cancelled)
-   Priority levels support
-   Kanban board and list views
-   Metadata tracking for sync state
-   Robust error handling and logging

## Target Users

-   Obsidian users who want a more structured task management experience
-   Users who prefer visual task management but want to keep data in markdown
-   Teams or individuals who need reliable task tracking with markdown compatibility

## Core Principles

### State Management

-   **Single Source of Truth**: Jotai atoms serve as the sole source of truth for application state
-   **Unidirectional Data Flow**: All state changes follow a clear, one-way path
-   **Pure UI Components**: React components are pure renderers of state
-   **Type Safety**: Comprehensive TypeScript types throughout the application

### Data Synchronization

-   Bi-directional sync between Obsidian vault and UI
-   Real-time updates through TaskSyncService
-   Proper cleanup and resource management
-   Error handling and recovery

## Technical Stack

-   React for UI
-   Jotai for state management
-   TypeScript for type safety
-   Obsidian API integration
-   Custom event handling

## Project Goals

1. Provide intuitive task management in Obsidian
2. Ensure data consistency and reliability
3. Maintain high performance
4. Support extensibility
5. Keep code maintainable and testable

## Project Overview

A task management application that integrates with Obsidian and potentially other task sources, providing a unified interface for task management while maintaining sync with external sources.

### Core Goals

1. Provide efficient task management
2. Maintain sync with external sources
3. Ensure reliable state management
4. Provide comprehensive logging and monitoring

### Architecture Principles

1. **Simplicity First**

    - Direct state management through Jotai
    - Clear component interfaces
    - Minimal complexity in data flow

2. **Separation of Concerns**

    - Components handle UI and user interaction
    - State management handles data storage and operations
    - Service layer handles external operations
    - Logging provides operational visibility

3. **Reliability**
    - Comprehensive error handling
    - Structured logging for all operations
    - Clear state management patterns

### Key Features

1. Task Management

    - Add, update, delete tasks
    - Filter tasks by status
    - Sync with external sources

2. State Management

    - Centralized state through Jotai
    - Direct state operations for components
    - Service integration for external operations

3. Logging and Monitoring
    - Structured logging with Pino
    - Operation tracking
    - Error tracking
    - Performance monitoring (planned)

### Integration Points

1. Obsidian API
2. State Management (Jotai)
3. Logging System (Pino)
4. Future external task sources

## Core Objectives

-   Provide multiple task visualization methods (kanban, lists, calendars)
-   Ensure bi-directional sync with Markdown files across the vault
-   Maintain compatibility with Tasks plugin and Dataview
-   Deliver consistent UI/UX aligned with Obsidian themes
-   Enable task breakdown into smaller, manageable pieces (shards)
-   Maintain desktop-only support

## Success Criteria

-   Seamless integration with Obsidian's ecosystem
-   Full compatibility with Tasks plugin and Dataview
-   Consistent styling with Obsidian themes
-   Multiple view options (kanban, list, calendar)
-   Efficient task breakdown functionality
-   Reliable bi-directional Markdown sync
-   Stable desktop performance

## Current Version

0.0.1 (Early Development)

## Project Status

In development - Manual installation only (not yet available in Obsidian community plugin browser)

## Sync System Goals

The sync system aims to provide a robust, reliable, and efficient mechanism for synchronizing tasks between the local UI and remote vault storage. Key objectives include:

1. **Reliability**

    - Ensure no data loss during sync operations
    - Implement robust error handling and retry mechanisms
    - Provide clear feedback on sync status to users

2. **Performance**

    - Minimize sync latency
    - Optimize network usage through batch processing
    - Maintain responsive UI during sync operations

3. **User Experience**

    - Provide seamless sync experience
    - Clear indication of sync status
    - Graceful handling of offline operations

4. **Data Integrity**
    - Proper conflict resolution
    - Version tracking for changes
    - Ability to recover from sync failures

These goals guide our implementation decisions and prioritization of improvements to ensure a high-quality sync system that meets user needs while maintaining data integrity and performance.
