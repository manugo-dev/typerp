import { IdentityRpc } from "@typerp/contracts/identity/rpc";
import type { Character } from "@typerp/contracts/identity/types";
import { callRpc, getActiveLocale, getKernelExports, initResourceLocales } from "@typerp/sdk";

import {
	JOB_RESOURCE_NAME,
	type JobAssignment,
	JobEvents,
	type JobState,
} from "../shared/job.shared";
import { loadJobConfig } from "./config.server";

const jobConfig = loadJobConfig();
const tJob = initResourceLocales("job");

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
const rewardMultiplier = jobConfig.startingRewardMultiplier;
for (const template of JOB_TEMPLATES) {
	template.reward = Math.round(template.reward * rewardMultiplier);
}

const activeJobs = new Map<number, { assignment: JobAssignment; state: JobState }>();
let jobCounter = 0;

async function getPlayerIdentity(source: number): Promise<Character[] | null> {
	try {
		const identifiers: string[] = getPlayerIdentifiers(String(source));
		const license = identifiers.find((id: string) => id.startsWith("license:"));
		if (!license) throw new Error("License identifier not found for player");

		const characters = await callRpc<Character[]>(IdentityRpc.GET_CHARACTERS, license);
		return characters;
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
			message: tJob("error.noCharacter"),
			success: false,
		});
		return;
	}

	if (activeJobs.has(src)) {
		emitNet(JobEvents.JOB_RESULT, src, {
			message: tJob("error.alreadyActive"),
			success: false,
		});
		return;
	}

	const template = JOB_TEMPLATES[Math.floor(Math.random() * JOB_TEMPLATES.length)]!; // eslint-disable-line sonarjs/pseudo-random -- gameplay randomness, not security
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
			message: tJob("error.noActiveJob"),
			success: false,
		});
		return;
	}

	// Mark completed and notify client
	activeJobs.delete(src);

	emitNet(JobEvents.JOB_RESULT, src, {
		message: tJob("job.completed", { reward: `$${entry.assignment.reward}` }),
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
console.log(`[${JOB_RESOURCE_NAME}] ${tJob("boot.starting")}`);
console.log(`[${JOB_RESOURCE_NAME}] Config — locale: ${getActiveLocale()}`);

getKernelExports().registerServerResource("gameplay-simple-job", {
	name: JOB_RESOURCE_NAME,
	version: "0.1.0",
});

globalThis.exports("getActiveJob", (source: number) => {
	const entry = activeJobs.get(source);
	return entry ? entry.assignment : null;
});

console.log(`[${JOB_RESOURCE_NAME}] ${tJob("boot.ready")}`);
