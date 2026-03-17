import { z } from "zod";

export interface ModuleDefinition<ConfigSchema extends z.ZodTypeAny = z.ZodTypeAny> {
	id: string;
	version: string;
	configSchema?: ConfigSchema;
	dependencies?: string[];
	capabilities?: string[];
	onStart?: (context: ModuleContext<ConfigSchema>) => void | Promise<void>;
	onStop?: (context: ModuleContext<ConfigSchema>) => void | Promise<void>;
}

export interface ModuleContext<ConfigSchema extends z.ZodTypeAny> {
	config: z.infer<ConfigSchema>;
	// Additional context items that the kernel provides (e.g. logger, db abstraction if allowed, etc.)
}

/**
 * Helper to define a TypeRP Module with strong config typing.
 */
export function createModule<ConfigSchema extends z.ZodTypeAny>(
	definition: ModuleDefinition<ConfigSchema>,
): ModuleDefinition<ConfigSchema> {
	return definition;
}

// Ensure the core exports its Zod dependency gracefully for modules
export * from "zod";
