import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx", [route("/upload", "routes/upload.tsx")]),
  route("/settings", "routes/settings.tsx"),
] satisfies RouteConfig;
