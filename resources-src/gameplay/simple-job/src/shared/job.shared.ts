export const JOB_RESOURCE_NAME = 'job-simple';

export type JobState = 'idle' | 'active' | 'delivering' | 'completed';

export interface JobAssignment {
  jobId: string;
  description: string;
  pickupLabel: string;
  deliveryLabel: string;
  reward: number;
}

export const JobEvents = {
  JOB_ASSIGNED: 'typerp:job:assigned',
  JOB_REQUEST: 'typerp:job:request',
  JOB_DELIVER: 'typerp:job:deliver',
  JOB_RESULT: 'typerp:job:result',
} as const;
