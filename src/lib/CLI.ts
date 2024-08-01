import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { Agent } from "https";
import { homedir } from "os";
import { load as yamlLoad, dump as yamlDump } from "js-yaml";
import { Automatiqal } from "automatiqal";
import { varLoader } from "@informatiqal/variables-loader";
import { printTable, Table } from "console-table-printer";

import { IRunBook, ITask } from "automatiqal/dist/RunBook/RunBook.interfaces";
import { ITaskResult } from "automatiqal/dist/RunBook/Runner";
import { Logger } from "./Logger";

import { IArguments } from "./interfaces";
import * as path from "path";
import { schemaURL } from "./sample";

export class AutomatiqalCLI {
  private argv: IArguments;
  private runBook: IRunBook;
  private logger: Logger;
  private result: ITaskResult[];
  private httpsAgent: any;
  private automatiqal: Automatiqal;
  private rawRunBook: string;
  private runbookVariablesList: string[];
  // private runbookVariablesValues: { [k: string]: any } = {};
  private variablesValues: { [x: string]: string | number | boolean };
  private emitterMessages: string[];
  private specialVariables = [
    "GUID",
    "TODAY",
    "NOW",
    "INCREMENT",
    "DECREMENT",
    "RANDOM",
  ];

  constructor(argv: IArguments, downloadedRunbook) {
    this.argv = argv;
    this.result = [];
    this.rawRunBook = downloadedRunbook;
    this.logger = Logger.getInstance(argv.summary || argv.s);

    // if the runbook is downloaded then clean it first
    // by removing commented and empty lines
    if (this.rawRunBook) this.rawRunBook = this.cleanDownloadedFile();

    // if the runbook was not an url
    // try and read the file
    if (!this.rawRunBook) {
      try {
        this.rawRunBook = this.readRunbookFile();
      } catch (e) {
        this.logger.error(e.message, 1000);
      }
    }

    this.runbookSet();
    this.importExternalYamlFiles();
    this.rawRunBook = JSON.stringify(this.runBook);

    if (this.argv.compile) {
      const yamlRunbook = yamlDump(this.runBook);
      const output = `${schemaURL}\n\n${yamlRunbook}`;

      if (this.argv.compile == true) {
        console.log(output);
        process.exit(1);
      }

      if (typeof this.argv.compile == "string") {
        try {
          writeFileSync(this.argv.compile, output);
          console.log(`Compiled schema was saved in "${this.argv.compile}"`);
          process.exit(1);
        } catch (e) {
          console.log(e.message);
          process.exit(1);
        }
      }
    }

    // match all strings in between ${ and }
    // and exclude $${...} ones
    this.runbookVariablesList = this.rawRunBook
      .match(/(?<!\$)(\${)(.*?)(?=})/g)
      .map((v) => v.substring(2));

    // TODO: simplify this maybe?
    // Check if there are variables in the runbook
    // but no variables sources was provided
    if (
      this.runbookVariablesList &&
      this.runbookVariablesList.length > 0 &&
      !this.argv.v &&
      !this.argv.variables &&
      !this.argv.var &&
      !this.argv.g &&
      !this.argv.global &&
      !this.argv.e &&
      !this.argv.env &&
      !this.argv.i &&
      !this.argv.inline
    ) {
      this.logger.error(
        `\nVariables found:\n${this.runbookVariablesList
          .map((v) => `  ${v}`)
          .join("\n")}`,
        1012
      );
    }

    // global variables should be read before the variables file
    // variables file have priority over the global variables
    // if (this.argv.g || this.argv.global) this.readGlobalVariables();
    const variablesData = varLoader({
      sources: {
        environment: this.argv.e || this.argv.env,
        file: this.argv.v || this.argv.var || this.argv.variables,
        global:
          this.argv.g || this.argv.global
            ? `${homedir()}/.automatiqal`
            : undefined,
        inline: this.argv.i || this.argv.inline,
      },
      variables: Array.from(this.runbookVariablesList),
      ignore: this.specialVariables,
    });

    if (variablesData.missing)
      this.logger.error(
        variablesData.missing.map((v) => `  - ${v}`).join("\n"),
        1014
      );

    this.variablesValues = variablesData.values;

    // TODO: simplify this maybe?
    if (
      this.argv.var ||
      this.argv.v ||
      this.argv.variables ||
      this.argv.v ||
      this.argv.variables ||
      this.argv.var ||
      this.argv.g ||
      this.argv.global ||
      this.argv.e ||
      this.argv.env ||
      this.argv.i ||
      this.argv.inline
    ) {
      this.rawRunBook = this.replaceVariables(
        this.rawRunBook,
        this.variablesValues
      );
      this.runBook = JSON.parse(this.rawRunBook);
    }

    this.checkExportPaths();

    if (argv.listvars || argv.l) {
      this.printDefinedVariables();
      process.exit(0);
    }

    if ((this.runBook.environment.authentication as any).cert) {
      this.prepareCertificates();
    } else {
      this.httpsAgent = new Agent({
        rejectUnauthorized: false,
      });
    }

    // no need to read any files if only connection is being tested
    if (!this.argv.c && !this.argv.connect) this.readBuffers();

    try {
      const disableSchemaValidation =
        this.argv.disableValidation || this.argv.d;

      this.automatiqal = new Automatiqal(this.runBook, {
        httpsAgent: this.httpsAgent,
        disableSchemaValidation: disableSchemaValidation || false,
      });
    } catch (e) {
      if (e.context) throw new Error(e.context);
      if (e.message) throw new Error(e.message);
    }

    this.emittersSet();
  }

