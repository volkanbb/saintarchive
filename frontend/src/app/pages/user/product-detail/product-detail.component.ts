import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { SettingService } from '../../../core/services/setting.service';
import { Product } from '../../../core/models/product.model';
import { SystemSetting } from '../../../core/models/system-setting.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Breadcrumb -->
    <nav *ngIf="product" aria-label="Breadcrumb" class="bg-[#020202] border-b border-white/5">
      <ol role="list" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-4 py-6">
        <li>
            <a routerLink="/" class="text-[10px] font-bold tracking-[0.2em] text-white/40 hover:text-[#c5a059] transition-colors uppercase">Archive</a>
        </li>
        <li class="text-white/20">/</li>
        <li>
            <a [routerLink]="['/category', product.categoryId]" class="text-[10px] font-bold tracking-[0.2em] text-white/40 hover:text-[#c5a059] transition-colors uppercase">{{product.categoryName}}</a>
        </li>
        <li class="text-white/20">/</li>
        <li class="text-[10px] font-bold tracking-[0.2em] text-white uppercase truncate max-w-[150px]">{{product.title}}</li>
      </ol>
    </nav>

    <!-- Product Layout -->
    <div class="bg-[#020202] min-h-screen pt-12 pb-32" *ngIf="product">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-12 lg:gap-x-16">
          
          <!-- Image gallery -->
          <div class="lg:col-span-7 flex flex-col gap-6">
            <!-- Main Image -->
            <div class="stacked-card w-full aspect-[4/5] bg-[#1a1a1a] overflow-hidden shadow-2xl relative group">
              <img [src]="getProxyUrl(mainImage)" referrerpolicy="no-referrer" alt="Product image" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105">
              
              <!-- Brand Label overlay -->
              <div class="absolute top-6 left-6">
                <span class="bg-white text-black text-[10px] font-black px-3 py-1 uppercase tracking-tighter shadow-xl">
                  🔥 {{ product.categoryName }}
                </span>
              </div>
            </div>
            
            <!-- Thumbnails grid -->
            <div class="grid grid-cols-5 gap-4">
              <button *ngFor="let img of product.images" 
                      (click)="setMainImage(img.url)" 
                      [ngClass]="mainImage === img.url ? 'border-[#c5a059]' : 'border-white/10'"
                      class="aspect-square bg-[#1a1a1a] border-2 transition-all overflow-hidden">
                <img [src]="getProxyUrl(img.url)" referrerpolicy="no-referrer" alt="" class="w-full h-full object-cover hover:opacity-50 transition-opacity">
              </button>
            </div>
          </div>

          <!-- Product info -->
          <div class="lg:col-span-5 mt-16 lg:mt-0 flex flex-col">
            <div class="sticky top-32 space-y-12">
                <div>
                    <h1 class="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white mb-4 uppercase leading-none">{{product.title}}</h1>
                    <p class="text-3xl font-display font-bold tracking-[0.2em] text-[#c5a059]">
                        {{ product.price > 0 ? (product.price | number:'1.0-0') + ' ₺' : 'PRICE ON REQUEST' }}
                    </p>
                </div>

                <div class="space-y-6">
                    <h3 class="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase border-b border-white/10 pb-2">ARCHIVE DESCRIPTION</h3>
                    <div class="prose prose-invert prose-sm text-white/60 leading-relaxed tracking-wide">
                        <div *ngIf="product.description" [innerHTML]="product.description"></div>
                        <p *ngIf="!product.description" class="italic">No detailed documentation found for this archive entry.</p>
                    </div>
                </div>

                <!-- Checkout / Action -->
                <div class="pt-8 space-y-6">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="flex items-center bg-[#1a1a1a] border border-white/10 p-1">
                            <button (click)="decrementQuantity()" class="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                            </button>
                            <span class="w-12 text-center text-white font-bold">{{ quantity }}</span>
                            <button (click)="incrementQuantity()" class="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        <button (click)="addToCart()" class="btn-gold flex-1 py-4 flex items-center justify-center gap-3 group relative overflow-hidden">
                            <span class="relative z-10 font-black tracking-[0.2em] uppercase text-xs">ADD TO ARCHIVE</span>
                            <svg class="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </button>
                    </div>

                    <a [href]="whatsappLink" target="_blank" class="w-full py-4 flex items-center justify-center gap-3 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-[10px] font-bold tracking-[0.2em] uppercase">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        INQUIRE ON WHATSAPP
                    </a>

                    <div class="flex items-center justify-center gap-4 text-[9px] font-bold tracking-[0.2em] text-white/20 uppercase">
                        <span>Authenticated</span>
                        <span>•</span>
                        <span>Global Shipping</span>
                        <span>•</span>
                        <span>24/7 Support</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  mainImage: string = '';
  quantity: number = 1;
  whatsappNumber: string = '33612345678'; // Default fallback

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private settingService: SettingService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe(data => {
        this.product = data;
        const main = data.images.find(i => i.isMain);
        this.mainImage = main ? main.url : (data.images.length > 0 ? data.images[0].url : '');
      });
    }

    this.settingService.getSetting('WhatsAppNumber').subscribe({
      next: (s: SystemSetting) => this.whatsappNumber = s.value,
      error: () => {} // Keep default on error
    });
  }

  setMainImage(url: string) {
    this.mainImage = url;
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      // Optional: Add a visual feedback/toast here
    }
  }

  get whatsappLink(): SafeUrl {
    if (!this.product) return '';
    const priceSuffix = this.product.price > 0 ? ` for *₺${this.product.price}*` : '';
    const message = `Hello, I'm interested in inquiring about: *${this.product.title}*${priceSuffix}\n\nCan you provide availability?`;
    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getProxyUrl(url: string | undefined): string {
    return this.productService.getProxyUrl(url);
  }
}

