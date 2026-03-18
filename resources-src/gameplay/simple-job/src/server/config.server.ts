export interface JobConfig {
	readonly startingRewardMultiplier: number;
}

const JOB_CONFIG_FILE = "config/job.config.json";
let cachedJobConfig: JobConfig | null = null;

export function loadJobConfig(resourceName: string): JobConfig {
	if (cachedJobConfig) {
		return cachedJobConfig;
	}

	const raw = LoadResourceFile(resourceName, JOB_CONFIG_FILE);
	if (typeof raw !== "string") {
		throw new TypeError(`[job-simple] Missing config file: ${resourceName}/${JOB_CONFIG_FILE}`);
	}

	let parsedJson: unknown;
	try {
		parsedJson = JSON.parse(raw) as unknown;
	} catch (error) {
		throw new Error(
			`[job-simple] Invalid config JSON: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	const configObject =
		parsedJson && typeof parsedJson === "object"
			? (parsedJson as Record<string, unknown>)
			: {};

	const startingRewardMultiplier =
		typeof configObject.startingRewardMultiplier === "number" &&
		Number.isFinite(configObject.startingRewardMultiplier) &&
		configObject.startingRewardMultiplier > 0
			? configObject.startingRewardMultiplier
			: 1;

	cachedJobConfig = { startingRewardMultiplier };
	return cachedJobConfig;
}
