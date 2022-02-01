import { readFileSync, writeFileSync } from "fs";
import * as https from "https";
import * as yaml from "js-yaml";
// import { Automatiqal } from "../../../automatiqal/src/index";
import { Automatiqal } from "automatiqal";

// import { IRunBook } from "../../../automatiqal/src/RunBook/RunBook.interfaces";
import { IRunBook } from "automatiqal/dist/RunBook/RunBook.interfaces";
import {
  IRunBookResult,
  ITaskResult,
} from "../../../automatiqal/src/RunBook/Runner";

import { IArguments } from "./interfaces";

export class AutomatiqalCLI {
  private argv: IArguments;
  private runBook: IRunBook;
  private result: ITaskResult[];
  private httpsAgent: any;
  private automatiqal: Automatiqal;
  constructor(argv: IArguments) {
    this.argv = argv;

    this.runbookSet();
    this.prepareCertificates();
    this.readBuffers();

    this.automatiqal = new Automatiqal(this.runBook, this.httpsAgent);
    this.emittersSet();
  }

  async run() {
    this.result = await this.automatiqal.run();

    if (this.argv.output || this.argv.o) this.writeOut();

    return this.result;
  }

  /**
   * @description set the runbook based on the provided yaml/json file
   */
  private runbookSet() {
    // if the config is yaml
    if (!this.argv.json) {
      try {
        this.runBook = yaml.load(readFileSync(this.argv.file, "utf8"));
      } catch (e) {
        console.log(`\u274C ERROR 1003: while parsing the yaml file`);
        console.log(e.message);
        process.exit(1);
      }
    }

    // if the config is json
    if (this.argv.json) {
      try {
        this.runBook = JSON.parse(readFileSync(this.argv.file).toString());
      } catch (e) {
        console.log(`\u274C ERROR 1004: while parsing the json file`);
        console.log(e.message);
        process.exit(1);
      }
    }
  }

  /**
   * @description create all required emitters
   */
  private emittersSet() {
    this.automatiqal.emitter.on("task:result", function (a) {
      // console.log(a);
      let a1 = 1;
    });

    this.automatiqal.emitter.on("runbook:result", function (a) {
      // console.log(a);
      let a1 = 1;
    });

    this.automatiqal.emitter.on("runbook:log", function (a) {
      console.log(a);
      // let a1 = 1;
    });

    this.automatiqal.emitter.on("error", function (errorMessage) {
      console.log(errorMessage);
      process.exit(1);
    });
  }

  /**
   * @description if "output" flag is present - write the result to a file
   */
  private writeOut() {
    try {
      writeFileSync(this.argv.output, JSON.stringify(this.result, null, 4));
    } catch (e) {
      console.log(`\u274C ERROR 1005: while writing the output file`);
      console.log(e.message);
      process.exit(1);
    }
  }

  /**
   * @description if the authentication is certificates based
   *     read the certificates and prepare the httpsAgent
   */
  private prepareCertificates() {
    if (this.runBook.environment.authentication.cert) {
      let cert: Buffer;
      let key: Buffer;

      try {
        cert = readFileSync(this.runBook.environment.authentication.cert);
        key = readFileSync(this.runBook.environment.authentication.key);
      } catch (e) {
        console.log(`\u274C ERROR 1006: reding certificates`);
        console.log(e.message);
        process.exit(1);
      }

      this.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        cert: cert,
        key: key,
      });
    }
  }

  /**
   * @description loop through all the tasks and replace the file location
   *     (if any) with the actual file content
   */
  private readBuffers() {
    for (let task of this.runBook.tasks) {
      if (task.details && (task.details as any).file) {
        try {
          (task.details as any).file = readFileSync((task.details as any).file);
        } catch (e) {
          console.log(
            `\u274C ERROR 1007: reading file failed in task "${task.name}"`
          );
          console.log(e.message);
          process.exit(1);
        }
      }
    }
  }
}
