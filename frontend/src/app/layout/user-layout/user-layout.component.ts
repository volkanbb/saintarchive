import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { SettingService } from '../../core/services/setting.service';
import { Category } from '../../core/models/category.model';
import { SystemSetting } from '../../core/models/system-setting.model';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- Top Navigation Bar -->
    <header class="fixed top-0 inset-x-0 z-50 bg-[#020202]/80 backdrop-blur-md border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex justify-between items-center transition-all">
        
        <!-- Logo -->
        <a routerLink="/" class="flex items-center group h-full">
          <img src="/assets/images/logo.png" alt="SAINT ARCHIVE" class="h-20 w-auto object-contain group-hover:scale-110 transition-transform duration-500">
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-12 font-display text-lg tracking-widest text-white/60">
          <a routerLink="/" routerLinkActive="text-white" [routerLinkActiveOptions]="{exact: true}" class="hover:text-white transition-colors uppercase">Archive</a>
          
          <!-- Collection Dropdown -->
          <div class="relative" (mouseenter)="showDropdown = true" (mouseleave)="showDropdown = false">
            <a routerLink="/products" class="hover:text-white transition-colors uppercase cursor-pointer flex items-center gap-1">
              KOLEKSİYON
              <svg class="w-4 h-4 transition-transform" [class.rotate-180]="showDropdown" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            
            <!-- Dropdown -->
            <div *ngIf="showDropdown" class="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-56">
              <div class="bg-[#0a0a0a]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <a routerLink="/products" 
                   class="block px-5 py-3 text-sm text-[#c5a059] font-bold uppercase tracking-wider hover:bg-white/5 transition-colors border-b border-white/5">
                  Tüm Ürünler
                </a>
                <a *ngFor="let cat of categories" 
                   [routerLink]="['/products']" [queryParams]="{category: cat.id}"
                   class="block px-5 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider">
                  {{ cat.name }}
                </a>
                <div *ngIf="categories.length === 0" class="px-5 py-3 text-sm text-white/30">
                  Kategori bulunamadı
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Dropdown -->
          <div class="relative" (mouseenter)="showContactDropdown = true" (mouseleave)="showContactDropdown = false">
            <a routerLink="/contact" class="hover:text-white transition-colors uppercase cursor-pointer flex items-center gap-1">
              İLETİŞİM
              <svg class="w-4 h-4 transition-transform" [class.rotate-180]="showContactDropdown" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            
            <!-- Contact Dropdown Content -->
            <div *ngIf="showContactDropdown" class="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-64">
              <div class="bg-[#0a0a0a]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <!-- Social Channels Section Label -->
                <div class="px-5 py-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5">Hızlı Erişim</div>
                
                <a [href]="'https://wa.me/' + getSettingValue('WhatsAppNumber')" target="_blank"
                   class="flex items-center gap-3 px-5 py-3 text-sm text-white/70 hover:text-brand-400 hover:bg-white/5 transition-all group">
                   <div class="w-2 h-2 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   WhatsApp
                </a>
                <a [href]="getSettingValue('InstagramUrl')" target="_blank"
                   class="flex items-center gap-3 px-5 py-3 text-sm text-white/70 hover:text-pink-500 hover:bg-white/5 transition-all group border-t border-white/5">
                   <div class="w-2 h-2 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   Instagram
                </a>
                <a [href]="getSettingValue('TikTokUrl')" target="_blank"
                   class="flex items-center gap-3 px-5 py-3 text-sm text-white/70 hover:text-cyan-500 hover:bg-white/5 transition-all group border-t border-white/5">
                   <div class="w-2 h-2 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   TikTok
                </a>
                <a [href]="'mailto:' + getSettingValue('ContactEmail')"
                   class="flex items-center gap-3 px-5 py-3 text-sm text-white/70 hover:text-[#c5a059] hover:bg-white/5 transition-all group border-t border-white/5">
                   <div class="w-2 h-2 rounded-full bg-[#c5a059] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   E-posta
                </a>
              </div>
            </div>
          </div>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center gap-8">
          <a routerLink="/cart" class="relative text-white hover:text-[#c5a059] transition-colors group">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span *ngIf="(cartCount$ | async) || 0 > 0" 
                  class="absolute -top-2 -right-2 bg-[#c5a059] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-black group-hover:scale-110 transition-transform">
              {{ cartCount$ | async }}
            </span>
          </a>
          <button class="md:hidden text-white" (click)="showMobileMenu = !showMobileMenu">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8h16M4 16h16" /></svg>
          </button>
        </div>
      </div>
 
      <!-- Mobile Menu -->
      <div *ngIf="showMobileMenu" class="md:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5 px-4 py-6 max-h-[85vh] overflow-y-auto">
        <a routerLink="/" (click)="showMobileMenu = false" class="block py-3 text-white uppercase tracking-widest font-display">Archive</a>
        
        <div class="py-3">
          <div class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Koleksiyon</div>
          <a routerLink="/products" (click)="showMobileMenu = false" class="block py-2 text-[#c5a059] uppercase tracking-wider font-bold">Tüm Ürünler</a>
          <a *ngFor="let cat of categories" 
             [routerLink]="['/products']" [queryParams]="{category: cat.id}"
             (click)="showMobileMenu = false"
             class="block py-2 pl-4 text-white/60 uppercase tracking-wider text-sm transition-colors hover:text-white">
            {{ cat.name }}
          </a>
        </div>

        <div class="py-3 border-t border-white/5">
          <div class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">İletişim</div>
          <a [href]="'https://wa.me/' + getSettingValue('WhatsAppNumber')" target="_blank" (click)="showMobileMenu = false" 
             class="flex items-center gap-3 py-3 text-white/70 transition-colors hover:text-brand-400">
             <div class="w-1.5 h-1.5 rounded-full bg-brand-500"></div> WhatsApp
          </a>
          <a [href]="getSettingValue('InstagramUrl')" target="_blank" (click)="showMobileMenu = false"
             class="flex items-center gap-3 py-3 text-white/70 transition-colors hover:text-pink-500">
             <div class="w-1.5 h-1.5 rounded-full bg-pink-500"></div> Instagram
          </a>
          <a [href]="getSettingValue('TikTokUrl')" target="_blank" (click)="showMobileMenu = false"
             class="flex items-center gap-3 py-3 text-white/70 transition-colors hover:text-cyan-500">
             <div class="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> TikTok
          </a>
          <a [href]="'mailto:' + getSettingValue('ContactEmail')" (click)="showMobileMenu = false"
             class="flex items-center gap-3 py-3 text-white/70 transition-colors hover:text-[#c5a059]">
             <div class="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></div> E-posta
          </a>
          <a routerLink="/contact" (click)="showMobileMenu = false" class="block mt-4 py-3 text-center border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white/40">
            İletişim Sayfası
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="min-h-screen pt-24 flex flex-col">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="relative z-20 bg-[#020202]/80 backdrop-blur-md border-t border-white/5 py-20 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-12">
        <div class="flex flex-col items-center leading-none gap-4">
          <img src="/assets/images/logo.png" alt="SAINT ARCHIVE" class="h-20 w-auto object-contain">
          <span class="text-xs tracking-[0.8em] text-[#c5a059] uppercase font-bold">URBAN CLOTHING ARCHIVE</span>
        </div>
        
        <nav class="flex flex-wrap justify-center gap-x-12 gap-y-4 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          <a href="#" class="hover:text-white transition-colors">GİZLİLİK</a>
          <a href="#" class="hover:text-white transition-colors">ŞARTLAR</a>
          <a href="#" class="hover:text-white transition-colors">KARGO</a>
          <a routerLink="/contact" class="hover:text-white transition-colors">İLETİŞİM</a>
        </nav>

        <p class="text-white/20 text-[10px] tracking-[0.1em] uppercase">
          &copy; {{ currentYear }} SAINT ARCHIVE. Est. 2024.
        </p>
      </div>
    </footer>
  `
})
export class UserLayoutComponent implements OnInit {
  currentYear = new Date().getFullYear();
  categories: Category[] = [];
  settings: SystemSetting[] = [];
  showDropdown = false;
  showContactDropdown = false;
  showMobileMenu = false;
  cartCount$: Observable<number>;

  constructor(
    private categoryService: CategoryService,
    private cartService: CartService,
    private settingService: SettingService
  ) {
    this.cartCount$ = this.cartService.cartItems$.pipe(
      map(items => items.reduce((acc, item) => acc + item.quantity, 0))
    );
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => this.categories = data);
    this.settingService.getSettings().subscribe(data => this.settings = data);
  }

  getSettingValue(key: string): string {
    return this.settings.find(s => s.key === key)?.value || '';
  }
}

