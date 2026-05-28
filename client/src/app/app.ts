import { Component, inject, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './view/shared/navbar/navbar.component';
import { FooterComponent } from './view/shared/footer/footer.component';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
})
export class App {
  private readonly configService: ConfigService = inject(ConfigService);
  protected readonly hasConfig: Signal<boolean> = this.configService.hasConfig;
}
