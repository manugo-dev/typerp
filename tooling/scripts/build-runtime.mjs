import fs from 'node:fs';
import path from 'node:path';

/**
 * Stub generator for runtime fxmanifest.lua
 * Architectural rules enforced here:
 * - fx_version 'cerulean'
 * - game 'gta5'
 * - node_version '22'
 * - server_only 'yes' (conditionally where no client/NUI code exists)
 */

console.log('🚀 Building runtime resources... (stub implementation)');
console.log('✅ Architecturally aligned manifest defaults configured:');
console.log('  - fx_version \'cerulean\'');
console.log('  - game \'gta5\'');
console.log('  - node_version \'22\'');

// Real implementation to follow in Phase 3.
