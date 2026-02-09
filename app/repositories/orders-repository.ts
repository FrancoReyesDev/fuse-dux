import { Effect, pipe } from "effect";
import type { Order } from "~/types/order";

export const OrdersRepository = (db: D1Database) => {
  const get = (id: Order["id"], active: boolean = true) =>
    Effect.tryPromise({
      try: () =>
        db
          .prepare("SELECT data FROM orders WHERE id = ? AND active = ?")
          .bind(id, active ? 1 : 0)
          .first<{ data: string }>(),
      catch: (e) => new Error(`Error getting order ${id}`, { cause: e }),
    }).pipe(
      Effect.map((result) =>
        result ? (JSON.parse(result.data) as Order) : null,
      ),
    );

  const put = (order: Order, active: boolean = true) =>
    Effect.tryPromise({
      try: () =>
        db
          .prepare(
            "INSERT INTO orders (id, data, active) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, active = excluded.active",
          )
          .bind(order.id, JSON.stringify(order), active ? 1 : 0)
          .run(),
      catch: (e) => new Error(`Error saving order ${order.id}`, { cause: e }),
    });

  const del = (id: Order["id"]) =>
    Effect.tryPromise({
      try: () => db.prepare("DELETE FROM orders WHERE id = ?").bind(id).run(),
      catch: (e) => new Error(`Error deleting order ${id}`, { cause: e }),
    });

  const list = (active: boolean = true) =>
    Effect.tryPromise({
      try: () =>
        db
          .prepare(
            "SELECT data FROM orders WHERE active = ? ORDER BY created_at DESC",
          )
          .bind(active ? 1 : 0)
          .all<{ data: string }>(),
      catch: (e) => new Error("Error listing orders", { cause: e }),
    }).pipe(
      Effect.map((result) =>
        result.results.map((r) => JSON.parse(r.data) as Order),
      ),
    );

  return { get, put, del, list };
};
