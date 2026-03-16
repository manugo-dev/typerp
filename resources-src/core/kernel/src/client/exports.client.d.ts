export type KernelClientExports = {
	getClientService: (name: string) => unknown;
	registerClientService: (name: string, service: unknown) => void;
};
