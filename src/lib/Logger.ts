import { writeFileSync } from "fs";

export class Logger {
  static instance: Logger;
  private saveOutput: string;
  messages: string[] = [];
  private errors = {
    1000: "While reading the runbook file",
    1001: "Please provide file location",
    1003: "While parsing the yaml file",
    1004: "While parsing the json file",
    1005: "While writing the output file",
    1006: "Reding certificates",
    1007: `Reading file failed in task`,
    1012: "Variable(s) declaration found but no variables file was provided",
    1011: "Variable(s) file not found",
    1013: "While reading the runbook file",
    1014: "Variable(s) value not found",
    9999: "INTERNAL ERROR",
  };
  constructor(saveOutput) {
    this.saveOutput = saveOutput;
  }

  public static getInstance(saveOutput): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(saveOutput);
    }
    return Logger.instance;
  }

  error(message: string, errorId?: number) {
    if (errorId) {
      const genericError = `\u274C ERROR: ${this.errors[errorId]}`;
      console.log(genericError);
      this.messages.push(genericError);
    }

    if (message) {
      console.log(message);
      this.messages.push(message);
    }

    if (this.saveOutput) this.writeOutput();
    process.exit(1);
  }

  debug() {}

  info(message: string) {
    console.log(message);
    this.messages.push(message);
  }

  writeOutput() {
    try {
      writeFileSync(this.saveOutput, this.messages.join("\n"));
    } catch (e) {
      console.log(`Error while writing output messages`);
      console.log(e.message);
    }
  }
}
