import { Access, AccessValue } from './Access';

export type Block = Headline | Metadata | Text;

export interface BlockOf<TType extends string, TProps> {
  type: TType;
  properties: TProps;
}

export type Headline = BlockOf<'headline', HeadlineProps>;
export type Metadata = BlockOf<'metadata', MetadataProps>;
export type Text = BlockOf<'text', TextProps>;

export interface HeadlineProps {
  title: AccessValue<string>;
}

export interface TextProps {
  title?: AccessValue<string>;
  text: AccessValue<string>;
}

export interface MetadataProps {
  title?: AccessValue<string>;
  items: MetadataItem[];
}

export type MetadataItem = MetadataValueItem | MetadataNodeItem;

export interface MetadataBaseItem {
  label: string;
}

export interface MetadataValueItem extends MetadataBaseItem {
  kind?: 'value';
  value: AccessValue<string>;
}

export interface MetadataNodeItem extends MetadataBaseItem {
  kind: 'node';
  value: Access;
  property: string;
  isLinked?: boolean;
}
