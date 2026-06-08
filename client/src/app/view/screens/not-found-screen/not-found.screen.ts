import { Component } from '@angular/core';
import { ScreenShellComponent } from '../../shared/layout/screen-shell/screen-shell.component';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'screen-not-found',
  imports: [ScreenShellComponent, TranslocoDirective],
  templateUrl: './not-found.screen.html',
})
export class NotFoundScreen {}
