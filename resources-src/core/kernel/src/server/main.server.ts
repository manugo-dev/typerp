import { getConfig } from '@trp/config';
import { KERNEL_RESOURCE_NAME, type KernelServiceManifest } from '../shared/kernel.shared';
import {
  initializeInfrastructureServices,
  type KernelInfrastructureServices,
} from './infrastructure.server';

class ServiceRegistry {
  private readonly services = new Map<string, unknown>();

  register(name: string, service: unknown): void {
    if (this.services.has(name)) {
      console.warn(`[Kernel] Service '${name}' is already registered. Overwriting.`);
    }
    this.services.set(name, service);
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

console.log(`[${KERNEL_RESOURCE_NAME}] Initializing server runtime...`);

const serviceRegistry = new ServiceRegistry();
const frameworkConfig = getConfig();
const infrastructureServices = initializeInfrastructureServices();

global.exports('registerService', (name: string, service: unknown) => {
  serviceRegistry.register(name, service);
});
global.exports('getService', (name: string) => serviceRegistry.get(name));
global.exports('getServicesManifest', () => serviceRegistry.getManifests());
global.exports('getFrameworkConfig', () => frameworkConfig);
global.exports(
  'getInfrastructureServices',
  (): KernelInfrastructureServices => infrastructureServices,
);

console.log(
  `[${KERNEL_RESOURCE_NAME}] Ready. locale=${frameworkConfig.locale}, logLevel=${frameworkConfig.logLevel}`,
);
