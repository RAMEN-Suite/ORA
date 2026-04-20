export interface Entity {
  uuid: string;
  label: string;
}

export interface TypedEntity extends Entity {
  [key: string]: string;
}
