import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingComponent],
  template: `
    <app-loading></app-loading>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  title = 'ecommerce-frontend';

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (event instanceof NavigationError) {
        this.loadingService.hide();
        // If navigation fails (e.g. lazy loading a chunk fails), it might be due to a Cloudflare challenge.
        // Forcing a reload allows the browser to show the challenge page.
        console.warn('Navigation error detected, potentially a Cloudflare block. Reloading...');
        window.location.reload();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel
      ) {
        this.loadingService.hide();
      }
    });
  }
}
