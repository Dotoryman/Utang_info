import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    "worker-configuration.d.ts",
  ]),
  {
    rules: {
      // Cloudflare Workers에서는 로컬·사용자 이미지를 원본 경로로 제공한다.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
