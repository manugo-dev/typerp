/**
 * Core Kernel - Client Runtime
 * Establishes the client-side module registry and core framework initialization.
 */

import { KERNEL_RESOURCE_NAME } from '../shared/index.js';

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing TRP Framework Kernel (Client)...`);

// A mirrored minimal registry for the client.
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
