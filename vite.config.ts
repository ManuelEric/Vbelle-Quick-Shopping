import { defineConfig, type Plugin } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import netlify from "@netlify/vite-plugin-react-router";

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    netlify(),
    mode === "development"
      ? {
          name: "inject-hmr-runtime",
          apply: "serve",
        }
      : null,
  ].filter(Boolean) as Plugin[],
  server: {
    allowedHosts: [
      "devserver-production--vbelle.netlify.app",
      "vbelle.store",
    ],
  },
}));
