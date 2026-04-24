export interface ListOptions {
  limit?: number;
  skip?: number;
  orderBy?: string;
  asc?: boolean;
}

export interface NormalizeOptions {
  toLower?: boolean;
  toUpper?: boolean;
}
