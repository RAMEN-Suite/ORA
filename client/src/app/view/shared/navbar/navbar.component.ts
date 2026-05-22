import { Component } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'shared-navbar',
  imports: [Menubar, RouterLink, NgClass, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected items: MenuItem[] = [
    {
      label: 'Startseite',
      routerLink: '/',
      routerLinkActiveOptions: { exact: true },
    },
    {
      label: 'Gesamtkorpus',
      routerLink: '/collections',
      routerLinkActiveOptions: { exact: false },
    },
    {
      label: 'Register',
      routerLink: '/entities',
      routerLinkActiveOptions: { exact: false },
    },
  ];
}
