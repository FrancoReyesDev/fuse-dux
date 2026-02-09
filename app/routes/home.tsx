import type { Route } from "./+types/home";
import { Outlet, redirectDocument } from "react-router";
import { getConfigFromKv } from "~/lib/get-config-from-kv";
import { Effect } from "effect";
import { AppSidebar } from "~/components/app-sidebar";
import { OrderContextProvider } from "~/hooks/use-order";
import { OrdersRepository } from "~/repositories/orders-repository";

export async function loader({ context }: Route.LoaderArgs) {
  const config = await getConfigFromKv(context.cloudflare.env.fuse_dux_kv).pipe(
    Effect.orElse(() => Effect.succeed(null)),
    Effect.runPromise,
  );

  if (config === null) return redirectDocument("/settings");

  const db = context.cloudflare.env.fuse_dux_d1;
  const ordersRepository = OrdersRepository(db);
  const orders = await Effect.runPromise(ordersRepository.list(true));

  return { config, orders };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { orders, config } = loaderData;

  return (
    <OrderContextProvider orders={orders}>
      <AppSidebar config={config} />
      <Outlet />
    </OrderContextProvider>
  );
}
