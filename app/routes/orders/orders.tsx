import { OrdersRepository } from "~/repositories/orders-repository";
import type { Route } from "./+types/orders";
import { Effect } from "effect";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const active = (searchParams.get("active") ?? "true") === "true";
  const db = context.cloudflare.env.fuse_dux_d1;

  const ordersRepository = OrdersRepository(db);

  const orders = await Effect.runPromise(ordersRepository.list(active));

  return { orders };
}

export function Orders({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;

  return (
    <div>
      <h1>Orders</h1>
    </div>
  );
}
