import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-featured-sort',
  standalone: true,
  imports: [CommonModule, RouterLink, DragDropModule],
  template: `
    <div class="animate-fade-in pb-24">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-display font-bold text-slate-900">Featured Sorting</h2>
          <p class="text-slate-500 mt-1">Drag and drop to reorder products in the storefront slider.</p>
        </div>
        <div class="flex items-center gap-4">
            <a routerLink="/admin/products" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]">
                Cancel
            </a>
            <button (click)="saveOrder()" [disabled]="saving || products.length === 0"
                    class="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 disabled:opacity-30 uppercase tracking-widest text-[10px]">
                <svg *ngIf="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Save Order
            </button>
        </div>
      </div>

      <!-- Drag List container -->
      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        <div *ngIf="loading" class="py-20 flex flex-col items-center justify-center opacity-40">
            <div class="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-[10px] font-black tracking-widest uppercase">Loading Featured Products...</p>
        </div>

        <div *ngIf="!loading && products.length === 0" class="py-20 text-center opacity-40">
            <p class="text-lg font-medium">No featured products found.</p>
            <p class="text-sm">Mark some products as 'Featured' in the product list first.</p>
        </div>

        <div cdkDropList (cdkDropListDropped)="drop($event)" class="divide-y divide-slate-100">
          <div *ngFor="let product of products" cdkDrag 
               class="bg-white hover:bg-slate-50 transition-colors flex items-center p-6 gap-6 cursor-move group active:bg-slate-100">
            
            <!-- Custom Preview for Dragging -->
            <div *cdkDragPlaceholder class="bg-slate-50 h-[88px] border-2 border-dashed border-slate-200 rounded-xl"></div>

            <!-- Drag Handle -->
            <div class="text-slate-300 group-hover:text-slate-600 transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" /></svg>
            </div>

            <!-- Product Thumb -->
            <div class="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
               <img [src]="getMainImageUrl(product)" referrerpolicy="no-referrer" class="w-full h-full object-cover">
            </div>

            <!-- Info -->
            <div class="flex-1">
               <div class="font-bold text-slate-900 text-lg line-clamp-1">{{ product.title }}</div>
               <div class="text-xs text-slate-400 font-mono mt-1">ID: {{ product.id.substring(0,8) }}</div>
            </div>

            <!-- Sorting Indication -->
            <div class="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-[10px] font-black text-slate-300 tracking-widest uppercase">Position</span>
                <span class="text-2xl font-display font-black text-slate-200 italic">#{{ products.indexOf(product) + 1 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Toast -->
      <div *ngIf="showSuccess" class="fixed bottom-10 right-10 bg-black text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up z-50">
          <div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span class="text-sm font-bold tracking-tight uppercase">Order Saved Successfully</span>
      </div>
    </div>
  `,
  styles: [`
    .cdk-drag-preview {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border-radius: 1.5rem;
      border: 1px solid rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      padding: 1.5rem;
      background: white;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .divide-y.cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .font-display { font-family: 'Outfit', sans-serif; }
  `]
})
export class FeaturedSortComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  saving = false;
  showSuccess = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.loading = true;
    this.productService.getFeaturedProducts().subscribe(data => {
      this.products = data;
      this.loading = false;
    });
  }

  drop(event: CdkDragDrop<Product[]>) {
    moveItemInArray(this.products, event.previousIndex, event.currentIndex);
  }

  saveOrder() {
    this.saving = true;
    const ids = this.products.map(p => p.id);
    this.productService.updateFeaturedOrder(ids).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 3000);
      },
      error: () => {
        this.saving = false;
        alert('Failed to save order.');
      }
    });
  }

  getMainImageUrl(product: Product): string {
    return this.productService.getMainImageUrl(product);
  }
}
