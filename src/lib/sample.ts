import { writeFileSync } from "fs";
import { dump } from "js-yaml";

export function generateSample(format: string) {
  if (!format) format = "yaml";

  const qseowSample = {
    name: "Sample run book",
    environment: {
      host: "${host}",
      port: 4242,
      edition: "windows",
      authentication: {
        cert: "${certificate}",
        key: "${certificate_key}",
        user_dir: "${user_dir}",
        user_name: "${user_name}",
      },
    },
    tasks: [
      {
        name: "Import application",
        description: "Import brand new qvf",
        operation: "app.upload",
        details: {
          file: "path/to/the/app/qvf",
          name: "Import Name",
        },
      },
      {
        name: "Create new stream",
        description: "create brand new stream for our app",
        operation: "stream.create",
        details: {
          name: "My new stream",
        },
      },
      {
        name: "Publish imported app",
        description: "Publish the imported app into the new stream",
        operation: "app.publish",
        filter: "name eq 'Import Name'",
        details: {
          stream: "My new stream",
        },
        options: {
          multiple: false,
        },
      },
      {
        name: "Update app",
        description:
          "add some custom properties and tags to the imported and published app",
        filter: "name eq 'Import Name'",
        operation: "app.update",
        options: {
          multiple: true,
        },
        details: {
          customProperties: [
            "customProperty1=value1",
            "customProperty1=value2",
            "customPropertyOther=otherValue",
          ],
          tags: ["tag 1", "tag 2", "tag 3"],
        },
      },
    ],
  };

  const variables = `host=my-qlik-host.com
certificate=path/to/client.pem
certificate_key=path/to/client_key.pem
user_dir=SOME-USER-DIR
user_name=SOME-USER`;

  try {
    writeFileSync(
      ".\\automatiqal-sample.yaml",
      `# yaml-language-server: $schema=https://github.com/Informatiqal/automatiqal-cli-schema/blob/main/schemas/runbook.json?raw=true

${dump(qseowSample, {
  // indent: 4,
  lineWidth: 300,
})}`
    );
  } catch (e) {
    console.log(`\u274C ERROR: Unable to create sample file"`);
    console.log(e.message);
  }

  try {
    writeFileSync(".\\automatiqal-sample.variables.yaml", variables);
  } catch (e) {
    console.log(`\u274C ERROR: Unable to create sample variables file"`);
    console.log(e.message);
  }

  console.log(`\u2705 "automatiqal-sample.yaml" generated!`);
  console.log(`\u2705 "automatiqal-sample.variables.yaml" generated!`);
  console.log("");
  console.log(
    `\u2705 \x1b[33mMore examples can be found at:\x1b[0m`
  );
  console.log("    - https://github.com/Informatiqal/automatiqal-cli/tree/main/runbook-examples")
  console.log("    - https://github.com/Informatiqal/automatiqal-recipes")
  process.exit(0);
}
