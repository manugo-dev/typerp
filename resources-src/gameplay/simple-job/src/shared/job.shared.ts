export const JOB_RESOURCE_NAME = 'job-simple';

export type JobState = 'active' | 'completed' | 'delivering' | 'idle';

export interface JobAssignment {
  deliveryLabel: string;
  description: string;
  jobId: string;
  pickupLabel: string;
  reward: number;
}

export const JobEvents = {
  JOB_ASSIGNED: 'typerp:job:assigned',
  JOB_DELIVER: 'typerp:job:deliver',
  JOB_REQUEST: 'typerp:job:request',
  JOB_RESULT: 'typerp:job:result',
} as const;
