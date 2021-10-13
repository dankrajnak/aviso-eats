import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import executable from "rollup-plugin-executable";

export default {
  input: "src/cli.tsx",
  output: {
    banner: "#!/usr/bin/env node\n",
    file: "dist/bundle.js",
    format: "cjs",
  },
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" }),
    terser(),
    executable(),
  ],
};
