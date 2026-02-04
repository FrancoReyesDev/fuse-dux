import { Effect, pipe, Stream } from "effect";

export const parseNDJsonEffect = <T = unknown>(
  readableStream: ReadableStream<Uint8Array>,
) =>
  pipe(
    Stream.fromReadableStream(
      () => readableStream,
      () => new Error("Failed parsing readable stream"),
    ),
    Stream.decodeText("utf-8"),
    Stream.splitLines,
    Stream.flatMap((line) => Effect.try(() => JSON.parse(line) as T)),
    Stream.runCollect,
    Effect.map((chunk) => Array.from(chunk)),
  );
