import { z } from "zod";
import { getPriorityLabels } from "@/ui/lib/config/priority";
import { getStatusLabels } from "@/ui/lib/config/status";

/**
 * Zod schema for task form validation
 */
export const taskFormSchema = z.object({
	description: z.string().min(1, { message: "Description is required." }),
	status: z.enum([getStatusLabels[0], ...getStatusLabels.slice(1)]),
	priority: z.enum([getPriorityLabels[0], ...getPriorityLabels.slice(1)]),
	tags: z.array(z.string()).optional(),
	dueDate: z.date().nullable().optional(),
	scheduledDate: z.date().nullable().optional(),
});

/**
 * TypeScript type inferred from the Zod schema
 */
export type TaskFormValues = z.infer<typeof taskFormSchema>;

