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
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  @ViewChild('galleryContainer') galleryContainer!: ElementRef;
  product: Product | null = null;
  mainImage: string = '';
  currentImageIndex: number = 0;
  quantity: number = 1;
  selectedSize: string | null = null;
  showSizeError: boolean = false;
  showCartSuccess: boolean = false;
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
      
      // Show success notification
      this.showCartSuccess = true;
      setTimeout(() => this.showCartSuccess = false, 3000);
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

