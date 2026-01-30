import { Effect } from "effect";

export const stringToFloat = (value: string) =>
  Effect.try(() => {
    const float = parseFloat(value.trim());
    if (isNaN(float)) throw new Error("Invalid float value");
    return float;
  });
