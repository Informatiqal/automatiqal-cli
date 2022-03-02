import { readFileSync, writeFileSync } from "fs";
import * as https from "https";
import * as yaml from "js-yaml";
import { Automatiqal } from "automatiqal";

import { IRunBook } from "automatiqal/dist/RunBook/RunBook.interfaces";
import { ITaskResult } from "automatiqal/dist/RunBook/Runner";

import { IArguments } from "./interfaces";

export class AutomatiqalCLI {
  private argv: IArguments;
  private runBook: IRunBook;
  private result: ITaskResult[];
  private httpsAgent: any;
  private automatiqal: Automatiqal;
  private rawRunBook: string;
  constructor(argv: IArguments) {
    this.argv = argv;

    try {
      this.rawRunBook = readFileSync(this.argv.file, "utf8").toString();
    } catch (e) {
      console.log(`\u274C ERROR 1000: while reading the runbook file`);
      console.log(e.message);
      process.exit(1);
    }

    this.replaceVariables();
    this.runbookSet();
    this.prepareCertificates();
    this.readBuffers();

    try {
      this.automatiqal = new Automatiqal(this.runBook, this.httpsAgent);
    } catch (e) {
      if (e.context) {
        console.log(e.context);
        process.exit(1);
      }

      if (e.message) {
        console.log(e.message);
        process.exit(1);
      }
    }

    this.emittersSet();
  }

  async run() {
    console.log(
      `${new Date().toISOString()}\t\t"${this.runBook.name}"\tStarted`
    );
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
        this.runBook = yaml.load(this.rawRunBook);
      } catch (e) {
        console.log(`\u274C ERROR 1003: while parsing the yaml file`);
        console.log(e.message);
        process.exit(1);
      }
    }

    // if the config is json
    if (this.argv.json) {
      try {
        this.runBook = JSON.parse(this.rawRunBook);
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
    const _this = this;
    this.automatiqal.emitter.on("task:result", async function (a) {
      const b: ITaskResult = a as any;

      if (b.task.operation.indexOf(".export") > -1) {
        if (!b.task.location) {
          console.log(
            `\u274C ERROR 1009: "${b.task.name}" is missing "location" parameter`
          );
          process.exit(1);
        }
        try {
          _this.writeExports(b.data, b.task.location);
        } catch (e) {
          console.log(
            `\u274C ERROR 1010: Error in "${b.task.name}". Failed to write file: "${e.path}" `
          );
          process.exit(1);
        }
      }

      console.log(
        `${b.timings.start}\t${b.timings.end}\t${b.timings.totalSeconds}(s)\t"${b.task.name}"\t${b.status}`
      );
    });

    this.automatiqal.emitter.on("runbook:result", function (r) {});

    this.automatiqal.emitter.on("runbook:log", function (l) {});

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
    } else {
      this.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
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

      if (task.details && (task.details as any).length > 0) {
        task.details = (task.details as any).map((d) => {
          if (d.file) {
            try {
              d.file = readFileSync(d.file);
              return d;
            } catch (e) {
              console.log(
                `\u274C ERROR 1007: reading file failed in task "${task.name}"`
              );
              console.log(e.message);
              process.exit(1);
            }
          }

          return d;
        });
      }
    }
  }

  /**
   * @description replace all runbook variables with their content
   */
  private replaceVariables() {
    if (this.argv.var || this.argv.v || this.argv.variables) {
      let variablesFileLocation =
        this.argv.var || this.argv.v || this.argv.variables;
      let rawVariables: string[];

      try {
        rawVariables = readFileSync(variablesFileLocation)
          .toString()
          .split(/\r?\n/);
      } catch (e) {
        console.log(
          `\u274C ERROR 1008: reading variables file "${variablesFileLocation}"`
        );
        console.log(e.message);
        process.exit(1);
      }

      for (let line of rawVariables) {
        let [varName, varContent] = line.split("=");

        const v = "\\$\\{" + varName + "\\}";
        const re = new RegExp(v, "g");

        this.rawRunBook = this.rawRunBook.replace(re, varContent);
      }
    }
  }

  private writeExports(files: any[], location: string) {
    if (!Array.isArray(files)) {
      writeFileSync(`${location}\\${(files as any).name}`, (files as any).file);

      return true;
    }

    files.map((f) => {
      if (Array.isArray(f)) {
        f.map((f1) =>
          writeFileSync(`${location}\\${(f1 as any).name}`, (f1 as any).file)
        );

        return true;
      }

      let a = 1;
      writeFileSync(`${location}\\${(f as any).name}`, (f as any).file);
    });

    return true;
  }
}
