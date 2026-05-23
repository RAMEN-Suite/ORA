import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './view/shared/navbar/navbar.component';
import { FooterComponent } from './view/shared/footer/footer.component';

@Component({
  selector: 'root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
