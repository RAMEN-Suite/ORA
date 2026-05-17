export type AccessPath = string;
export type AccessValue<T = unknown> = T | Access;

export interface Access {
  path: AccessPath;
}
