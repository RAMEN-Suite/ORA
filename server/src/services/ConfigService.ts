import { ServiceError } from "../models/utility/Error";
import { ERROR_CODE } from "../constants/ERROR_CODE";
import { logger } from "../utils/logger";
import path from "node:path";
import fs from "fs/promises";
import { ValidationError, Validator, ValidatorResult } from "jsonschema";

export type JSON = Record<string, unknown>;

const SCHEMA_DIR: string = path.resolve(process.cwd(), "../schema");
const CONFIG_FILES: string[] = [
  "lists.config.json",
  "details.config.json",
  "features.config.json",
  "annotations.config.json",
  "site.config.json",
];

export class ConfigService {
  private static overridesPath: string | undefined;
  private static readonly validator: Validator = new Validator();

  public static async initService(): Promise<void> {
    const overridesPath: string | undefined = process.env.CONFIGURATION_PATH;
    if (!overridesPath) throw new ServiceError(ERROR_CODE.MISSING_ENV_VAR, "Missing CONFIGURATION_PATH");
    this.overridesPath = path.resolve(process.cwd(), overridesPath);

    const isOverrideAccessible: boolean = await this.exists(this.overridesPath);
    if (!isOverrideAccessible) logger.warn({ path: this.overridesPath }, "ConfigService: Are you missing overrides?");

    await this.validateConfigFiles();
  }

  public static async fetchConfig(): Promise<JSON> {
    if (!this.overridesPath) throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, "ConfigService not initialized");
    const config: JSON = {};

    for (const file of CONFIG_FILES) {
      const key: string = file.replace(".config.json", "");
      config[key] = await this.accessJSON(path.join(this.overridesPath, file));
    }

    return config;
  }

  private static async validateConfigFiles(): Promise<void> {
    if (!this.overridesPath) throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, "ConfigService not initialized");

    for (const file of CONFIG_FILES) {
      const key: string = file.replace(".config.json", "");
      const configPath: string = path.join(this.overridesPath, file);
      const schemaPath: string = path.join(SCHEMA_DIR, `${key}.schema.json`);

      const config: JSON = await this.accessJSON(configPath);
      const schema: JSON = await this.readJSON(schemaPath);
      const result: ValidatorResult = this.validator.validate(config, schema);

      if (!result.valid) {
        const message: string = result.errors.map((error: ValidationError): string => error.stack).join("; ");
        logger.error({ file: configPath, schema: schemaPath, errors: result.errors }, "ConfigService: Invalid configuration.");
        throw new ServiceError(ERROR_CODE.INVALID_CONFIG, `Invalid config against "${key}.schema.json": ${message}`);
      }

      logger.debug({ file: configPath, schema: schemaPath }, "ConfigService: Configuration file validated.");
    }
  }

  private static async readJSON(filePath: string): Promise<JSON> {
    const data: string = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as JSON;
  }

  private static async accessJSON(filePath: string): Promise<JSON> {
    const isAccessible: boolean = await this.exists(filePath);
    return isAccessible ? this.readJSON(filePath) : {};
  }

  private static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error: unknown) {
      logger.debug(error, "ConfigService: Failed to access.");
      return false;
    }
  }
}

export async function initConfigService(): Promise<void> {
  logger.info("ConfigService: Initializing...");
  await ConfigService.initService();
  logger.info("ConfigService: Configuration initialized.");
}