  async run() {
    if (!this.argv.raw) this.printRunbookDetails();

    await this.automatiqal.run();

    return this.result;
  }

  /**
   * @description set the runbook based on the provided yaml/json file
   */
  private runbookSet() {
    // if the config is yaml
    if (!this.argv.json) {
      try {
        this.runBook = yamlLoad(this.rawRunBook) as IRunBook;
      } catch (e) {
        this.logger.error(e.message, 1003);
      }
    }

    // if the config is json
    if (this.argv.json) {
      try {
        this.runBook = JSON.parse(this.rawRunBook);
      } catch (e) {
        this.logger.error(e.message, 1003);
      }
    }

    if (this.argv.c || this.argv.connect) {
      this.runBook.tasks = [
        { name: "Test connectivity", operation: "about.get" },
      ];
    }
  }

  /**
   * @description create all required emitters
   */
  private emittersSet() {
    const _this = this;
    this.automatiqal.emitter.on("task:result", function (a) {
      const b: ITaskResult = a as any;

      let isExportCommand = false;

      if (
        _this.runBook.edition == "windows" &&
        b.task.operation.indexOf(".export") > -1
      )
        isExportCommand = true;

      const exportCommandsSaaS = ["extension.download", "app.export"];

      if (
        _this.runBook.edition == "saas" &&
        exportCommandsSaaS.includes(b.task.operation)
      )
        isExportCommand = true;

      if (b.task.details && b.task.details.hasOwnProperty("file"))
        (b.task.details as any).file = "<BINARY CONTENT>";

      if (isExportCommand == true) {
        // TODO: is this needed? The schema validation should prevent this already?
        // if ((!b.task.details as any).location) {
        //   _this.logger.error(
        //     `ERROR: "${b.task.name}" is missing "location" parameter`
        //   );
        // }
        try {
          // write the exports data
          _this.writeExports(
            Array.isArray(b.data) ? b.data : [b.data],
            (b.task.details as any).location
          );

          // replace the export data with placeholder
          // the placeholder will be visible if we have to
          // output the task data
          if (Array.isArray(b.data)) {
            if (b.data && b.data.length > 0) {
              b.data = b.data.map((r: any) => {
                if (r.file) r.file = "<BINARY CONTENT>";

                return r;
              });
            }
          }
        } catch (e) {
          _this.logger.error(
            `Error in "${b.task.name}". Failed to write file: "${e.path}"`
          );
        }
      }

      // TODO: move this section inside the try ... catch section above
      if (b.task.operation == "contentLibrary.exportMany") {
        if ((b.data as any).length > 0) {
          b.data = (b.data as any).map((d) => {
            return d.map((f) => {
              f.file = "<BINARY CONTENT>";
              return f;
            });
          });
        }
      }

      _this.result.push(b);

      if (!_this.argv.raw) {
        _this.logger.taskEntry(
          b.timings.start,
          b.timings.end,
          `${b.timings.totalSeconds}`,
          b.task.name.replace(/(.{27})..+/, "$1..."),
          `${(b.data as []).length}`,
          b.status
        );
      }
    });

    this.automatiqal.emitter.on("runbook:result", function (r) {});

    this.automatiqal.emitter.on("runbook:log", function (l) {});

    this.automatiqal.emitter.on("error", function (errorMessage) {
      //TODO: here. exit?
      _this.logger.error(errorMessage);
    });
  }

