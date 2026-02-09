import { OrdersRepository } from "~/repositories/orders-repository";
import type { Route } from "./+types/byId";
import { Effect } from "effect";
import type { Order } from "~/types/order";

export async function action({ params, context, request }: Route.ActionArgs) {
  const id = params.id;

  if (!id) return new Response("No order id provided", { status: 400 });

  const searchParams = new URL(request.url).searchParams;

  const active = (searchParams.get("active") ?? "true") === "true";

  const db = context.cloudflare.env.fuse_dux_d1;
  const ordersRepository = OrdersRepository(db);

  const program = Effect.gen(function* () {
    const order = yield* Effect.tryPromise(() => request.json<Order>());
    console.log({ order });

    if (request.method === "POST") {
      yield* ordersRepository.put(order, active);
    }

    if (request.method === "DELETE") {
      yield* ordersRepository.del(id);
    }
  }).pipe(
    Effect.match({
      onFailure: (error) => {
        console.error(error);
        return new Response(error.message, { status: 500 });
      },
      onSuccess: () => {
        return new Response(null, { status: 200 });
      },
    }),
  );

  return Effect.runPromise(program);
}

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const active = searchParams.get("active") === "true";
  const db = context.cloudflare.env.fuse_dux_d1;
  const id = params.id;

  const ordersRepository = OrdersRepository(db);

  const program = Effect.gen(function* () {
    if (!id) return new Error("No order id provided");

    const order = yield* ordersRepository.get(id);
    return order;
  });

  return Effect.runPromise(program);
}
