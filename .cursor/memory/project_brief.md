# Project Brief

## Overview

TaskUI is a React-based task management plugin for Obsidian, providing a modern and intuitive interface for managing tasks within Obsidian vaults.

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

## Key Features

1. Task Management

    - Create, edit, delete tasks
    - Kanban board view
    - List view
    - Debug view for state inspection

2. Integration

    - Seamless Obsidian integration
    - Markdown file synchronization
    - Dataview API support

3. User Experience
    - Modern UI components
    - Responsive design
    - Immediate feedback
    - Error handling

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

## Target Users

Obsidian users who:

-   Need advanced task visualization options
-   Want to maintain Markdown compatibility
-   Use the Tasks plugin and/or Dataview
-   Prefer visual task management
-   Want to break down complex tasks into smaller pieces

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
