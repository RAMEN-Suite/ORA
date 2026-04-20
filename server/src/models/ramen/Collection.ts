export interface Collection {
  uuid: string;
  label: string;
}

export interface TypedCollection extends Collection {
  [key: string]: string;
}
