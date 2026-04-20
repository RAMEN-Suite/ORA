export interface Content {
  uuid: string;
  label: string;
}

export interface Text extends Content {
  text: string;
}
