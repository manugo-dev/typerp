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
  JOB_ASSIGNED: 'trp:job:assigned',
  JOB_REQUEST: 'trp:job:request',
  JOB_DELIVER: 'trp:job:deliver',
  JOB_RESULT: 'trp:job:result',
} as const;
