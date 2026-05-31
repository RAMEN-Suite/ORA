import path from "node:path";
import { ValidationError, Validator, ValidatorResult } from "jsonschema";
import { ServiceError } from "../models/utility/Error";
import { ERROR_CODE } from "../constants/ERROR_CODE";
import { logger } from "../utils/logger";
import { FileUtils, JSONObject } from "../utils/FileUtils";
import { EnvironmentUtils } from "../utils/EnvironmentUtils";

export type Config = JSONObject;

const SCHEMA_DIR: string = path.resolve(process.cwd(), "../schema");
const CONFIG_FILES = [
  "lists.config.json",
  "details.config.json",
  "indexes.config.json",
  "annotations.config.json",
  "site.config.json",
] as const;

export class ConfigService {
  private static configPath: string | undefined;
  private static readonly validator: Validator = new Validator();

  public static async initService(): Promise<void> {
    this.configPath = EnvironmentUtils.resolveEnvironmentPath("CONFIGURATION_PATH");
    await FileUtils.requirePath(this.configPath);
    await this.validateConfigFiles();
  }

  public static async fetchConfig(): Promise<Config> {
    if (!this.configPath) throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, "ConfigService not initialized");
    const config: Config = {};

    for (const file of CONFIG_FILES) {
      const key: string = file.replace(".config.json", "");
      config[key] = await FileUtils.readJSON(path.join(this.configPath, file));
    }

    return config;
  }

  private static async validateConfigFiles(): Promise<void> {
    if (!this.configPath) throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, "ConfigService not initialized");

    for (const file of CONFIG_FILES) {
      const key: string = file.replace(".config.json", "");
      const configPath: string = path.join(this.configPath, file);
      const schemaPath: string = path.join(SCHEMA_DIR, `${key}.schema.json`);

      const config: Config = await FileUtils.readJSON(configPath);
      const schema: Config = await FileUtils.readJSON(schemaPath);
      const result: ValidatorResult = this.validator.validate(config, schema);

      if (!result.valid) {
        const message: string = result.errors.map((error: ValidationError): string => error.stack).join("; ");
        logger.error({ file: configPath, schema: schemaPath, errors: result.errors }, "ConfigService: Invalid configuration.");
        throw new ServiceError(ERROR_CODE.INVALID_CONFIG, `Invalid config against "${key}.schema.json": ${message}`);
      }

      logger.debug({ file: configPath, schema: schemaPath }, "ConfigService: Configuration file validated.");
    }
  }
}

export async function initConfigService(): Promise<void> {
  logger.info("ConfigService: Initializing...");
  await ConfigService.initService();
  logger.info("ConfigService: Configuration initialized.");
}
