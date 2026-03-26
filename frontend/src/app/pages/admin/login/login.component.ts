import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-black flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <!-- Logo -->
        <div class="flex justify-center mb-12 animate-fade-in">
          <img src="/assets/images/logo.png" alt="SAINT ARCHIVE" class="h-16 w-auto">
        </div>

        <div class="bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl shadow-2xl animate-slide-up">
          <div class="mb-8">
            <h2 class="text-2xl font-display font-bold text-white tracking-widest uppercase mb-2">ADMIN ACCESS</h2>
            <p class="text-white/40 text-xs tracking-wider">PLEASE IDENTIFY YOURSELF TO PROCEED</p>
          </div>

          <form (submit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-[10px] text-[#c5a059] font-black uppercase tracking-widest mb-2 px-1">EMAIL ADDRESS</label>
              <input type="email" name="email" [(ngModel)]="credentials.email" required 
                     class="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-[#c5a059]/40 transition-colors outline-none">
            </div>

            <div>
              <label class="block text-[10px] text-[#c5a059] font-black uppercase tracking-widest mb-2 px-1">PASSWORD</label>
              <input type="password" name="password" [(ngModel)]="credentials.password" required 
                     class="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-[#c5a059]/40 transition-colors outline-none">
            </div>

            <div *ngIf="errorMessage" class="bg-red-950/20 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-lg animate-shake">
              {{ errorMessage }}
            </div>

            <button type="submit" [disabled]="loading"
                    class="w-full bg-white text-black font-black py-4 rounded-lg tracking-[0.2em] uppercase hover:bg-[#c5a059] transition-all duration-300 disabled:opacity-50 flex items-center justify-center">
              <span *ngIf="!loading">AUTHENTICATE</span>
              <div *ngIf="loading" class="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            </button>
          </form>
        </div>

        <div class="mt-8 text-center">
          <a routerLink="/" class="text-white/20 hover:text-[#c5a059] text-[10px] tracking-widest uppercase transition-colors">← RETURN TO STOREFRONT</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: '', password: '' };
  loading = false;
  errorMessage = '';

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'AUTHENTICATION FAILED';
        this.loading = false;
      }
    });
  }
}
