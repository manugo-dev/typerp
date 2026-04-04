export function resolveCurrentResourceName(
	resourceName?: string,
	sourceLabel: string = "SDK",
): string {
	if (resourceName) {
		return resourceName;
	}

	if (typeof GetCurrentResourceName === "function") {
		return GetCurrentResourceName();
	}

	throw new Error(`[${sourceLabel}] Could not resolve current resource name.`);
}
