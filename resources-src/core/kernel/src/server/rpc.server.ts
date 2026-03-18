import { RPC_REQUEST_EVENT, RPC_RESPONSE_EVENT } from "@typerp/contracts/rpc/events";
import type { RpcHandler } from "@typerp/contracts/rpc/types";

const handlers = new Map<string, RpcHandler>();

export function registerRpcHandler<TPayload = unknown, TResult = unknown>(
	procedure: string,
	handler: RpcHandler<TPayload, TResult>,
): void {
	if (handlers.has(procedure)) {
		throw new Error(`[Kernel/RPC] Handler already registered for procedure: ${procedure}`);
	}
	handlers.set(procedure, handler as RpcHandler);
}

export function initializeRpcBroker(): void {
	on(RPC_REQUEST_EVENT, async (correlationId: string, procedure: string, payload: unknown) => {
		const handler = handlers.get(procedure);

		if (!handler) {
			emit(RPC_RESPONSE_EVENT, correlationId, false, `Unknown RPC procedure: ${procedure}`);
			return;
		}

		try {
			const result = await handler(payload);
			emit(RPC_RESPONSE_EVENT, correlationId, true, result);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`[Kernel/RPC] Error in ${procedure}: ${message}`);
			emit(RPC_RESPONSE_EVENT, correlationId, false, message);
		}
	});

	console.log(`[Kernel/RPC] Broker initialized with ${handlers.size} handler(s)`);
}
