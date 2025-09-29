import { createRequestHandler } from "@react-router/cloudflare";
// @ts-expect-error - no types for the build output
import * as build from "../build/server";

export default createRequestHandler({ build });
