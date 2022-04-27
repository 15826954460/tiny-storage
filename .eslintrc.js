module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended"],
  include: ["src/**"],
  exclude: ["node_modules/**", "lib/**", "dist/**"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    parser: "babel-eslint",
  },
  parser: "babel-eslint",
  rules: {
    "space-before-function-paren": ["error", "never"],
  },
};
