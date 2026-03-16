import type { KernelDatabaseServices } from "@typerp/contracts/kernel/types";
import { createDatabaseClient, eq, schema } from "@typerp/database";

let cachedDatabaseServices: KernelDatabaseServices | null = null;

export function initializeKernelDatabaseServices(): KernelDatabaseServices {
	if (cachedDatabaseServices) {
		return cachedDatabaseServices;
	}

	cachedDatabaseServices = {
		db: createDatabaseClient(),
		eq,
		schema,
	};

	return cachedDatabaseServices;
}
