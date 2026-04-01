import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { Title, Meta } from '@angular/platform-browser';

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
              {{ displayTitle }}
            </h1>
            <div class="h-1 w-20 bg-[#c5a059] mt-2"></div>
          </div>
          <p class="text-white text-base font-bold font-mono" style="text-shadow: 0 1px 6px #000;">
            {{filteredProducts.length}} ÜRÜN {{ searchTerm ? 'BULUNDU' : 'LİSTELENİYOR' }}
          </p>
        </div>

        <!-- Category Selection Section -->
        <div class="mb-12 flex flex-col gap-6">
          <!-- Main Category Dropdown -->
          <div class="max-w-xs relative">
            <label class="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2 block font-black">KATEGORİ SEÇİN</label>
            
            <div class="relative">
              <!-- Dropdown Header -->
              <button 
                (click)="toggleCategoryDropdown(); $event.stopPropagation()"
                class="w-full flex items-center justify-between bg-[#0a0a0a]/60 backdrop-blur-md text-white border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-[#c5a059]/50 transition-all font-display font-bold uppercase tracking-widest text-xs hover:bg-[#0a0a0a]/80 group"
              >
                <span class="transition-colors" [style.color]="selectedCategoryId ? '#c5a059' : 'inherit'">{{ displayTitle }}</span>
                <svg 
                  class="w-4 h-4 text-[#c5a059] transition-transform duration-300" 
                  [class.rotate-180]="isCategoryDropdownOpen"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div 
                *ngIf="isCategoryDropdownOpen"
                class="absolute top-full left-0 right-0 mt-2 z-[100] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div class="max-h-80 overflow-y-auto custom-scrollbar">
                  <button 
                    (click)="selectCategory(null)"
                    class="w-full text-left px-5 py-4 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5 border-b border-white/5"
                    [style.color]="!selectedCategoryId ? '#c5a059' : '#ffffff'"
                  >
                    TÜMÜ
                  </button>
                  <button 
                    *ngFor="let cat of categories"
                    (click)="selectCategory(cat.id)"
                    class="w-full text-left px-5 py-4 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5 border-b border-white/5 last:border-0"
                    [style.color]="selectedCategoryId === cat.id ? '#c5a059' : '#ffffff'"
                  >
                    {{ cat.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sub-category Filter Chips -->
          <div class="flex flex-wrap gap-2 pb-2 animate-fade-in" *ngIf="selectedCategoryId && currentSubCategories.length > 0">
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
                   loading="lazy"
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
                  {{ product.price > 0 ? (product.price | number:'1.0-0') + ' ₺' : 'FİYAT SORUNUZ' }}
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
  searchTerm: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta,
    private el: ElementRef
  ) {}

  isCategoryDropdownOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isCategoryDropdownOpen = false;
    }
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  selectCategory(categoryId: string | null) {
    this.filterByCategory(categoryId);
    this.isCategoryDropdownOpen = false;
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => this.categories = data);
    
    // Listen to query params for search or category changes
    this.route.queryParams.subscribe(params => {
      const search = params['search'];
      const categoryId = params['category'];
      
      this.searchTerm = search || null;
      this.selectedCategoryId = categoryId || null;
      this.selectedSubCategoryId = null;

      this.loadProducts();
    });
  }

  loadProducts() {
    this.productService.getProducts(this.searchTerm || undefined).subscribe(data => {
      this.products = data;
      this.applyFilters();
      this.updateSeoTags(this.categories.find(c => c.id === this.selectedCategoryId)?.name);
    });
  }

  private updateSeoTags(categoryName?: string) {
    const title = categoryName ? `${categoryName} Koleksiyonu | Saint Archive` : 'Tüm Ürünler | Saint Archive';
    const description = categoryName 
      ? `Saint Archive ${categoryName} koleksiyonundaki en özel parçaları keşfedin.` 
      : 'Saint Archive urban giyim ve nadir parça koleksiyonun tamamına göz atın.';

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
  }

  get displayTitle(): string {
    if (!this.selectedCategoryId) return 'TÜM ÜRÜNLER';
    const cat = this.categories.find(c => c.id === this.selectedCategoryId);
    return cat ? cat.name : 'TÜM ÜRÜNLER';
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
    
    const catName = this.categories.find(c => c.id === categoryId)?.name;
    this.updateSeoTags(catName);
  }

  getMainImageUrl(product: Product): string {
    return this.productService.getMainImageUrl(product);
  }
}
