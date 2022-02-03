import chai from "chai";
import { spawn } from "child_process";

const expect = chai.expect;

interface IProcessReturn {
  code: number;
  output?: string[];
}

async function runProcess(args: string[]): Promise<IProcessReturn> {
  return new Promise<IProcessReturn>(function (resolve, reject) {
    const process = spawn("node", ["./dist/index.js", ...args]);
    let output: string = "";

    process.stdout.on("data", function (data) {
      output += data.toString();
    });

    process.stderr.on("error", function (err) {
      reject({ code: err });
    });

    process.on("close", function (code) {
      resolve({ code, output: output.split("\n") });
    });
  });
}

describe("Automatiqal Tests", function () {
  this.slow(1000);
  this.timeout(60000);

  it("automatiqalCLI-example-1", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-1.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });
});
