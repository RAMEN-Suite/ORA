import { Component } from '@angular/core';
import { ScreenShellComponent } from '../../shared/layout/screen-shell/screen-shell.component';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'screen-error',
  imports: [ScreenShellComponent, TranslocoDirective],
  templateUrl: './error.screen.html',
})
export class ErrorScreen {}
