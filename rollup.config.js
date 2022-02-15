import typescript from "rollup-plugin-typescript2";
import del from "rollup-plugin-delete";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    "fs",
    "https",
  ],
  plugins: [
    commonjs(),
    del({
      targets: "dist/*",
    }),
    typescript({
      typescript: require("typescript"),
    }),
  ],
};
