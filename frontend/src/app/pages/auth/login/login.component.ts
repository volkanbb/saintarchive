import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex text-slate-900 bg-white">
      
      <!-- Left side (Form) -->
      <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-32 relative z-10 bg-white">
        <a routerLink="/" class="absolute top-8 left-8 sm:left-16 xl:left-32 text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          Saint<span class="text-brand-500">Archive</span>
        </a>

        <div class="max-w-md w-full mx-auto animate-fade-in mt-16 lg:mt-0">
          <h2 class="text-3xl font-display font-bold mb-2">Welcome Back</h2>
          <p class="text-slate-500 mb-8">Sign in to your account to continue</p>
          
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email <span class="text-red-500">*</span></label>
              <input id="email" name="email" type="email" required [(ngModel)]="email" 
                     class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                     placeholder="name@example.com">
            </div>
            
            <div>
              <div class="flex justify-between items-center mb-1">
                <label for="password" class="block text-sm font-medium text-slate-700">Password <span class="text-red-500">*</span></label>
                <a href="#" class="text-xs font-semibold text-brand-600 hover:text-brand-500">Forgot password?</a>
              </div>
              <input id="password" name="password" type="password" required [(ngModel)]="password" 
                     class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                     placeholder="••••••••">
            </div>

            <button type="submit" 
                    class="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all">
              Sign In
            </button>
          </form>

          <p class="mt-8 text-center text-sm text-slate-500">
            Don't have an account? 
            <a routerLink="/register" class="font-semibold text-brand-600 hover:text-brand-500 transition-colors">Create one now</a>
          </p>
        </div>
      </div>

      <!-- Right side (Image/Branding) -->
      <div class="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <!-- Abstract glowing background -->
        <div class="absolute inset-0 z-0">
          <div class="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gradient-to-bl from-brand-600/[0.15] to-transparent rounded-full blur-[100px] animate-pulse"></div>
          <div class="absolute bottom-0 left-0 w-[100%] h-[100%] bg-gradient-to-tr from-blue-600/[0.1] to-transparent rounded-full blur-[80px]"></div>
          
          <!-- Modern mesh overlay pattern via CSS grid -->
          <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
        </div>

        <div class="relative z-10 w-full max-w-lg p-12 text-white">
          <h3 class="text-4xl font-display font-bold leading-tight mb-6">Redefining Premium Streetwear Access.</h3>
          <p class="text-slate-300 text-lg leading-relaxed">
            Direct authenticated sourcing combined seamlessly with a highly robust WhatsApp checkout workflow. Access tomorrow's drops today.
          </p>
          
          <div class="mt-12 flex items-center gap-4">
            <div class="flex -space-x-4">
              <div class="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center font-bold text-xs"><img src="https://i.pravatar.cc/100?img=1" class="rounded-full w-full h-full"></div>
              <div class="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center font-bold text-xs"><img src="https://i.pravatar.cc/100?img=2" class="rounded-full w-full h-full"></div>
              <div class="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center font-bold text-xs"><img src="https://i.pravatar.cc/100?img=3" class="rounded-full w-full h-full"></div>
            </div>
            <p class="text-sm font-medium text-slate-300">Join 10k+ verified members</p>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.role === 'Admin') this.router.navigate(['/admin/categories']);
        else this.router.navigate(['/']);
      },
      error: (err) => alert('Login failed, please check credentials.')
    });
  }
}
