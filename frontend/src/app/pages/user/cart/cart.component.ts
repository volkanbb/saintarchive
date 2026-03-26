import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { SettingService } from '../../../core/services/setting.service';
import { CartItem } from '../../../core/models/cart.model';
import { SystemSetting } from '../../../core/models/system-setting.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-[#020202] min-h-screen pt-12 pb-32">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="mb-12 border-b border-white/5 pb-8">
            <h1 class="text-4xl font-display font-black tracking-tighter text-white uppercase italic">Archive Basket</h1>
            <p class="text-[10px] font-bold tracking-[0.4em] text-white/20 uppercase mt-2">Ready for acquisition</p>
        </div>

        <div *ngIf="(cartItems$ | async)?.length === 0" class="flex flex-col items-center justify-center py-32 text-center">
            <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <svg class="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            </div>
            <h2 class="text-xl font-bold text-white uppercase tracking-widest mb-4">Your archive is empty</h2>
            <p class="text-white/40 text-xs tracking-wider mb-8">Discover rare pieces in our curated collection.</p>
            <a routerLink="/products" class="btn-gold px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Browse Collection</a>
        </div>

        <div *ngIf="(cartItems$ | async) as items" class="space-y-8">
            <div *ngIf="items.length > 0" class="space-y-4">
                <!-- Cart Items List -->
                <div *ngFor="let item of items" class="bg-[#0a0a0a] border border-white/5 p-4 flex gap-6 items-center">
                    <!-- Image -->
                    <div class="w-24 h-24 bg-[#1a1a1a] flex-shrink-0 relative overflow-hidden">
                        <img [src]="getMainImage(item.product)" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" [alt]="item.product.title">
                    </div>

                    <!-- Details -->
                    <div class="flex-1 min-w-0">
                        <h3 class="text-white font-black uppercase tracking-tight truncate text-lg">{{ item.product.title }}</h3>
                        <p class="text-[#c5a059] font-bold text-sm tracking-widest mt-1">{{ item.product.price | number:'1.0-0' }} ₺</p>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="flex items-center bg-black/40 border border-white/5 p-1">
                        <button (click)="updateQuantity(item.product.id, item.quantity - 1)" class="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white transition-colors">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                        </button>
                        <span class="w-8 text-center text-white font-bold text-xs">{{ item.quantity }}</span>
                        <button (click)="updateQuantity(item.product.id, item.quantity + 1)" class="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white transition-colors">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>

                    <!-- Price -->
                    <div class="text-right min-w-[100px]">
                        <p class="text-white font-black tracking-tighter">{{ (item.product.price * item.quantity) | number:'1.0-0' }} ₺</p>
                    </div>

                    <!-- Remove -->
                    <button (click)="removeItem(item.product.id)" class="text-white/20 hover:text-red-500 transition-colors p-2">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>

                <!-- Summary & Order -->
                <div class="mt-16 bg-[#0a0a0a] border border-[#c5a059]/30 p-8 shadow-[0_0_50px_rgba(197,160,89,0.05)]">
                    <div class="flex justify-between items-end mb-8">
                        <div>
                            <p class="text-[10px] font-bold tracking-[0.4em] text-white/20 uppercase mb-2">Total Archive Value</p>
                            <h2 class="text-4xl font-display font-black text-white italic tracking-tighter">{{ getTotalPrice() | number:'1.0-0' }} ₺</h2>
                        </div>
                        <div class="text-right">
                             <p class="text-[10px] font-bold tracking-[0.4em] text-[#c5a059] uppercase">VAT included</p>
                        </div>
                    </div>

                    <a [href]="whatsappLink" target="_blank" class="btn-gold w-full py-6 flex items-center justify-center gap-4 group shadow-2xl relative overflow-hidden">
                        <span class="relative z-10 font-black tracking-[0.4em] uppercase text-sm">Send Order via WhatsApp</span>
                        <svg class="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    </a>
                    
                    <button (click)="clearCart()" class="w-full mt-4 text-[9px] font-bold text-white/20 hover:text-white/40 uppercase tracking-[0.4em] transition-colors py-2">
                        Clear All Archive Entries
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  whatsappNumber: string = '33612345678'; // Default fallback

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private settingService: SettingService,
    private sanitizer: DomSanitizer
  ) {
    this.cartItems$ = this.cartService.cartItems$;
  }

  ngOnInit(): void {
    this.settingService.getSetting('WhatsAppNumber').subscribe({
      next: (s: SystemSetting) => this.whatsappNumber = s.value,
      error: () => {} // Keep default on error
    });
  }

  updateQuantity(productId: string, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your archive basket?')) {
      this.cartService.clearCart();
    }
  }

  getTotalPrice(): number {
    return this.cartService.getCartTotal();
  }

  getMainImage(product: any): string {
    return this.productService.getMainImageUrl(product);
  }

  get whatsappLink(): SafeUrl {
    const items = this.cartService.items;
    if (items.length === 0) return '';

    let message = `*SAINT ARCHIVE - NEW ORDER INQUIRY*\n`;
    message += `----------------------------------\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.product.title}*\n`;
      message += `   Qty: ${item.quantity} | Price: ${item.product.price * item.quantity} ₺\n`;
    });

    message += `----------------------------------\n`;
    message += `*Total Value:* ${this.getTotalPrice()} ₺\n\n`;
    message += `Please confirm availability for these archive pieces.`;

    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
