import semver from "semver";
import { readFileSync } from "fs";

const { engines } = JSON.parse(readFileSync("./package.json"));

const version = engines.node;
if (!semver.satisfies(process.version, version)) {
  console.log(
    `Required node version ${version} not satisfied with current version ${process.version}.`
  );
  process.exit(1);
}
