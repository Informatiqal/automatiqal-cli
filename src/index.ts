import * as fs from "fs";
import yaml from "js-yaml";
import { minimist } from "@p-mcgowan/minimist";
// import { Automatiqal } from "../../automatiqal/src/index";

interface IArguments {
  file: string;
  json?: boolean;
}

export class AutomatiqalCLI {
  argv: IArguments;
  runBook: any;
  constructor(argv: IArguments) {
    this.argv = argv;

    if (!this.argv.json) {
      this.runBook = yaml.load(fs.readFileSync(this.argv.file, "utf8"));
    }

    if (this.argv.json) {
      this.runBook = JSON.parse(fs.readFileSync(this.argv.file).toString());
    }
  }
}

const argv: IArguments = minimist(process.argv.slice(2));
if (!argv.file) {
  console.log(`ERROR: Please provide file location`);
  process.exit(1);
}

const r = new AutomatiqalCLI(argv);