  /**
   * @description if the authentication is certificates based
   *     read the certificates and prepare the httpsAgent
   */
  private prepareCertificates() {
    {
      let cert: Buffer;
      let key: Buffer;

      try {
        cert = readFileSync(
          (this.runBook.environment.authentication as any).cert
        );
        key = readFileSync(
          (this.runBook.environment.authentication as any).key
        );
      } catch (e) {
        this.logger.error(e.message, 1006);
      }

      this.httpsAgent = new Agent({
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
          (task.details as any).file = createReadStream(
            (task.details as any).file
          );
        } catch (e) {
          this.logger.error(e.message, 1007);
        }
      }

      if (task.details && (task.details as any).length > 0) {
        task.details = (task.details as any).map((d) => {
          if (d.file) {
            try {
              d.file = createReadStream(d.file);
              return d;
            } catch (e) {
              this.logger.error(e.message, 1007);
            }
          }

          return d;
        });
      }

      //TODO: any other operations that follow the xxxMany import/upload path?
      // app.uploadMany have to be handled separately because we have to read
      // the folder content first and then transform to read streams
      if (task.operation == "app.uploadMany") {
        if (task.details && (task.details as any)["location"]) {
          // check if the folder actually exists
          if (!existsSync((task.details as any)["location"]))
            this.logger.error("Folder do not exists", 1007);

          const files = readdirSync((task.details as any)["location"]).filter(
            (f) => path.extname(f).toLowerCase() == ".qvf"
          );

          // no qvf files were found. We are importing qvf files after all
          if (files.length == 0)
            this.logger.error(
              `No qvf files files in the location: ${
                (task.details as any)["location"]
              }`
            );

          task.details = files.map((f) => ({
            file: createReadStream(
              `${(task.details as any)["location"]}\\${f}`
            ),
            name: path.basename(f, path.extname(f)),
          }));
        }
      }
    }
  }

  /**
   * @description replace all runbook variables with their content
   */
  private replaceVariables(
    text: string,
    vars: { [x: string]: string | number | boolean }
  ) {
    Object.entries(vars).forEach(([varName, varValue]) => {
      try {
        const v = "\\$\\{" + varName + "\\}";
        const re = new RegExp(v, "g");

        // this.runbookVariablesValues[varName] = varValue;
        text = text.replace(re, varValue.toString());
      } catch (e) {
        this.logger.error(e.message, 9999);
      }
    });

    return text;
  }

  // TODO: dont like this much. Refactor at some point
  private writeExports(files: any[], location: string) {
    let _this = this;

    if (!Array.isArray(files)) {
      location = _this.prepareExportFolder((files as any).path, location);
      writeFileSync(`${location}\\${(files as any).name}`, (files as any).file);

      return true;
    }

    files.map((f) => {
      if (Array.isArray(f)) {
        f.map((f1) => {
          let baseLocation = location;
          if (f1.path)
            baseLocation = _this.prepareExportFolder(f1.path, baseLocation);

          writeFileSync(
            `${baseLocation}\\${(f1 as any).name}`,
            (f1 as any).file
          );
        });

        return true;
      }

      writeFileSync(`${location}\\${(f as any).name}`, (f as any).file);
    });

    return true;
  }

