/**
 * Simple Job — Shared constants and types
 *
 * Context: SHARED — safe for both server and client contexts.
 * These get bundled into both server.js and client.js.
 */

export const JOB_RESOURCE_NAME = 'job-simple';

/** Possible states for a courier delivery job */
export type JobState = 'idle' | 'active' | 'delivering' | 'completed';

/** Server → Client: a job assignment payload */
export interface JobAssignment {
  jobId: string;
  description: string;
  pickupLabel: string;
  deliveryLabel: string;
  reward: number;
}

/** Job event names (namespaced) */
export const JobEvents = {
  /** Server → Client: assign a new job */
  JOB_ASSIGNED: 'trp:job:assigned',
  /** Client → Server: player requests a new job */
  JOB_REQUEST: 'trp:job:request',
  /** Client → Server: player reports delivery completion */
  JOB_DELIVER: 'trp:job:deliver',
  /** Server → Client: job result notification */
  JOB_RESULT: 'trp:job:result',
} as const;
