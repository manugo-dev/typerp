import { loadResourceConfig } from "@typerp/sdk";
import { z } from "zod";

const JobConfigSchema = z.object({
	startingRewardMultiplier: z.number().positive().default(1),
});

export type JobConfig = z.output<typeof JobConfigSchema>;

export function loadJobConfig(): JobConfig {
	return loadResourceConfig({
		configFile: "config/job.config.json",
		schema: JobConfigSchema,
		sourceLabel: "job-simple",
	});
}
