import { problem } from "./errors.js";

type MethodKey = string;

type RequiredMethods<TStorage, TKey extends keyof TStorage & MethodKey> = {
  [K in TKey]-?: TStorage[K] extends
    | ((...args: infer TArgs) => infer TReturn)
    | undefined
    ? (...args: TArgs) => TReturn
    : never;
};

export function requireStorageCapabilities<
  TStorage extends object,
  const TKey extends keyof TStorage & MethodKey,
>(
  storage: TStorage,
  requiredMethods: readonly TKey[],
  options: { label: string; instance: string },
): TStorage & RequiredMethods<TStorage, TKey> {
  const hasAllMethods = requiredMethods.every(
    (method) => typeof storage[method] === "function",
  );
  if (!hasAllMethods) {
    throw problem(
      500,
      "Internal Server Error",
      `${options.label} is not configured.`,
      options.instance,
    );
  }

  return storage as TStorage & RequiredMethods<TStorage, TKey>;
}
