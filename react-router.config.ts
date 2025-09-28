import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
} satisfies Config;

// react-router.config.ts
// import { cloudflare } from "@react-router/cloudflare";

// export default cloudflare();