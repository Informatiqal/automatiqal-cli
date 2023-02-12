import { satisfies } from "semver";
import { readFileSync } from "fs";

const { engines } = JSON.parse(readFileSync("./package.json").toString());

const version = engines.node;
if (!satisfies(process.version, version)) {
  console.log(
    `Required node version ${version} not satisfied with current version ${process.version}.`
  );
  process.exit(1);
} else {
  console.log("NodeJS engine version requirement is met.");
}
