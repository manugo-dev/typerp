/**
 * Simple Job — Server Runtime
 *
 * A minimal courier/delivery job proving inter-resource communication:
 *
 *  1. Player requests a job   → client emits JobEvents.JOB_REQUEST
 *  2. Server verifies identity → calls exports['identity'].getCharacters()
 *  3. Server assigns a job    → emits JobEvents.JOB_ASSIGNED to client
 *  4. Player completes it     → client emits JobEvents.JOB_DELIVER
 *  5. Server pays out         → emits JobEvents.JOB_RESULT
 *
 * Context: SERVER only.
 */

import { getConfig } from '@trp/config';
import  { type Character } from '@trp/contracts';
import {
  JOB_RESOURCE_NAME,
  JobEvents,
  type JobAssignment,
  type JobState,
} from '../shared';

const config = getConfig();

// ---------------------------------------------------------------------------
// Job Definitions (static data — would come from JSONC config in future)
// ---------------------------------------------------------------------------

const JOB_TEMPLATES: Omit<JobAssignment, 'jobId'>[] = [
  {
    description: 'Deliver documents to the city hall',
    pickupLabel: 'Post Office',
    deliveryLabel: 'City Hall',
    reward: 250,
  },
  {
    description: 'Transport medical supplies to the hospital',
    pickupLabel: 'Warehouse',
    deliveryLabel: 'Pillbox Hospital',
    reward: 400,
  },
  {
    description: 'Deliver food to the restaurant',
    pickupLabel: 'Farm',
    deliveryLabel: 'Burger Shot',
    reward: 150,
  },
];

// Active jobs per player source (keyed by server ID)
const activeJobs = new Map<number, { assignment: JobAssignment; state: JobState }>();
let jobCounter = 0;

// ---------------------------------------------------------------------------
// Identity Integration (cross-resource communication)
//
// This is the key architectural proof:
// The job module does NOT import identity code directly.
// It consumes identity's public runtime exports at runtime.
// ---------------------------------------------------------------------------

async function getPlayerIdentity(source: number): Promise<Character[] | null> {
  try {
    const identifiers: string[] = getPlayerIdentifiers(String(source));
    const license = identifiers.find((id: string) => id.startsWith('license:'));
    if (!license) return null;

    // Cross-resource call to the identity module's public API
    // Safe non-null: fxmanifest declares 'identity' as a dependency
    const characters = await exports['identity']!.getCharacters(license);
    return characters as Character[];
  } catch (err) {
    console.error(`[${JOB_RESOURCE_NAME}] Failed to query identity:`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

onNet(JobEvents.JOB_REQUEST, async () => {
  const src = (global as Record<string, unknown>)['source'] as number;

  // 1. Verify identity via the identity module
  const characters = await getPlayerIdentity(src);
  if (!characters || characters.length === 0) {
    emitNet(JobEvents.JOB_RESULT, src, {
      success: false,
      message: 'No character found. Create a character first.',
    });
    return;
  }

  // 2. Check if player already has an active job
  if (activeJobs.has(src)) {
    emitNet(JobEvents.JOB_RESULT, src, {
      success: false,
      message: 'You already have an active job.',
    });
    return;
  }

  // 3. Assign a random job
  const template = JOB_TEMPLATES[Math.floor(Math.random() * JOB_TEMPLATES.length)]!;
  const assignment: JobAssignment = {
    ...template,
    jobId: `job_${++jobCounter}`,
  };

  activeJobs.set(src, { assignment, state: 'active' });
  emitNet(JobEvents.JOB_ASSIGNED, src, assignment);

  const char = characters[0]!;
  console.log(
    `[${JOB_RESOURCE_NAME}] Assigned ${assignment.jobId} to ${char.firstName} ${char.lastName}`,
  );
});

onNet(JobEvents.JOB_DELIVER, () => {
  const src = (global as Record<string, unknown>)['source'] as number;
  const entry = activeJobs.get(src);

  if (!entry || entry.state !== 'active') {
    emitNet(JobEvents.JOB_RESULT, src, {
      success: false,
      message: 'No active job to deliver.',
    });
    return;
  }

  // Mark completed and notify client
  activeJobs.delete(src);

  emitNet(JobEvents.JOB_RESULT, src, {
    success: true,
    message: `Delivery complete! Earned $${entry.assignment.reward}.`,
    reward: entry.assignment.reward,
  });

  console.log(
    `[${JOB_RESOURCE_NAME}] ${entry.assignment.jobId} completed by source ${src} — $${entry.assignment.reward}`,
  );
});

// Clean up on player disconnect
on('playerDropped', () => {
  const src = (global as Record<string, unknown>)['source'] as number;
  activeJobs.delete(src);
});

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

console.log(`[${JOB_RESOURCE_NAME}] Initializing simple job module...`);
console.log(`[${JOB_RESOURCE_NAME}] Config — locale: ${config.locale}`);

// Register with the kernel (safe — fxmanifest depends on core-kernel)
exports['core-kernel']!.registerService('job-simple', {
  name: JOB_RESOURCE_NAME,
  version: '0.1.0',
});

global.exports('getActiveJob', (source: number) => {
  const entry = activeJobs.get(source);
  return entry ? entry.assignment : null;
});

console.log(`[${JOB_RESOURCE_NAME}] Server initialization complete.`);
