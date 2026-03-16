export class ClientResourceRegistry {
	private resources = new Map<string, unknown>();

	public register(name: string, resource: unknown) {
		this.resources.set(name, resource);
		console.log(`[Kernel:Client] Registered resource: ${name}`);
	}

	public get(name: string): unknown {
		return this.resources.get(name);
	}
}
