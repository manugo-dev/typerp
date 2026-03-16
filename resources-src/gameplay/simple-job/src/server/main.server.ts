import { getConfig } from "@typerp/config";
import type { Character } from "@typerp/contracts/identity/types";

import {
	JOB_RESOURCE_NAME,
	type JobAssignment,
	JobEvents,
	type JobState,
} from "../shared/job.shared";

const config = getConfig();

const JOB_TEMPLATES: Omit<JobAssignment, "jobId">[] = [
	{
		deliveryLabel: "City Hall",
		description: "Deliver documents to the city hall",
		pickupLabel: "Post Office",
		reward: 250,
	},
	{
		deliveryLabel: "Pillbox Hospital",
		description: "Transport medical supplies to the hospital",
		pickupLabel: "Warehouse",
		reward: 400,
	},
	{
		deliveryLabel: "Burger Shot",
		description: "Deliver food to the restaurant",
		pickupLabel: "Farm",
		reward: 150,
	},
];

const activeJobs = new Map<number, { assignment: JobAssignment; state: JobState }>();
let jobCounter = 0;

async function getPlayerIdentity(source: number): Promise<Character[] | null> {
	try {
		const identifiers: string[] = getPlayerIdentifiers(String(source));
		const license = identifiers.find((id: string) => id.startsWith("license:"));
		if (!license) throw new Error("License identifier not found for player");

		const identity = globalThis.exports["gameplay-identity"];
		if (!identity) throw new Error("Identity service not available");

		const characters = await identity.getCharacters(license);
		return characters as Character[];
	} catch (error) {
		console.error(`[${JOB_RESOURCE_NAME}] Failed to query identity:`, error);
		return null;
	}
}

onNet(JobEvents.JOB_REQUEST, async () => {
	const src = (globalThis as Record<string, unknown>)["source"] as number;

	const characters = await getPlayerIdentity(src);
	if (!characters || characters.length === 0) {
		emitNet(JobEvents.JOB_RESULT, src, {
			message: "No character found. Create a character first.",
			success: false,
		});
		return;
	}

	if (activeJobs.has(src)) {
		emitNet(JobEvents.JOB_RESULT, src, {
			message: "You already have an active job.",
			success: false,
		});
		return;
	}

	const template = JOB_TEMPLATES[Math.floor(Math.random() * JOB_TEMPLATES.length)]!;
	const assignment: JobAssignment = {
		...template,
		jobId: `job_${++jobCounter}`,
	};

	activeJobs.set(src, { assignment, state: "active" });
	emitNet(JobEvents.JOB_ASSIGNED, src, assignment);

	const char = characters[0]!;
	console.log(
		`[${JOB_RESOURCE_NAME}] Assigned ${assignment.jobId} to ${char.firstName} ${char.lastName}`,
	);
});

onNet(JobEvents.JOB_DELIVER, () => {
	const src = (globalThis as Record<string, unknown>)["source"] as number;
	const entry = activeJobs.get(src);

	if (!entry || entry.state !== "active") {
		emitNet(JobEvents.JOB_RESULT, src, {
			message: "No active job to deliver.",
			success: false,
		});
		return;
	}

	// Mark completed and notify client
	activeJobs.delete(src);

	emitNet(JobEvents.JOB_RESULT, src, {
		message: `Delivery complete! Earned $${entry.assignment.reward}.`,
		reward: entry.assignment.reward,
		success: true,
	});

	console.log(
		`[${JOB_RESOURCE_NAME}] ${entry.assignment.jobId} completed by source ${src} — $${entry.assignment.reward}`,
	);
});

on("playerDropped", () => {
	const src = (globalThis as Record<string, unknown>)["source"] as number;
	activeJobs.delete(src);
});

console.log(`[${JOB_RESOURCE_NAME}] Initializing simple job module...`);
console.log(`[${JOB_RESOURCE_NAME}] Config — locale: ${config.locale}`);

const kernel = globalThis.exports["core-kernel"];

kernel?.registerService("job-simple", {
	name: JOB_RESOURCE_NAME,
	version: "0.1.0",
});

globalThis.exports("getActiveJob", (source: number) => {
	const entry = activeJobs.get(source);
	return entry ? entry.assignment : null;
});

console.log(`[${JOB_RESOURCE_NAME}] Server initialization complete.`);
