import { KernelServiceManifest } from "../shared/kernel.shared";

export class ServiceRegistry {
	private readonly services = new Map<string, unknown>();

	register(name: string, service: unknown): void {
		if (this.services.has(name)) {
			console.warn(
				`[Kernel] Service '${name}' is already registered. Overwriting.`,
			);
		}
		this.services.set(name, service);
	}

	get<T = unknown>(name: string): T | undefined {
		return this.services.get(name) as T | undefined;
	}

	getManifests(): KernelServiceManifest[] {
		return [...this.services.keys()].map((name) => ({
			name,
			ready: true,
			version: "1.0.0",
		}));
	}
}
