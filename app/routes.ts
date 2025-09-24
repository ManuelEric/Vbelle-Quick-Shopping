import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
    route("/", "routes/home.tsx"),
    route("/admin", "routes/admin.tsx"),
    route("/admin/dashboard", "routes/admin/dashboard.tsx"),
] satisfies RouteConfig;
