import { Effect } from "effect";

export const parseD2M2Y4 = (date: string) =>
  Effect.try(() => {
    const [day, month, year] = date.split("/");
    if (!day || !month || !year) throw new Error("Invalid date format");
    return new Date(Number(year), Number(month) - 1, Number(day));
  });
