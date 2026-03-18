export type KernelClientExports = {
	getClientResource: (name: string) => unknown;
	registerClientResource: (name: string, resource: unknown) => void;
};
