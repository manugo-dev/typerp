export class ClientServiceRegistry {
	private services = new Map<string, unknown>();

	public register(name: string, service: unknown) {
		this.services.set(name, service);
		console.log(`[Kernel:Client] Registered service: ${name}`);
	}

	public get(name: string): unknown {
		return this.services.get(name);
	}
}
