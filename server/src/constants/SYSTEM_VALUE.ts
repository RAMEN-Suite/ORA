const IS_PRODUCTION: boolean = !!process.env.NODE_ENV?.toLowerCase().startsWith('prod');
const IS_DEVELOPMENT: boolean = !IS_PRODUCTION;

export const SYSTEM_VALUE = {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
};
