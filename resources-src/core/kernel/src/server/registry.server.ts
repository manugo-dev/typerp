import { KernelServiceManifest } from "../shared/kernel.shared";

export class ServerResourceRegistry {
	private readonly resources = new Map<string, unknown>();

	register(name: string, service: unknown): void {
		if (this.resources.has(name)) {
			console.warn(`[Kernel] Resource '${name}' is already registered. Overwriting.`);
		}
		this.resources.set(name, service);
	}

	get<T = unknown>(name: string): T | undefined {
		return this.resources.get(name) as T | undefined;
	}

	getManifests(): KernelServiceManifest[] {
		return [...this.resources.keys()].map((name) => ({
			name,
			ready: true,
			version: "1.0.0",
		}));
	}
}
