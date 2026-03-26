import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
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
          <h2 class="text-3xl font-display font-bold mb-2">Create an Account</h2>
          <p class="text-slate-500 mb-8">Join the exclusive streetwear community</p>
          
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            
            <div>
              <label for="fullName" class="block text-sm font-medium text-slate-700 mb-1">Full Name <span class="text-red-500">*</span></label>
              <input id="fullName" name="fullName" type="text" required [(ngModel)]="fullName" 
                     class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                     placeholder="John Doe">
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email <span class="text-red-500">*</span></label>
              <input id="email" name="email" type="email" required [(ngModel)]="email" 
                     class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                     placeholder="name@example.com">
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password <span class="text-red-500">*</span></label>
              <input id="password" name="password" type="password" required [(ngModel)]="password" 
                     class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                     placeholder="••••••••">
            </div>

            <button type="submit" 
                    class="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all">
              Create Account
            </button>
          </form>

          <p class="mt-8 text-center text-sm text-slate-500">
            Already have an account? 
            <a routerLink="/login" class="font-semibold text-brand-600 hover:text-brand-500 transition-colors">Sign in here</a>
          </p>
        </div>
      </div>

      <!-- Right side (Image/Branding) identical to Login -->
      <div class="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
          <div class="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gradient-to-bl from-brand-600/[0.15] to-transparent rounded-full blur-[100px] animate-pulse"></div>
          <div class="absolute bottom-0 left-0 w-[100%] h-[100%] bg-gradient-to-tr from-blue-600/[0.1] to-transparent rounded-full blur-[80px]"></div>
          <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
        </div>

        <div class="relative z-10 w-full max-w-lg p-12 text-white">
          <div class="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-semibold text-sm">
            ✨ Member Benefits
          </div>
          <h3 class="text-4xl font-display font-bold leading-tight mb-6">Unlock the Vault.</h3>
          <ul class="space-y-4 text-slate-300">
            <li class="flex items-center gap-3">
              <svg class="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Early access to latest drops
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Personalized sourcing request lines
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Seamless WhatsApp ordering with agents
            </li>
          </ul>
        </div>
      </div>
      
    </div>
  `
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register({ fullName: this.fullName, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => alert('Registration failed. Please try again.')
    });
  }
}
