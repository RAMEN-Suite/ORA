import { ERROR_CODE } from "../constants/ERROR_CODE";
import { ServiceError } from "../models/utility/Error";
import path from "node:path";

export class EnvironmentUtils {
  public static resolveEnvironment(name: string): string {
    const value: string | undefined = process.env[name];
    if (!value) throw new ServiceError(ERROR_CODE.MISSING_ENV_VAR, `MISSING ${name}`);
    return value;
  }

  public static resolveEnvironmentPath(name: string): string {
    return path.resolve(process.cwd(), this.resolveEnvironment(name));
  }
}
