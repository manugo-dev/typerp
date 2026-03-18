import { KernelServerExports } from "../resources-src/core/kernel/src/server/exports.server";
import { IdentityServerExports } from "../resources-src/gameplay/identity/src/server/exports.server";

declare global {
	interface ServerExports {
		"typerp-gameplay-identity"?: IdentityServerExports;
		"typerp-core-kernel"?: KernelServerExports;
	}

	type ServerExportKeys = {
		[K in keyof ServerExports]: keyof NonNullable<ServerExports[K]>;
	}[keyof ServerExports];

	interface CitizenExports extends ServerExports {
		(exportKey: ServerExportKeys, exportFunction: Function): void;
		(exportKey: number, exportFunction: Function): never;
		(exportKey: string, exportFunction: Function): never;
	}
}
