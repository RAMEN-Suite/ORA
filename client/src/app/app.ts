import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollTop } from 'primeng/scrolltop';
import { NavbarComponent } from './view/shared/navbar/navbar.component';

@Component({
  selector: 'root',
  imports: [RouterOutlet, ScrollTop, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
