import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_GATEWAYS = ["ora"];
const API_SERVERS = {
  ora: ["https://ora.domain.de"],
};

const OPENAPI_VERSION = "3.0.1";
const OPENAPI_TITLE = "ORA API Gateway:";
const OPENAPI_API_VERSION = "1.0.0";

const PWD_PATH = path.join(__dirname);
const ROOT_PATH = path.join(__dirname, "..");
const HANDLERS_PATH = path.join(ROOT_PATH, "src", "handlers");

function parseYAMLFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return YAML.parse(content, { logLevel: "error" });
  } catch (error) {
    console.error("[ERROR]", `Error parsing YAML file ${filePath}:`, error);
    throw error;
  }
}

function writeYAMLToFile(filePath, content) {
  fs.writeFileSync(filePath, YAML.stringify(content), "utf8");
  console.log("[SUCCESS]", `File written: ${filePath}`);
}

function getAllYamlFiles(dir) {
  try {
    const files = [];
    const dirContent = fs.readdirSync(dir);

    for (const file of dirContent) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const subFiles = getAllYamlFiles(filePath);
        files.push(...subFiles);
      } else if (filePath.endsWith(".yaml")) {
        files.push(filePath);
      }
    }

    return files;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function processOpenAPIFiles(files) {
  let collectedPaths = {};

  for (const file of files) {
    const parsedContent = parseYAMLFile(file);

    if (!parsedContent?.openapi) {
      console.log("[ERROR]", `Skipping non-OpenAPI file: ${file}`);
      continue;
    }

    collectedPaths = { ...collectedPaths, ...parsedContent.paths };
  }

  return collectedPaths;
}

function generateOpenAPISpec(collectedPaths, templateName, outputFile) {
  const servers = API_SERVERS[templateName] ?? [];
  const openApiSpec = {
    openapi: OPENAPI_VERSION,
    info: {
      title: `${OPENAPI_TITLE} ${templateName.toUpperCase()}`,
      version: OPENAPI_API_VERSION,
    },
    servers: servers.map((url) => ({ url })),
    components: {
      securitySchemes: {
        basicAuth: {
          type: "http",
          scheme: "basic",
        },
      },
    },
    security: [{ basicAuth: [] }],
    paths: collectedPaths,
  };

  writeYAMLToFile(outputFile, openApiSpec);
}

function main() {
  try {
    for (const gateway of API_GATEWAYS) {
      if (!gateway) continue;

      const DIST_OPENAPI_PATH = path.join(PWD_PATH, `openapi-${gateway}.yaml`);
      const GATEWAY_HANDLERS_PATH = path.join(HANDLERS_PATH, gateway);

      const filesToProcess = getAllYamlFiles(GATEWAY_HANDLERS_PATH);
      const collectedPaths = processOpenAPIFiles(filesToProcess);

      generateOpenAPISpec(collectedPaths, gateway, DIST_OPENAPI_PATH);
      console.log("[SUCCESS]", "OpenAPI definitions generated and saved:", gateway);
    }
  } catch (error) {
    console.error("[ERROR]", "An error occurred:", error);
  }

  console.log("[COMPLETED]", "API Documentation generated successfully.");
}

main();
