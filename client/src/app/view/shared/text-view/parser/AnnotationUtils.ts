import { TextAnnotation } from '../models/TextAnnotation';

export class AnnotationUtils {
  public static isTextAnnotation(node: Record<string, unknown>): node is TextAnnotation {
    return (
      typeof node['uuid'] === 'string' &&
      typeof node['type'] === 'string' &&
      typeof node['startIndex'] === 'number' &&
      typeof node['endIndex'] === 'number'
    );
  }

  public static toTextAnnotations(nodes: Record<string, unknown>[]): TextAnnotation[] {
    return nodes.filter(this.isTextAnnotation);
  }
}
