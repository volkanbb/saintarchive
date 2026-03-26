import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Category Hero Header -->
    <div class="bg-[#020202] border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        <h1 class="text-5xl md:text-7xl font-display font-extrabold tracking-widest text-white uppercase mb-6 animate-slide-up" style="text-shadow: 0 2px 8px #000, 0 0 30px rgba(0,0,0,0.8);">
          {{ category ? category.name : 'COLLECTION' }} <span class="text-[#c5a059]">ARCHIVE</span>
        </h1>
        <p class="text-[10px] tracking-[0.5em] text-[#c5a059] uppercase mb-12 animate-slide-up font-bold" style="animation-delay: 0.1s;">
          {{ category ? (category.description || 'CURATED PIECES') : 'CURATED PIECES FROM GLOBAL SOURCES' }}
        </p>

        <!-- Sub-category Chips -->
        <div class="flex flex-wrap justify-center gap-3 mb-8 animate-slide-up" style="animation-delay: 0.15s;" *ngIf="category?.subCategories?.length">
          <button 
            (click)="filterSubCategory(null)"
            [class]="selectedSubCategoryId === null 
              ? 'bg-[#c5a059] text-black font-bold px-6 py-2 rounded-full text-[10px] uppercase tracking-wider transition-all' 
              : 'bg-white/5 text-white/50 border border-white/10 font-bold px-6 py-2 rounded-full text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all'">
            Tümü
          </button>
          <button 
            *ngFor="let sub of category?.subCategories"
            (click)="filterSubCategory(sub.id)"
            [class]="selectedSubCategoryId === sub.id 
              ? 'bg-[#c5a059] text-black font-bold px-6 py-2 rounded-full text-[10px] uppercase tracking-wider transition-all' 
              : 'bg-white/5 text-white/50 border border-white/10 font-bold px-6 py-2 rounded-full text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all'">
            {{ sub.name }}
          </button>
        </div>
        
        <!-- Minimal Search bar -->
        <div class="w-full max-w-md relative animate-slide-up" style="animation-delay: 0.2s;">
          <input type="text" 
                 placeholder="SEARCH ARCHIVE..." 
                 class="w-full bg-white/5 border border-white/10 px-6 py-4 rounded text-xs tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-[#c5a059] transition-colors">
          <svg class="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-[#020202]">
      <!-- Empty State -->
      <div *ngIf="products.length === 0" class="py-32 flex flex-col items-center justify-center text-center">
        <div class="w-20 h-20 border border-white/10 flex items-center justify-center mb-8 rotate-45">
          <svg class="w-8 h-8 text-white/10 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 class="text-xl font-display font-bold text-white tracking-widest uppercase mb-2">No pieces found</h3>
        <p class="text-white/40 text-xs tracking-widest uppercase mb-10">Check back later for new arrivals.</p>
        <a routerLink="/" class="text-[#c5a059] font-bold text-[10px] tracking-[0.3em] uppercase border-b border-[#c5a059]/20 pb-1 hover:border-[#c5a059] transition-all">← Back to featured</a>
      </div>

      <!-- Product Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-x-10 md:gap-y-16">
        <a *ngFor="let product of products" [routerLink]="['/product', product.id]" class="group flex flex-col animate-fade-in">
          
          <!-- Premium Product Card -->
          <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111] border border-white/5 group-hover:border-[#c5a059]/40 transition-all duration-500 mb-5">
            <!-- Image -->
            <img *ngIf="product.images.length > 0"
                 [src]="getMainImageUrl(product)" 
                 [alt]="product.title" 
                 referrerpolicy="no-referrer"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
            
            <div *ngIf="product.images.length === 0" class="w-full h-full flex items-center justify-center text-white/5">
                <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>

            <!-- Overlay Gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          </div>
          
          <!-- Product Info -->
          <div class="flex flex-col gap-1 px-1">
            <h3 class="text-sm font-bold text-white leading-tight group-hover:text-[#c5a059] transition-colors line-clamp-1">
              {{product.title}}
            </h3>
            <p class="text-lg font-display font-black tracking-widest text-[#c5a059] mt-1">
                {{ product.price > 0 ? (product.price | number:'1.0-0') + ' ₺' : 'INQUIRE' }}
            </p>
          </div>
        </a>
      </div>
    </div>
  `
})
export class CategoryViewComponent implements OnInit {
  category: Category | null = null;
  allProducts: Product[] = [];
  products: Product[] = [];
  selectedSubCategoryId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.selectedSubCategoryId = null;
        if (id === 'all') {
          this.category = null;
          this.productService.getProducts().subscribe(data => {
            this.allProducts = data;
            this.products = data;
          });
        } else {
          // Load category details
          this.categoryService.getCategory(id).subscribe((cat: Category) => this.category = cat);
          
          // Load products (Backend already returns main + subs)
          this.productService.getProductsByCategory(id).subscribe(data => {
            this.allProducts = data;
            this.products = data;
          });
        }
      }
    });
  }

  filterSubCategory(subId: string | null) {
    this.selectedSubCategoryId = subId;
    if (!subId) {
      this.products = [...this.allProducts];
    } else {
      this.products = this.allProducts.filter(p => p.subCategoryId === subId);
    }
  }

  getMainImageUrl(product: Product): string {
    return this.productService.getMainImageUrl(product);
  }
}
