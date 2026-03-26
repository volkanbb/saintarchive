import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- All Products Page -->
    <div class="relative min-h-screen bg-black">
      <!-- Background -->
      <div class="fixed inset-0 z-0">
        <img src="/assets/images/hero.jpg" class="w-full h-full object-cover opacity-40 grayscale-[0.3]">
        <div class="absolute inset-0 bg-gradient-to-b from-black/95 via-transparent to-black"></div>
      </div>

      <div class="relative z-20 w-full" style="background-color: rgba(2,2,2,0.93);">
      <!-- Smooth gradient transition -->
      <div class="absolute top-0 left-0 w-full h-32 -translate-y-full bg-gradient-to-b from-transparent to-[rgba(2,2,2,0.93)] pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-baseline mb-8 gap-4">
          <div>
            <h1 class="text-5xl font-display font-bold text-white tracking-widest uppercase" style="text-shadow: 0 2px 8px #000;">
              TÜM ÜRÜNLER
            </h1>
            <div class="h-1 w-20 bg-[#c5a059] mt-2"></div>
          </div>
          <p class="text-white text-base font-bold font-mono" style="text-shadow: 0 1px 6px #000;">
            {{filteredProducts.length}} ÜRÜN BULUNDU
          </p>
        </div>

        <!-- Category Filter Chips -->
        <div class="flex flex-wrap gap-3 mb-12 overflow-x-auto pb-2">
          <button 
            (click)="filterByCategory(null)"
            [class]="selectedCategoryId === null 
              ? 'bg-[#c5a059] text-black font-bold px-5 py-2 rounded-full text-sm uppercase tracking-wider transition-all' 
              : 'bg-white/10 text-white/70 font-bold px-5 py-2 rounded-full text-sm uppercase tracking-wider hover:bg-white/20 transition-all'">
            Tümü
          </button>
          <button 
            *ngFor="let cat of categories"
            (click)="filterByCategory(cat.id)"
            [class]="selectedCategoryId === cat.id 
              ? 'bg-[#c5a059] text-black font-bold px-5 py-2 rounded-full text-sm uppercase tracking-wider transition-all' 
              : 'bg-white/10 text-white/70 font-bold px-5 py-2 rounded-full text-sm uppercase tracking-wider hover:bg-white/20 transition-all'">
            {{ cat.name }}
          </button>
        </div>

        <!-- Sub-category Filter Chips -->
        <div class="flex flex-wrap gap-2 mb-12 overflow-x-auto pb-2 animate-fade-in" *ngIf="selectedCategoryId && currentSubCategories.length > 0">
           <button 
            (click)="filterBySubCategory(null)"
            [class]="selectedSubCategoryId === null 
              ? 'bg-white text-black font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider transition-all border border-white' 
              : 'bg-transparent text-white/50 border border-white/10 font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider hover:bg-white/5 transition-all'">
            Tümü
          </button>
          <button 
            *ngFor="let sub of currentSubCategories"
            (click)="filterBySubCategory(sub.id)"
            [class]="selectedSubCategoryId === sub.id 
              ? 'bg-white text-black font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider transition-all border border-white' 
              : 'bg-transparent text-white/50 border border-white/10 font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider hover:bg-white/5 transition-all'">
            {{ sub.name }}
          </button>
        </div>

        <!-- Product Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-x-10 md:gap-y-16">
          <a *ngFor="let product of filteredProducts" [routerLink]="['/product', product.id]" class="group flex flex-col">
            
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
              
              <!-- Category Tag (Small) -->
              <div class="absolute top-3 left-3">
                <span class="text-[8px] bg-white text-black px-2 py-0.5 font-black uppercase tracking-widest shadow-lg">{{ product.categoryName }}</span>
              </div>
            </div>
            
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

        <!-- Empty State -->
        <div *ngIf="filteredProducts.length === 0" class="text-center py-20">
          <p class="text-white/50 text-lg">Bu kategoride ürün bulunamadı.</p>
        </div>
      </div>
      </div>
    </div>
  `
})
export class AllProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategoryId: string | null = null;
  selectedSubCategoryId: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => this.categories = data);
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      
      // Check for category query param
      this.route.queryParams.subscribe(params => {
        if (params['category']) {
          this.filterByCategory(params['category']);
        } else {
          this.applyFilters();
        }
      });
    });
  }

  get currentSubCategories(): Category[] {
    if (!this.selectedCategoryId) return [];
    return this.categories.find(c => c.id === this.selectedCategoryId)?.subCategories || [];
  }

  filterBySubCategory(subId: string | null) {
    this.selectedSubCategoryId = subId;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const matchCat = !this.selectedCategoryId || p.categoryId === this.selectedCategoryId;
      const matchSub = !this.selectedSubCategoryId || p.subCategoryId === this.selectedSubCategoryId;
      return matchCat && matchSub;
    });
  }

  filterByCategory(categoryId: string | null) {
    this.selectedCategoryId = categoryId;
    this.selectedSubCategoryId = null;
    this.applyFilters();
  }

  getMainImageUrl(product: Product): string {
    return this.productService.getMainImageUrl(product);
  }
}
