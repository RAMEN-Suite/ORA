import fs from "fs/promises";
import { logger } from "./logger";
import { ServiceError } from "../models/utility/Error";
import { ERROR_CODE } from "../constants/ERROR_CODE";

export type JSONObject = Record<string, unknown>;

export class FileUtils {
  public static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error: unknown) {
      logger.debug(error, `${this.constructor.name}: Failed to access.`);
      return false;
    }
  }

  public static async accessJSON<T extends JSONObject>(filePath: string): Promise<T> {
    return (await this.exists(filePath)) ? this.readJSON(filePath) : ({} as T);
  }

  public static async readJSON<T extends JSONObject>(filePath: string): Promise<T> {
    const data: string = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  }

  public static async requirePath(filePath: string): Promise<string> {
    if (!(await this.exists(filePath))) {
      logger.warn({ path: filePath }, `FileUtils: Path is not accessible.`);
      throw new ServiceError(ERROR_CODE.INVALID_CONFIG, `FileUtils: Path inaccessible: ${filePath}`);
    }

    return filePath;
  }
}
