import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import replace from "@rollup/plugin-replace";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json"));

export default {
  input: "src/index.ts",
  output: [
    {
      sourcemap: true,
      file: pkg.main,
      format: "es",
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    "fs",
    "https",
    "os",
  ],
  plugins: [
    del({
      targets: "dist/*",
    }),
    typescript(),
    replace({
      values: {
        __VERSION: pkg.version,
      },
      preventAssignment: true,
    }),
  ],
};
