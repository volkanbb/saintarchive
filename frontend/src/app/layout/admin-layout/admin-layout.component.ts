import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="h-screen flex bg-slate-50 font-sans overflow-hidden text-slate-900">
      
      <!-- Elegant Sidebar -->
      <aside class="w-72 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 shadow-2xl z-20">
        <div class="h-20 flex items-center px-8 border-b border-white/10">
          <a routerLink="/" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded bg-brand-500 flex items-center justify-center text-white">
              <!-- Admin icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <span class="text-xl font-display font-bold text-white tracking-wide">Workspace</span>
          </a>
        </div>
        
        <nav class="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Management</p>
          
          <a routerLink="/admin/categories" routerLinkActive="bg-brand-500/10 text-brand-400 border-l-4 border-brand-500" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all border-l-4 border-transparent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Categories
          </a>
          
          <a routerLink="/admin/import" routerLinkActive="bg-brand-500/10 text-brand-400 border-l-4 border-brand-500" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all border-l-4 border-transparent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Yupoo Importer
          </a>

          <a routerLink="/admin/products" routerLinkActive="bg-brand-500/10 text-brand-400 border-l-4 border-brand-500" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all border-l-4 border-transparent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Manage Products
          </a>

          <a routerLink="/admin/products/new" routerLinkActive="bg-brand-500/10 text-brand-400 border-l-4 border-brand-500" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all border-l-4 border-transparent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Add Product
          </a>

          <a routerLink="/admin/settings" routerLinkActive="bg-brand-500/10 text-brand-400 border-l-4 border-brand-500" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all border-l-4 border-transparent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </a>

          <div class="h-px bg-white/5 my-4 mx-4"></div>
          <p class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Access Control</p>

          <a routerLink="/admin/users" routerLinkActive="bg-brand-500/10 text-brand-400 border-l-4 border-brand-500" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all border-l-4 border-transparent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Administrators
          </a>
        </nav>
        
        <div class="p-6 border-t border-white/10 mt-auto">
          <a routerLink="/" class="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Exit to Storefront
          </a>
        </div>
      </aside>

      <!-- Main working canvas -->
      <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        <!-- Top header bar for canvas -->
        <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h1 class="text-xl font-bold text-slate-800">Admin Dashboard</h1>
          
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-4 border-l border-slate-200 pl-4" *ngIf="authService.currentUser$ | async as user">
              <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center font-bold text-white">{{ user.fullName.charAt(0) }}</div>
              <div>
                <p class="text-sm font-semibold text-slate-800">{{ user.fullName }}</p>
                <p class="text-xs text-slate-500 capitalize">{{ user.role }}</p>
              </div>
            </div>

            <button (click)="logout()" class="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </header>

        <!-- Dynamic Content -->
        <div class="flex-1 overflow-y-auto bg-[#f8fafc] p-8">
          <div class="max-w-6xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
      
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #334155;
      border-radius: 10px;
    }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
