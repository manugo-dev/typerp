import { getConfig } from '@trp/config';
import type { Character } from '@trp/contracts/identity/types';
import {
  JOB_RESOURCE_NAME,
  JobEvents,
  type JobAssignment,
  type JobState,
} from '../shared/job.shared';

const config = getConfig();

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

const activeJobs = new Map<number, { assignment: JobAssignment; state: JobState }>();
let jobCounter = 0;

type IdentityExports = {
  getCharacters: (licenseId: string) => Promise<Character[]>;
};

type KernelExports = {
  registerService: (name: string, service: unknown) => void;
};

async function getPlayerIdentity(source: number): Promise<Character[] | null> {
  try {
    const identifiers: string[] = getPlayerIdentifiers(String(source));
    const license = identifiers.find((id: string) => id.startsWith('license:'));
    if (!license) return null;

    const identity = exports['identity'] as IdentityExports | undefined;
    if (!identity) {
      return null;
    }

    const characters = await identity.getCharacters(license);
    return characters as Character[];
  } catch (err) {
    console.error(`[${JOB_RESOURCE_NAME}] Failed to query identity:`, err);
    return null;
  }
}

onNet(JobEvents.JOB_REQUEST, async () => {
  const src = (global as Record<string, unknown>)['source'] as number;

  const characters = await getPlayerIdentity(src);
  if (!characters || characters.length === 0) {
    emitNet(JobEvents.JOB_RESULT, src, {
      success: false,
      message: 'No character found. Create a character first.',
    });
    return;
  }

  if (activeJobs.has(src)) {
    emitNet(JobEvents.JOB_RESULT, src, {
      success: false,
      message: 'You already have an active job.',
    });
    return;
  }

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

on('playerDropped', () => {
  const src = (global as Record<string, unknown>)['source'] as number;
  activeJobs.delete(src);
});

console.log(`[${JOB_RESOURCE_NAME}] Initializing simple job module...`);
console.log(`[${JOB_RESOURCE_NAME}] Config — locale: ${config.locale}`);

const kernel = exports['core-kernel'] as KernelExports | undefined;
if (!kernel) {
  throw new Error(
    '[job-simple] core-kernel exports are unavailable. Ensure dependency ordering is correct.',
  );
}

kernel.registerService('job-simple', {
  name: JOB_RESOURCE_NAME,
  version: '0.1.0',
});

global.exports('getActiveJob', (source: number) => {
  const entry = activeJobs.get(source);
  return entry ? entry.assignment : null;
});

console.log(`[${JOB_RESOURCE_NAME}] Server initialization complete.`);
