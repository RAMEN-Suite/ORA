export type MaybePromise = void | Promise<void>;
export type Nullable<Value> = Value | null | undefined;
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Mixed = string | number | boolean | null;
