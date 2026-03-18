import { type JobAssignment, JobEvents } from "../shared/job.shared";

let currentJob: JobAssignment | null = null;

onNet(JobEvents.JOB_ASSIGNED, (assignment: JobAssignment) => {
	currentJob = assignment;
	console.log(`[Job] Assigned: ${assignment.description}`);
	console.log(
		`[Job] Pickup: ${assignment.pickupLabel} → Deliver: ${assignment.deliveryLabel}`,
	);
	console.log(`[Job] Reward: $${assignment.reward}`);
});

onNet(
	JobEvents.JOB_RESULT,
	(result: { message: string; reward?: number; success: boolean }) => {
		if (result.success) {
			currentJob = null;
			console.log(`[Job] ✅ ${result.message}`);
		} else {
			console.log(`[Job] ❌ ${result.message}`);
		}
	},
);

RegisterCommand(
	"job",
	() => {
		emitNet(JobEvents.JOB_REQUEST);
		console.log("[Job] Requesting a new job...");
	},
	false,
);

RegisterCommand(
	"deliver",
	() => {
		if (!currentJob) {
			console.log("[Job] No active job.");
			return;
		}
		emitNet(JobEvents.JOB_DELIVER);
		console.log("[Job] Submitting delivery...");
	},
	false,
);

RegisterCommand(
	"jobstatus",
	() => {
		if (!currentJob) {
			console.log("[Job] No active job.");
			return;
		}
		console.log(`[Job] Active: ${currentJob.description}`);
		console.log(
			`[Job] ${currentJob.pickupLabel} → ${currentJob.deliveryLabel} ($${currentJob.reward})`,
		);
	},
	false,
);

console.log(
	"[job-simple] Client initialization complete. Use /job, /deliver, /jobstatus",
);
