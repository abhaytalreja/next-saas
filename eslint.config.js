/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@nextsaas/eslint-config/base"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};