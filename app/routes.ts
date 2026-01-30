import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  ...prefix("settings", [
    layout("routes/settings/layout.tsx", [
      index("routes/settings/upload.tsx"),
      route("config", "routes/settings/config.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
