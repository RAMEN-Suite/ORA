import { param, query, ValidationChain } from "express-validator";
import { REGEXP } from "../constants/REGEXP";
import { Utils } from "../utils/Utils";

export const filter: ValidationChain[] = [
  query("label").optional().isString().isLength({ min: 1, max: 48 }).trim().escape().matches(REGEXP.PROPERTY),
  query("search").optional().isString().isLength({ min: 1, max: 512 }).trim().escape(),
  query("field").optional().isString().isLength({ min: 1, max: 48 }).trim().escape().matches(REGEXP.PROPERTY),

  query("facets").optional().customSanitizer(Utils.parseArray).isArray({ max: 10 }),
  query("facets.*").isString().isLength({ min: 1, max: 512 }).trim().matches(REGEXP.QUERY),

  query("filters").optional().customSanitizer(Utils.parseArray).isArray({ max: 10 }),
  query("filters.*").isString().isLength({ min: 1, max: 512 }).trim(),
];

export const list: ValidationChain[] = [
  query("limit").optional().isInt({ min: 0, max: 500 }),
  query("skip").optional().isInt({ min: 0 }),
  query("orderBy").optional().isString().isLength({ min: 1, max: 96 }).trim().escape().matches(REGEXP.QUERY),
  query("asc").optional().isBoolean(),
  ...filter,
];

export const view: ValidationChain[] = [
  param("uuid").isString().matches(REGEXP.IDENTIFIER),
  query("paths").optional().customSanitizer(Utils.parseArray).isArray({ max: 50 }),
  query("paths.*").isString().isLength({ min: 1, max: 512 }).trim(),
];

export const language: ValidationChain[] = [param("language").matches(REGEXP.LANGUAGE)];

export const chains = { filter, list, view, language };
