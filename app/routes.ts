import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/home.tsx", [
    index("routes/search.tsx"),
    route("orders", "routes/orders/orders.tsx"),
    route("orders/:id", "routes/orders/byId.tsx"),
  ]),
  ...prefix("settings", [
    layout("routes/settings/layout.tsx", [
      index("routes/settings/upload.tsx"),
      route("config", "routes/settings/config.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
