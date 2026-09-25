import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "logs/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "prisma/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["prisma/seed.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },
);
