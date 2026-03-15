import { KERNEL_RESOURCE_NAME } from '../shared/kernel.shared';

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing client runtime...`);

class ClientServiceRegistry {
  private services = new Map<string, unknown>();

  public register(name: string, service: unknown) {
    this.services.set(name, service);
    console.log(`[Kernel:Client] Registered service: ${name}`);
  }

  public get(name: string): unknown {
    return this.services.get(name);
  }
}

const registry = new ClientServiceRegistry();

globalThis.exports('registerClientService', (name: string, service: unknown) =>
  registry.register(name, service),
);
globalThis.exports('getClientService', (name: string) => registry.get(name));

console.log(`[${KERNEL_RESOURCE_NAME}] Client initialization complete.`);
