import { KernelServerExports } from "../resources-src/core/kernel/src/server/exports.server";
import { IdentityServerExports } from "../resources-src/modules/identity/src/server/exports.server";

declare global {
	interface CitizenExports {
		"gameplay-identity"?: IdentityServerExports;
		"core-kernel"?: KernelServerExports;
	}
}
