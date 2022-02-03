import { writeFileSync } from "fs";
import yaml from "js-yaml";

export function generateSample(format: string) {
  if (!format) format = "yaml";
  //   const allFormat = format.split(",");

  const qseowSample = {
    name: "Sample run book",
    environment: {
      host: "${host}",
      port: 4242,
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
        operation: "apps.import",
        details: {
          file: "path/to/the/app/qvf",
          name: "Import Name",
        },
      },
      {
        name: "Create new stream",
        description: "create brand new stream for our app",
        operation: "streams.create",
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
          name: "My new stream",
        },
        config: {
          multiple: false,
        },
      },
      {
        name: "Update app",
        description:
          "add some custom properties and tags to the imported and published app",
        filter: "name eq 'Import Name'",
        operation: "apps.update",
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

  const variables = {
    host: "my-qlik-host.com",
    certificate: "path/to/client.pem",
    certificate_key: "path/to/client_key.pem",
    user_dir: "SOME-USER-DIR",
    user_name: "SOME-USER",
  };

  writeFileSync("automatiqalCLI-sample.yaml", yaml.dump(qseowSample, null, 4));
  writeFileSync("automatiqalCLI.variables.yaml", yaml.dump(variables, null, 4));
}
