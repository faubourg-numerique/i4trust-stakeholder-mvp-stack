const dotenv = require("dotenv");
const fs = require("fs").promises;
const path = require("path");

const rootDirectoryPath = path.dirname(path.dirname(__dirname));

dotenv.config({ path: [rootDirectoryPath, ".env"].join(path.sep) });

async function main() {
    const exampleConfigFileNames = ["activation-service.yml.example", "kong.yaml.example", "nginx.conf.example"];
    const configDirectoryPath = [rootDirectoryPath, "config"].join(path.sep);

    for (let exampleConfigFileName of exampleConfigFileNames) {
        const configFileName = exampleConfigFileName.split(".").slice(0, -1).join(".");

        process.stdout.write(`Generating ${configFileName} configuration file...`);

        let data = await fs.readFile([configDirectoryPath, exampleConfigFileName].join(path.sep), { encoding: "utf-8" });

        for (const [name, value] of Object.entries(process.env)) {
            data = data.replaceAll("${" + name + "}", value.replaceAll("\n", "\\n"));
        }

        await fs.writeFile([configDirectoryPath, configFileName].join(path.sep), data, { encoding: "utf-8" });

        process.stdout.write(" OK\n");
    }
}

main();
