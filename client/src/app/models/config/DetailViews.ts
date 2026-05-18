import { Binding } from './Config';

export interface DetailViews {
  entity: DetailView[];
  collection: DetailView[];
}

export interface DetailView {
  match: string[];
  blocks: Block[];
}

export type Block = Headline | Metadata | Text;

export interface BlockOf<TType extends string, TProps> {
  type: TType;
  properties: TProps;
}

export type Headline = BlockOf<'headline', HeadlineProps>;
export type Metadata = BlockOf<'metadata', MetadataProps>;
export type Text = BlockOf<'text', TextProps>;

export interface HeadlineProps {
  title: Binding;
}

export interface TextProps {
  title?: string;
  text: Binding;
  annotations?: Binding;
}

export interface MetadataProps {
  title?: Binding;
  items: MetadataItem[];
}

export type MetadataItem = MetadataValueItem | MetadataNodeItem;

export interface MetadataBaseItem {
  label: string;
}

export interface MetadataValueItem extends MetadataBaseItem {
  kind?: 'value';
  value: Binding;
}

export interface MetadataNodeItem extends MetadataBaseItem {
  kind: 'node';
  value: Binding;
  property: string;
  isLinked?: boolean;
}
