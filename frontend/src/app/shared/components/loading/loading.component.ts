import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading$ | async" 
         class="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-500">
      
      <!-- Animated Logo Container -->
      <div class="relative flex flex-col items-center">
        <!-- Logo -->
        <div class="relative w-32 h-32 mb-6 animate-pulse-slow">
            <img src="/assets/images/logo.png" alt="SAINT ARCHIVE" 
                 class="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(197,160,89,0.3)]">
        </div>

        <!-- Progress bar (grunge style) -->
        <div class="w-32 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-r from-[#c5a059] to-red-600 animate-loading-bar"></div>
        </div>

        <p class="mt-4 text-[10px] tracking-[0.5em] text-[#c5a059] uppercase font-bold animate-fade-pulse">
            AUTHENTICATING ARCHIVE...
        </p>
      </div>

      <!-- Grunge Background Texture Overlay -->
      <div class="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
    </div>
  `,
  styles: [`
    @keyframes loading-bar {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-loading-bar {
      animation: loading-bar 1.5s infinite ease-in-out;
    }
    @keyframes pulse-slow {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.05); opacity: 1; }
    }
    .animate-pulse-slow {
      animation: pulse-slow 2s infinite ease-in-out;
    }
    @keyframes fade-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    .animate-fade-pulse {
      animation: fade-pulse 1.5s infinite ease-in-out;
    }
  `]
})
export class LoadingComponent implements OnInit {
  loading$!: Observable<boolean>;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
  }
}
