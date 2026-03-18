import { RPC_REQUEST_EVENT, RPC_RESPONSE_EVENT } from "@typerp/contracts/rpc/events";

interface PendingRequest<T = unknown> {
	reject: (reason: Error) => void;
	resolve: (value: T) => void;
	timer: ReturnType<typeof setTimeout>;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const pendingRequests = new Map<string, PendingRequest>();
let listenerRegistered = false;

function ensureResponseListener(): void {
	if (listenerRegistered) {
		return;
	}
	listenerRegistered = true;

	on(RPC_RESPONSE_EVENT, (correlationId: string, success: boolean, payload: unknown) => {
		const pending = pendingRequests.get(correlationId);
		if (!pending) {
			return;
		}

		pendingRequests.delete(correlationId);
		clearTimeout(pending.timer);

		if (success) {
			pending.resolve(payload);
		} else {
			pending.reject(new Error(typeof payload === "string" ? payload : "RPC call failed"));
		}
	});
}

let counter = 0;

function generateCorrelationId(): string {
	return `rpc_${Date.now()}_${++counter}`;
}

export function callRpc<TResult = unknown>(
	procedure: string,
	payload: unknown = null,
	timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<TResult> {
	ensureResponseListener();

	const correlationId = generateCorrelationId();

	return new Promise<TResult>((resolve, reject) => {
		const timer = setTimeout(() => {
			pendingRequests.delete(correlationId);
			reject(new Error(`[SDK] RPC timeout after ${timeoutMs}ms: ${procedure}`));
		}, timeoutMs);

		pendingRequests.set(correlationId, {
			reject,
			resolve: resolve as (value: unknown) => void,
			timer,
		});

		emit(RPC_REQUEST_EVENT, correlationId, procedure, payload);
	});
}
