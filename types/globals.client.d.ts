import type { KernelClientExports } from "../resources-src/core/kernel/client";

declare global {
	interface CitizenExports {
		"core-kernel"?: KernelClientExports;
	}
}
