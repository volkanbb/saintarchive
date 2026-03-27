import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { SettingService } from '../../../core/services/setting.service';
import { Product } from '../../../core/models/product.model';
import { SystemSetting } from '../../../core/models/system-setting.model';
import { DomSanitizer, SafeUrl, Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-black min-h-screen pt-12 text-white" *ngIf="product">
      <div class="max-w-7xl mx-auto px-4">
        <h1 class="text-6xl font-black uppercase mb-6">{{product.title}}</h1>
        <p class="text-4xl font-bold text-yellow-600">{{product.price}} TL</p>
        
        <div class="mt-12" *ngIf="product.images && product.images.length > 0">
          <div class="aspect-[4/5] bg-neutral-900 overflow-hidden rounded-2xl relative">
            <img [src]="getProxyUrl(product.images[currentImageIndex].url)" class="w-full h-full object-cover">
          </div>
          <div class="flex gap-2 mt-4 overflow-x-auto pb-4">
            <img *ngFor="let img of product.images; let i = index" 
                 [src]="getProxyUrl(img.url)" 
                 (click)="scrollToImage(i)"
                 class="w-20 h-20 flex-shrink-0 cursor-pointer rounded-lg border-2 border-transparent object-cover">
          </div>
        </div>

        <div class="mt-12" *ngIf="product.sizes && product.sizes.length > 0">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Select Size</h3>
          <div class="grid grid-cols-4 gap-3">
            <button *ngFor="let size of product.sizes" 
                    (click)="selectSize(size.name)"
                    class="h-16 border border-gray-800 rounded-2xl font-bold uppercase transition-all">
              {{size.name}}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-12 mb-8">
          <div class="flex items-center bg-neutral-900 border border-white/5 h-16 rounded-2xl px-2">
            <button (click)="decrementQuantity()" class="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors">-</button>
            <span class="w-12 text-center text-white font-bold text-lg">{{quantity}}</span>
            <button (click)="incrementQuantity()" class="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors">+</button>
          </div>
          <button (click)="addToCart()" 
                  class="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black h-16 flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-yellow-600/10">
            Add to Archive
          </button>
        </div>

        <a [href]="whatsappLink" target="_blank" 
           class="w-full h-16 rounded-2xl border border-white/5 flex items-center justify-center gap-3 text-white/40 hover:text-white hover:bg-white/5 transition-all uppercase text-[10px] font-bold tracking-[0.3em]">
          Ask on WhatsApp
        </a>

        <div class="mt-12 p-8 bg-neutral-900 rounded-3xl mb-20">
          <p class="text-gray-400">{{product.description}}</p>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  @ViewChild('galleryContainer') galleryContainer!: ElementRef;
  product: Product | null = null;
  mainImage: string = '';
  currentImageIndex: number = 0;
  quantity: number = 1;
  selectedSize: string | null = null;
  showSizeError: boolean = false;
  whatsappNumber: string = '33612345678'; // Default fallback

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private settingService: SettingService,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe(data => {
        this.product = data;
        const main = data.images.find(i => i.isMain);
        this.mainImage = main ? main.url : (data.images.length > 0 ? data.images[0].url : '');
        
        // Update SEO Tags
        this.updateSeoTags(data);
        
        // Preload images for better UX
        this.preloadImages(data);
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

  scrollToImage(index: number) {
    this.currentImageIndex = index;
    const scrollContainer = this.galleryContainer?.nativeElement;
    if (scrollContainer) {
        scrollContainer.scrollTo({
            left: index * scrollContainer.clientWidth,
            behavior: 'smooth'
        });
    }
  }

  onScroll(event: Event) {
    const container = event.target as HTMLElement;
    this.currentImageIndex = Math.round(container.scrollLeft / container.clientWidth);
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (!this.product || this.product.images.length <= 1) return;
    const nextIndex = (this.currentImageIndex + 1) % this.product.images.length;
    this.scrollToImage(nextIndex);
  }

  prevImage(event: Event) {
    event.stopPropagation();
    if (!this.product || this.product.images.length <= 1) return;
    const prevIndex = (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length;
    this.scrollToImage(prevIndex);
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
    this.showSizeError = false;
  }

  addToCart() {
    if (this.product) {
      if (this.product.sizes && this.product.sizes.length > 0 && !this.selectedSize) {
        this.showSizeError = true;
        return;
      }
      this.cartService.addToCart(this.product, this.quantity, this.selectedSize || undefined);
    }
  }

  get whatsappLink(): SafeUrl {
    if (!this.product) return '';
    const priceSuffix = this.product.price > 0 ? ` [Fiyat: *₺${this.product.price}*]` : '';
    const sizeSuffix = this.selectedSize ? ` [Beden: *${this.selectedSize}*]` : '';
    const message = `Merhaba, şu ürün hakkında bilgi almak istiyorum: *${this.product.title}*${priceSuffix}${sizeSuffix}\n\nStok durumu nedir?`;
    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  private updateSeoTags(product: Product) {
    const title = `${product.title} | Saint Archive`;
    const description = product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Buy ${product.title} at Saint Archive.`;
    const imageUrl = this.getMainImage(product);

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    
    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    
    // Twitter
    this.metaService.updateTag({ property: 'twitter:title', content: title });
    this.metaService.updateTag({ property: 'twitter:description', content: description });
    this.metaService.updateTag({ property: 'twitter:image', content: imageUrl });
  }

  private getMainImage(product: Product): string {
    const main = product.images.find(i => i.isMain);
    return main ? main.url : (product.images.length > 0 ? product.images[0].url : '');
  }

  getProxyUrl(url: string | undefined): string {
    return this.productService.getProxyUrl(url);
  }

  private preloadImages(product: Product) {
    if (!product.images || product.images.length === 0) return;
    
    // Preload top 3 images (including main)
    product.images.slice(0, 3).forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.getProxyUrl(img.url);
      document.head.appendChild(link);
    });
  }
}

