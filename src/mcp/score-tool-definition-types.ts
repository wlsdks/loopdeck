type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

type JsonObject = { readonly [key: string]: JsonValue };

export type LoopRelayMcpToolDefinition = {
  readonly name: string;
  readonly description: string;
  readonly annotations: JsonObject;
  readonly inputSchema: JsonObject;
  readonly outputSchema: JsonObject;
};
