import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable React Compiler to avoid requiring babel-plugin-react-compiler.
  reactCompiler: false,
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "",
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || "",
  },
};

export default nextConfig;
