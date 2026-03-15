/**
 * Core Kernel - Server Runtime
 *
 * Establishes the server-side module registry and core framework initialization.
 */

import { KERNEL_RESOURCE_NAME, KernelServiceManifest } from '../shared/index.js';
import { getConfig } from '@trp/config';

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing TRP Framework Kernel (Server)...`);

// Provide a minimal service registration mechanism
class ServiceRegistry {
  private services = new Map<string, any>();

  public register(name: string, service: any) {
    if (this.services.has(name)) {
      console.warn(`[Kernel] Service '${name}' is already registered. Overwriting.`);
    }
    this.services.set(name, service);
    console.log(`[Kernel] Registered service: ${name}`);
  }

  public get(name: string): any {
    return this.services.get(name);
  }

  public getManifests(): KernelServiceManifest[] {
    return Array.from(this.services.keys()).map((name) => ({
      name,
      version: '1.0.0', // placeholder
      ready: true,
    }));
  }
}

const registry = new ServiceRegistry();

// Export the registry to other FiveM resources via the global 'exports' object.
// This establishes the public cross-resource API pattern.
global.exports('registerService', (name: string, service: any) => registry.register(name, service));
global.exports('getService', (name: string) => registry.get(name));
global.exports('getServicesManifest', () => registry.getManifests());

// Validate config loading
try {
  const config = getConfig();
  console.log(`[Kernel] Server timezone validated: ${config.TIMEZONE}`);
} catch (e) {
  console.error(`[Kernel] Failed to load config!`, e);
}

console.log(`[${KERNEL_RESOURCE_NAME}] Server initialization complete.`);
