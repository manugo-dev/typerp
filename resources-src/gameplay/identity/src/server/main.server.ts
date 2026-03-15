/**
 * Identity Module — Server Runtime
 *
 * The identity resource owns all persistent character/identity state.
 * Other resources must NOT duplicate this logic; they consume it via
 * runtime public exports:
 *
 *   exports['identity'].getCharacter(licenseId)
 *   exports['identity'].createCharacter(data)
 *
 * Context: SERVER only.
 */


 const IDENTITY_RESOURCE_NAME = 'identity';

const config = getConfig();

// ---------------------------------------------------------------------------
// Identity Service (domain logic — lives exclusively in this resource)
// ---------------------------------------------------------------------------




console.log(`[${IDENTITY_RESOURCE_NAME}] Initializing identity module...`);
console.log(`[${IDENTITY_RESOURCE_NAME}] Config — locale: ${config.locale}`);

const identityService = new IdentityService();

// Register with the kernel's service registry (safe — fxmanifest depends on core-kernel)
exports['core-kernel']!.registerService('identity', {
  name: IDENTITY_RESOURCE_NAME,
  version: '0.1.0',
});

// ---------------------------------------------------------------------------
// Public Runtime API (cross-resource exports)
//
// Other resources consume these capabilities via:
//   exports['identity'].getCharacters(licenseId)
//   exports['identity'].createCharacter({ ... })
//
// This is the ONLY sanctioned way for other resources to interact with
// identity data. Direct DB access from other resources is prohibited.
// ---------------------------------------------------------------------------

global.exports(
  'getCharacters',
  (licenseId: string) => identityService.getCharacters(licenseId),
);

global.exports(
  'createCharacter',
  (data: CharacterCreate) => identityService.createCharacter(data),
);

console.log(`[${IDENTITY_RESOURCE_NAME}] Server initialization complete.`);
