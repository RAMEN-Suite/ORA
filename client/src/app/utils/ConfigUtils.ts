import { Config } from '../models/Config';
import { Nullable } from 'primeng/ts-helpers';

type Category = Config.Category;
type Property = Config.Property;

export class Categories {
  public static find(categories: Category[], value: string): Nullable<Category> {
    return categories.find((category: Category): boolean => category.value === value);
  }

  public static initial(categories: Category[], initialValue: string): Category {
    const category: Nullable<Category> = this.find(categories, initialValue) ?? categories[0];
    if (!category) throw new Error('Cannot load page without an initial category.');
    return category;
  }
}

export class Properties {
  public static scoped(properties: Property[], value: string): Property[] {
    return properties.filter((property: Property): boolean => {
      return !property.scope || property.scope.includes(value);
    });
  }
}
