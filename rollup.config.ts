import typescript from "@rollup/plugin-typescript";
export default {
  input: "src/cli.tsx",
  output: {
    banner: "#!/usr/bin/env node\n",
    file: "dist/bundle.js",
    format: "cjs",
  },
  plugins: [typescript({ tsconfig: "./tsconfig.json" })],
};
