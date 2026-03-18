export type RpcHandler<TPayload = unknown, TResult = unknown> = (
	payload: TPayload,
) => Promise<TResult>;
