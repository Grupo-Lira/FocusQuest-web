import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "prettier"],
    plugins: [
      "react",
      "react-hooks",
      "jsx-a11y",
    ],
    rules: {
      semi: ["error"],
      quotes: ["error", "double"],
      "prefer-arrow-callback": ["error"],
      "prefer-template": ["error"],
      "no-console": ["warn"],
      "max-len": ["warn", { code:90}],
      "react-hooks/exhaustive-deps": "off",
      "react/jsx-filename-extension": "off",
      "no-console": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "react/button-has-type": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-autofocus": "off",
      "react/jsx-no-bind": "off",
      "react/destructuring-assignment": "off",
      "import/prefer-default-export": "off",
      "consistent-return": "off",
      "no-useless-escape": "off",
      "no-underscore-dangle": "off",
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": ["error"],
      "@typescript-eslint/no-unused-vars": "error",
      "react/no-array-index-key": "error",
      "react/require-default-props": "error",
      "no-shadow": "error",
    },
  }),
];

export default eslintConfig;
