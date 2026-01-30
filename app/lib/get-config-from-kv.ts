import { Effect } from "effect";
import { CONFIG_CONSTANTS_KEY } from "~/constants";
import type { ConfigConstants } from "~/types/config-constants";

export const getConfigFromKv = (kv: KVNamespace) =>
  Effect.tryPromise({
    try: () => kv.get(CONFIG_CONSTANTS_KEY),
    catch: (e) => new Error("Error al obtener la configuración", { cause: e }),
  }).pipe(
    Effect.flatMap(Effect.fromNullable),
    Effect.flatMap((configString) =>
      Effect.try(() => JSON.parse(configString) as ConfigConstants),
    ),
  );
