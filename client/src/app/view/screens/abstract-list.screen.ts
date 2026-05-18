import { Component, computed, inject, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { ListService } from '../../services/list.service';
import { Registry } from '../../models/Registry';
import { FilterOption, ListOption, ListView, Option, OptionGroup, Property } from '../../models/config/ListViews';
import { Utils } from '../../utils/Utils';
import { PreviousLinkedValue } from '../../../types/global';

@Component({ template: '' })
export abstract class AbstractListScreen<TOption extends ListOption = ListOption> {
  protected readonly configService: ConfigService = inject(ConfigService);
  protected readonly listService: ListService = inject(ListService);
  protected readonly config: Registry = this.configService.config();

  protected readonly listView: WritableSignal<ListView<TOption> | undefined> = signal(undefined);
  protected readonly listOptions: Signal<TOption[]> = computed((): TOption[] => [
    ...(this.listView()?.options ?? []),
    ...this.additionalListOptions(),
  ]);

  protected readonly activeOption: WritableSignal<TOption | undefined> = signal(undefined);
  protected readonly activeOptionLabel: Signal<string> = computed((): string => this.activeOption()?.value ?? '');
  protected readonly activeProperties: Signal<Property[]> = computed((): Property[] => {
    const option: TOption | undefined = this.activeOption();
    return option ? this.mergedProperties(option) : [];
  });

  protected init(listView: ListView<TOption>): void {
    this.listView.set(listView);
    this.activeOption.set(this.getInitialOption());
  }

  protected additionalListOptions(): TOption[] {
    return [];
  }

  protected currentOption(): TOption {
    const option: TOption | undefined = this.activeOption();
    if (!option) throw new Error('Missing active option. Did you forget to call init(...) in the screen constructor?');
    return option;
  }

  protected getInitialOption(): TOption | undefined {
    const initial: string | undefined = this.listView()?.initial;
    if (initial === undefined) return undefined;
    return this.findOption(initial, this.listOptions());
  }

  protected getInitialGroupOption(group: OptionGroup | undefined): Option | undefined {
    if (!group) return undefined;
    return this.findOption(group.initial, group.options) ?? group.options[0];
  }

  protected findOption<T extends Option>(value: string | undefined, options: T[]): T | undefined {
    if (value === undefined) return undefined;
    return options.find((option: T): boolean => option.value === value);
  }

  protected mergedProperties(option: TOption): Property[] {
    const global: Property[] = this.listView()?.properties ?? [];
    const local: Property[] = option.properties ?? [];
    return Utils.mergeBy([...global, ...local], (property: Property): string => property.name);
  }

  protected filterPaths(option: TOption | undefined): string[] {
    const filters: FilterOption[] = option?.filters ?? [];
    return filters.map((filter: FilterOption): string => filter.value);
  }

  protected onLoading<T>(source: () => T, isLoading: () => boolean): Signal<T> {
    return linkedSignal({
      source,
      computation: (source: T, previous: PreviousLinkedValue<T>): T => (isLoading() ? (previous?.value ?? source) : source),
    });
  }
}
