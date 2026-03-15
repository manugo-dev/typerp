/**
 * Core Kernel — Server Runtime
 *
 * Bootstrap sequence for the TRP Framework server-side kernel.
 * Establishes the service registry and exposes the public runtime API pattern
 * for cross-resource interaction.
 *
 * Context: SERVER only — no browser/NUI APIs, no client-only assumptions.
 */

import {  KernelServiceManifest } from '../types';
import { getConfig } from '@trp/config';

 const KERNEL_RESOURCE_NAME = 'core-kernel';

// ---------------------------------------------------------------------------
// Service Registry
// ---------------------------------------------------------------------------

class ServiceRegistry {
  private services = new Map<string, unknown>();

  register(name: string, service: unknown): void {
    if (this.services.has(name)) {
      console.warn(`[Kernel] Service '${name}' is already registered. Overwriting.`);
    }
    this.services.set(name, service);
    console.log(`[Kernel] Service registered: ${name}`);
  }

  get<T = unknown>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  getManifests(): KernelServiceManifest[] {
    return Array.from(this.services.keys()).map((name) => ({
      name,
      version: '1.0.0',
      ready: true,
    }));
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing TRP Framework Kernel (server)...`);

const registry = new ServiceRegistry();

// Load and validate the framework configuration from JSONC source of truth.
// Infrastructure secrets (DATABASE_URL, REDIS_URL) come from env var overrides.
const config = getConfig();
console.log(`[Kernel] Config loaded — locale: ${config.locale}, logLevel: ${config.logLevel}`);

// ---------------------------------------------------------------------------
// Public Runtime API (cross-resource exports)
//
// Other FiveM resources consume these via:
//   exports['core-kernel'].registerService(name, service)
//   exports['core-kernel'].getService(name)
//
// This is the preferred cross-resource communication pattern for TRP Framework.
// Use it for stateful domain services, NOT for trivial utility wrappers.
// ---------------------------------------------------------------------------

global.exports('registerService', (name: string, service: unknown) => registry.register(name, service));
global.exports('getService', (name: string) => registry.get(name));
global.exports('getServicesManifest', () => registry.getManifests());
global.exports('getFrameworkConfig', () => config);

console.log(`[${KERNEL_RESOURCE_NAME}] Server initialization complete.`);
