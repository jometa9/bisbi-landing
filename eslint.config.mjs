import js from "@eslint/js";
import tseslint from "typescript-eslint";

const generalRules = {
  "no-empty": "off",
  "no-useless-catch": "off",
  "prefer-const": "off",
  "no-case-declarations": "off",
};

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/next-env.d.ts",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    rules: {
      ...generalRules,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      ...generalRules,
    },
  },
];
