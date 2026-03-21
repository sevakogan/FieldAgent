import type { NextConfig } from "next";
import { execFileSync } from "child_process";
import pkg from "./package.json";

function getBuildId(): string {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

const now = new Date();
const buildDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const buildTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Los_Angeles" });

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_DATE: buildDate,
    NEXT_PUBLIC_BUILD_ID: getBuildId(),
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },
};

export default nextConfig;
