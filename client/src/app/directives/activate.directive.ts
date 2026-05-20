import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[onActivate]',
})
export class ActivateDirective {
  @Output()
  public readonly onActivate: EventEmitter<Event> = new EventEmitter<Event>();

  @HostListener('click', ['$event'])
  protected handleClick(event: Event): void {
    this.activate(event);
  }

  @HostListener('keydown.enter', ['$event'])
  protected handleEnter(event: Event): void {
    this.activate(event);
  }

  @HostListener('keydown.space', ['$event'])
  protected handleSpace(event: Event): void {
    event.preventDefault();
    this.activate(event);
  }

  private activate(event: Event): void {
    this.onActivate.emit(event);
  }
}
