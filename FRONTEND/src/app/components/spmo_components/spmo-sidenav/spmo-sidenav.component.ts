import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spmo-sidenav',
  standalone: false,
  templateUrl: './spmo-sidenav.component.html',
  styleUrl: './spmo-sidenav.component.scss',
})
export class SpmoSidenavComponent implements OnInit {
  opened = true;
  isMasterFileMenuOpen = false;

  picture: string | null = null;
  Email: string | null = null;
  fullName: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.userlogin();
    this.opened = true;
  }

  userlogin() {
    this.Email = localStorage.getItem('Email');
    this.fullName = localStorage.getItem('fullName');
  }
  toggleMasterFileMenu() {
    if (!this.opened) {
      this.opened = true;
      this.isMasterFileMenuOpen = true;
    } else {
      this.isMasterFileMenuOpen = !this.isMasterFileMenuOpen;
    }
  }

  getInitials(name: string | null): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  getAvatarColor(name: string | null): string {
    if (!name) return '#800000';
    const colors = ['#800000', '#4a148c', '#1a237e', '#004d40', '#33691e'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
