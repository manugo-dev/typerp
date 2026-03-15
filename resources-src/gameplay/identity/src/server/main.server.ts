import { getConfig } from '@trp/config';
import type { CharacterCreate } from '@trp/contracts/identity/types';
import { IdentityService } from './service.server';

const IDENTITY_RESOURCE_NAME = 'identity';

type KernelExports = {
  registerService: (name: string, service: unknown) => void;
  getInfrastructureServices: () => Parameters<typeof IdentityService>[0];
};

const kernel = exports['core-kernel'] as KernelExports | undefined;
if (!kernel) {
  throw new Error(
    '[Identity] core-kernel exports are unavailable. Ensure dependency ordering is correct.',
  );
}

const config = getConfig();
const identityService = new IdentityService(kernel.getInfrastructureServices());

console.log(`[${IDENTITY_RESOURCE_NAME}] Initializing module... locale=${config.locale}`);

kernel.registerService('identity', {
  name: IDENTITY_RESOURCE_NAME,
  version: '0.1.0',
});

global.exports('getCharacters', (licenseId: string) => identityService.getCharacters(licenseId));
global.exports('createCharacter', (data: CharacterCreate) => identityService.createCharacter(data));

console.log(`[${IDENTITY_RESOURCE_NAME}] Server initialization complete.`);
