import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section with Fixed Background -->
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-black animate-fade-in">
      <!-- Background Image (Fixed) -->
      <div class="fixed inset-0 z-0">
        <img src="/assets/images/hero.jpg" class="w-full h-full object-cover opacity-60 grayscale-[0.2]">
        <div class="absolute inset-0 bg-gradient-to-b from-black/95 via-transparent to-black"></div>
      </div>

      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
        <span class="text-[#c5a059] text-xs font-bold tracking-[0.5em] uppercase mb-8 animate-slide-up">
          ~ Urban Clothing Archive ~
        </span>
        
        <div class="relative mb-12 animate-slide-up" style="animation-delay: 0.1s;">
          <h1 class="text-7xl md:text-9xl font-display font-extrabold tracking-tighter leading-none flex flex-col items-center">
            <span class="text-white">SAINT</span>
            <span class="text-outline -mt-4 opacity-50">ARCHIVE</span>
          </h1>
        </div>

        <div class="flex flex-col items-center gap-6 animate-slide-up" style="animation-delay: 0.2s;">
            <p class="text-[#c5a059] text-[10px] tracking-[0.3em] uppercase font-bold">COLLECTION READY</p>
            <button (click)="scrollToProducts()" class="btn-gold group">
                ENTER ARCHIVE
                <span class="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-t from-[#c5a059] to-transparent animate-bounce"></div>
    </div>

    <!-- Content Section -->
    <div class="relative z-20 w-full" style="background-color: rgba(2,2,2,0.93);">
    <!-- Smooth gradient transition from hero -->
    <div class="absolute top-0 left-0 w-full h-32 -translate-y-full bg-gradient-to-b from-transparent to-[rgba(2,2,2,0.93)] pointer-events-none"></div>

      <!-- Featured Products Slider -->
      <div id="products-grid" class="py-24 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
            <h2 class="text-4xl md:text-6xl font-display font-bold text-white tracking-[0.2em] uppercase" style="text-shadow: 0 4px 12px rgba(0,0,0,0.5);">ÖNE ÇIKANLAR</h2>
            <div class="h-1.5 w-24 bg-[#c5a059] mt-4 mx-auto shadow-[0_0_15px_rgba(197,160,89,0.5)]"></div>
        </div>

        <!-- Horizontal Scroll Slider Wrapper -->
        <div class="relative max-w-7xl mx-auto group/slider px-4 md:px-12">
          
          <!-- Slider Navigation Arrows (Premium) -->
          <button (click)="scrollSlider(-1); stopAutoSlide()" 
                  class="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-black/80 border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center hover:bg-[#c5a059] hover:text-black hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.8)] group-hover/slider:opacity-100 opacity-0 lg:opacity-100">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <button (click)="scrollSlider(1); stopAutoSlide()" 
                  class="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-black/80 border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center hover:bg-[#c5a059] hover:text-black hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.8)] group-hover/slider:opacity-100 opacity-0 lg:opacity-100">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>

          <!-- Slider Container -->
          <div #slider class="flex gap-4 md:gap-8 overflow-x-auto py-8 scroll-smooth snap-x snap-mandatory hide-scrollbar justify-start px-4 md:px-0" 
               (mousedown)="onSliderMouseDown($event)"
               (mousemove)="onSliderMouseMove($event)"
               (mouseup)="onSliderMouseUp()"
               (mouseleave)="onSliderMouseUp()">
            
            <a *ngFor="let product of featuredProducts" 
               [routerLink]="['/product', product.id]" 
               class="featured-card group flex-shrink-0 w-[80%] md:w-[23.5%] flex flex-col snap-start select-none">
              
              <!-- Premium Product Card -->
              <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#111] border border-white/5 group-hover:border-[#c5a059]/40 transition-all duration-500 mb-4 shadow-2xl">
                <!-- Image -->
                <img *ngIf="product.images.length > 0"
                     [src]="getMainImageUrl(product)" 
                     [alt]="product.title" 
                     referrerpolicy="no-referrer"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none">
                
                <!-- Overlay Gradient -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                
                <!-- Info Overlay -->
                <div class="absolute bottom-0 left-0 right-0 p-6">
                   <span class="text-[9px] text-[#c5a059] font-black uppercase tracking-[0.2em] mb-1 block">{{ product.categoryName }}</span>
                   <h3 class="text-lg font-bold text-white leading-tight mb-2 uppercase tracking-wider group-hover:text-[#c5a059] transition-colors">{{product.title}}</h3>
                   <div class="flex items-center justify-between mt-4">
                      <p class="text-xl font-display font-black tracking-widest text-[#c5a059]">
                        {{ product.price > 0 ? (product.price | number:'1.0-0') + ' ₺' : 'INQUIRE' }}
                      </p>
                      <span class="text-[10px] text-white/40 font-bold group-hover:text-[#c5a059] transition-colors">VIEW PIECE →</span>
                   </div>
                </div>

                <!-- Tag -->
                <div class="absolute top-4 left-4">
                  <span class="text-[8px] bg-[#c5a059] text-black px-2 py-0.5 font-black uppercase tracking-widest shadow-lg">ARCHIVE</span>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- See All Button -->
        <div class="mt-12 flex justify-center animate-slide-up" style="animation-delay: 0.4s;">
          <a routerLink="/products" class="px-10 py-4 rounded-full border border-[#c5a059]/30 text-[#c5a059] font-bold text-xs tracking-[0.3em] uppercase hover:bg-[#c5a059] hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(197,160,89,0.1)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)]">
            TÜM ARŞİVİ GÖR →
          </a>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" *ngIf="categories.length > 0">
        <div class="mb-10">
          <h2 class="text-4xl font-display font-bold text-white tracking-widest uppercase" style="text-shadow: 0 2px 8px #000;">KATEGORİLER</h2>
          <div class="h-1 w-20 bg-[#c5a059] mt-2"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <a *ngFor="let cat of categories" [routerLink]="['/products']" [queryParams]="{category: cat.id}"
             class="group relative overflow-hidden rounded-xl aspect-[4/3] bg-[#111]">
            <!-- Category Image -->
            <img *ngIf="cat.imageUrl" [src]="getProxyUrl(cat.imageUrl)" [alt]="cat.name" 
                 class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70 group-hover:opacity-90">
            <div *ngIf="!cat.imageUrl" class="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]"></div>
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            
            <!-- Category Name -->
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3 class="text-xl font-display font-bold text-white uppercase tracking-wider" style="text-shadow: 0 2px 6px #000;">
                {{ cat.name }}
              </h3>
              <div class="h-0.5 w-0 bg-[#c5a059] group-hover:w-12 transition-all duration-300 mt-1"></div>
            </div>

            <!-- Hover border -->
            <div class="absolute inset-0 border-2 border-transparent group-hover:border-[#c5a059]/40 rounded-xl transition-colors duration-300"></div>
          </a>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  private autoSlideInterval: any;

  // Slider drag state
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;

  @ViewChild('slider') sliderRef!: ElementRef<HTMLDivElement>;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => this.products = data);
    this.productService.getFeaturedProducts().subscribe(data => {
      this.featuredProducts = data;
      this.startAutoSlide();
    });
    this.categoryService.getCategories().subscribe(data => this.categories = data);
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (this.featuredProducts.length > 0) {
        this.scrollSlider(1);
      }
    }, 5000);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  scrollToProducts() {
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  }

  getMainImageUrl(product: Product): string {
    return this.productService.getMainImageUrl(product);
  }

  getProxyUrl(url: string | undefined): string {
    return this.productService.getProxyUrl(url);
  }

  scrollSlider(direction: number) {
    if (this.sliderRef && this.featuredProducts.length > 0) {
      const container = this.sliderRef.nativeElement;
      const cardWidth = container.querySelector('.featured-card')?.clientWidth || 300;
      const scrollAmount = cardWidth + 40; 

      // Infinite loop logic for auto-slide
      if (direction > 0 && container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
          container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
      }
    }
  }

  onSliderMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.startX = e.pageX - this.sliderRef.nativeElement.offsetLeft;
    this.scrollLeft = this.sliderRef.nativeElement.scrollLeft;
  }

  onSliderMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - this.sliderRef.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.sliderRef.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  onSliderMouseUp() {
    this.isDragging = false;
  }
}
