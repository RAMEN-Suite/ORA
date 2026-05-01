import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollTop } from 'primeng/scrolltop';

@Component({
  selector: 'root',
  imports: [RouterOutlet, ScrollTop],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
