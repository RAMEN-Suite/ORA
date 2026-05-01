import { Component, effect, input, InputSignal, model, ModelSignal, signal, WritableSignal } from '@angular/core';
import { Button } from 'primeng/button';
import { StringUtils } from '../../../utils/StringUtils';

@Component({
  selector: 'shared-character-list',
  imports: [Button],
  templateUrl: './character-list.component.html',
})
export class CharacterListComponent {
  public readonly items: InputSignal<string[]> = input<string[]>([]);
  public readonly isDisabled: InputSignal<boolean> = input(false);
  public readonly activeCharacter: ModelSignal<string> = model('');

  protected readonly characters: WritableSignal<string[]> = signal([]);

  constructor() {
    effect((): void => {
      const characters: string[] = this.generateCharacterList();
      if (characters.length === 0) return;
      this.characters.set(characters);

      const currentCharacter: string | undefined = this.activeCharacter();
      if (currentCharacter && characters.includes(currentCharacter)) return;
      this.activeCharacter.set(characters[0] ?? '');
    });
  }

  private generateCharacterList(): string[] {
    const characters: Set<string> = new Set<string>();
    for (const item of this.items()) characters.add(this.getFirstCharacter(item));

    return Array.from(characters).sort((a: string, b: string): number => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
  }

  private getFirstCharacter(value: string): string {
    const normalized: string = StringUtils.normalize(value, { toUpper: true });
    const firstChar: string = normalized.charAt(0);
    return /^\p{L}$/u.test(firstChar) ? firstChar : '#';
  }
}
