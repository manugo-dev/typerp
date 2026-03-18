import type { FrameworkConfig } from "@typerp/contracts/config/types";
import type { KernelServerExports } from "@typerp/contracts/kernel/exports";

const KERNEL_RESOURCE = "typerp-core-kernel";

let cachedExports: KernelServerExports | null = null;

export function getKernelExports(): KernelServerExports {
	if (cachedExports) {
		return cachedExports;
	}

	const kernel = globalThis.exports[KERNEL_RESOURCE] as KernelServerExports | undefined;
	if (!kernel) {
		throw new Error(
			`[SDK] Kernel exports not found. Ensure ${KERNEL_RESOURCE} is started before this resource.`,
		);
	}

	cachedExports = kernel;
	return cachedExports;
}

export function getGlobalConfig(): FrameworkConfig {
	return getKernelExports().getFrameworkConfig();
}
