import { ERROR_CODE } from '../../constants/ERROR_CODE.js';

abstract class AbstractError extends Error {
  public errorCode: ERROR_CODE;

  protected constructor(errorCode: ERROR_CODE, context?: string) {
    super(`[${errorCode}] ${context ?? ''}`);
    this.errorCode = errorCode;
  }
}

export class DatabaseError extends AbstractError {
  constructor(errorCode: ERROR_CODE, context?: string) {
    super(errorCode, context);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ExpressError extends AbstractError {
  constructor(errorCode: ERROR_CODE, context?: string) {
    super(errorCode, context);
    Object.setPrototypeOf(this, ExpressError.prototype);
  }
}
