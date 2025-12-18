/**
 * Core display type definitions for the task management system.
 *
 * This module contains fundamental type definitions used across the application
 * for consistent display and styling of UI elements.
 */

import { DateCategory } from "./dateCategory";
import { TaskPriority, TaskStatus } from "@/data/types/tasks";

/**
 * Configuration interface for enum-based display components.
 * Provides a standardized way to define how enum values should be displayed in the UI.
 *
 * @template T - The type of React component used for the icon
 */
export interface EnumDisplayConfig<
	T extends React.ElementType = React.ElementType,
> {
	/** Human-readable label for display (e.g., "Highest Priority", "To Do") */
	label: string;
	/** React component used as an icon */
	icon: T;
	/** Optional Tailwind CSS classes for the container element */
	className?: string;
	/** Optional Tailwind CSS classes specific to the icon element */
	iconClassName?: string;
	/** Optional numerical order for sorting/display purposes */
	order?: number;
}

/**
 * Interface defining display properties for table columns.
 * Used to configure how columns are presented in data tables.
 *
 * @property {string | Date | string[] | Date[] | TaskStatus | TaskPriority} [type] - The data type of the column
 * @property {string} label - Human-readable label for the column
 * @property {React.ElementType} [icon] - Optional React component used as a column icon
 */
export interface ColumnDisplayInfo {
	type?: string | Date | string[] | Date[] | TaskStatus | TaskPriority;
	/** Human-readable label for the column */
	label: string;
	/** Optional React component used as a column icon */
	icon?: React.ElementType;
}

/**
 * Configuration interface for task priority display.
 * Extends the base enum display configuration with priority-specific properties.
 *
 * @template T - The type of React component used for the icon
 */
export interface PriorityDisplayConfig<
	T extends React.ElementType = React.ElementType,
> extends EnumDisplayConfig<T> {
	/** The task priority enum value */
	enum: TaskPriority;
}

/**
 * Configuration interface for task status display.
 * Extends the base enum display configuration with status-specific properties.
 *
 * @template T - The type of React component used for the icon
 */
export interface StatusDisplayConfig<
	T extends React.ElementType = React.ElementType,
> extends EnumDisplayConfig<T> {
	/** The task status enum value */
	enum: TaskStatus;
}

export interface DateDisplayConfig<
	T extends React.ElementType = React.ElementType,
> extends EnumDisplayConfig<T> {
	/** The date category enum value */
	enum: DateCategory;
}




