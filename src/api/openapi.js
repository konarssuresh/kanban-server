const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const openapiPath = path.resolve(__dirname, "openapi.yaml");

const loadOpenApiSpec = () => {
  const file = fs.readFileSync(openapiPath, "utf8");
  return yaml.load(file);
};

module.exports = { loadOpenApiSpec };
