import { Effect } from "effect";

export const stringToFloat = (value: string) =>
  Effect.try(() => {
    // Remove dots as thousands separators and replace comma with dot as decimal separator
    const normalizedValue = value.replace(/\./g, "").replace(",", ".");
    const float = parseFloat(normalizedValue);
    if (isNaN(float)) throw new Error("Invalid float value");
    return float;
  });