  private printRunbookDetails() {
    this.logger.info(`CLI Version   : __VERSION`);
    this.logger.info(`Runbook file  : ${this.argv.file || this.argv.f}`);
    this.logger.info(`Runbook name  : ${this.runBook.name}`);

    if (this.argv.v || this.argv.var || this.argv.variables)
      this.logger.info(
        `Variables file: ${this.argv.v || this.argv.var || this.argv.variables}`
      );
    if (this.runBook.description)
      this.logger.info(`Description: ${this.runBook.description}`);

    this.logger.info(`Start time    : ${new Date().toISOString()}`);
    this.logger.info(`---`);

    this.logger.taskEntry(
      "START TIME".padEnd(24, " "),
      "END TIME".padEnd(24, " "),
      "DURATION(s)",
      "TASK NAME".padEnd(30, " "),
      "ENTITIES".padEnd(10, " "),
      "STATUS"
    );
  }

  private checkExportPaths() {
    let nonExistingPaths = [];

    this.runBook.tasks.forEach((task) => {
      if (task.details?.["location"]) {
        const isValidPath = existsSync(task.details?.["location"]);

        if (!isValidPath)
          nonExistingPaths.push(
            `Initial check: Export path for task "${task.name}" do not exists "${task.details["location"]}"`
          );
      }
    });

    if (nonExistingPaths.length > 0)
      this.logger.error(nonExistingPaths.join("\n"));
  }

  private prepareExportFolder(path: string, baseLocation: string) {
    if (path) {
      let paths = path.split("/");
      paths.pop();

      baseLocation += paths.join("/");

      mkdirSync(baseLocation, { recursive: true });
    }

    return baseLocation;
  }

  private readRunbookFile() {
    const lines: string[] = [];

    readFileSync(this.argv.file || this.argv.f)
      .toString()
      .split("\n")
      .forEach((line) => {
        const re = new RegExp(/^( +)?#( +)?/, "g");
        if (!re.test(line) && line != "" && line != "\r" && line != "\r\n")
          lines.push(line);
      });

    return lines.join("\n");
  }

  private cleanDownloadedFile() {
    const rawLines = this.rawRunBook.split("\n");
    const lines: string[] = [];

    rawLines.forEach((line) => {
      const re = new RegExp(/^( +)?#( +)?/, "g");
      if (!re.test(line) && line != "" && line != "\r" && line != "\r\n")
        lines.push(line);
    });

    return lines.join("\n");
  }

  private printDefinedVariables() {
    console.log(`Distinct variables defined:`);

    const counts = {};

    for (const num of this.runbookVariablesList) {
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    const table = new Table({
      columns: [
        { name: "Variable", alignment: "left" },
        { name: "Occurrences", alignment: "right" },
      ],
    });

    Object.entries(counts).map(([key, value]) => {
      table.addRow({
        Variable: key,
        Occurrences: value,
      });
    });

    table.printTable();

    console.log("");
  }

  private importExternalYamlFiles(): void {
    let parsed = false;

    while (parsed == false) {
      let haveImport = false;

      for (let i = 0; i < this.runBook.tasks.length; i++) {
        if (this.runBook.tasks[i]["import"]) {
          const externalFileContent = this.readImportFile(
            this.runBook.tasks[i]["import"]["path"] ||
              this.runBook.tasks[i]["import"],
            this.runBook.tasks[i]["import"]["vars"] || []
          );

          this.runBook.tasks.splice(i, 1, ...externalFileContent);

          haveImport = true;
        }
      }

      if (haveImport == false) parsed = true;
    }
  }

  private readImportFile(
    path: string,
    variables: { [k: string]: string | number | boolean }[]
  ) {
    const exists = existsSync(path);

    const v = {};
    variables.map((v1) => {
      Object.entries(v1).forEach(([key, value]) => {
        v[key] = value;
      });
    });

    if (!exists) this.logger.error(`Import file not found: ${path}`);

    let fileContent = readFileSync(path).toString();
    fileContent = this.replaceVariables(fileContent, v);

    const parsedContent = yamlLoad(fileContent);

    return parsedContent as ITask[];
  }
}
