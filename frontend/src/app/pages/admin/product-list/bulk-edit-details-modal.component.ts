import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-bulk-edit-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-neutral-900 border border-white/10 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-zoom-in">
        <!-- Header -->
        <div class="p-8 border-b border-white/5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-display font-black text-white uppercase tracking-wider">Bulk Edit Details</h2>
              <p class="text-white/40 text-xs mt-1 font-bold uppercase tracking-widest">{{selectedProducts.length}} Products Selected</p>
            </div>
            <button (click)="close.emit()" class="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div class="space-y-6">
            <!-- Bulk Operations Section -->
            <div class="p-6 bg-[#c5a059]/10 rounded-3xl border border-[#c5a059]/20 mb-8">
              <div class="flex flex-col md:flex-row md:items-end gap-6">
                <div class="flex-1">
                  <label class="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em] mb-2 block">Set Bulk Title for All Products</label>
                  <input [(ngModel)]="bulkTitle" 
                         class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#c5a059] focus:border-transparent transition-all"
                         placeholder="Enter common title for all selected items...">
                </div>
                <button (click)="applyBulkTitleAll()"
                        [disabled]="!bulkTitle.trim()"
                        class="px-8 py-3 bg-[#c5a059] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#d4b476] transition-all disabled:opacity-50 disabled:grayscale">
                  Apply to All
                </button>
              </div>
            </div>

            <div *ngFor="let item of editableItems; let i = index" 
                 class="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
              <div class="flex gap-6">
                <!-- Product Preview -->
                <div class="w-24 h-24 rounded-2xl bg-black overflow-hidden flex-shrink-0 border border-white/10">
                  <img [src]="getMainImageUrl(selectedProducts[i])" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
                </div>
                
                <!-- Fields -->
                <div class="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <!-- Title -->
                  <div class="md:col-span-8">
                    <label class="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em] mb-2 block">Title</label>
                    <input [(ngModel)]="item.title" 
                           class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#c5a059] focus:border-transparent transition-all"
                           placeholder="Product Title">
                  </div>
                  
                  <!-- Price -->
                  <div class="md:col-span-4">
                    <label class="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em] mb-2 block">Price (₺)</label>
                    <input type="number" [(ngModel)]="item.price" 
                           class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-[#c5a059] focus:border-transparent transition-all"
                           placeholder="0.00">
                  </div>
                  
                      <!-- Description -->
                      <div class="md:col-span-9">
                        <label class="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em] mb-2 block">Description</label>
                        <textarea [(ngModel)]="item.description" rows="2"
                                  class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/70 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent transition-all resize-none"
                                  placeholder="Product Description"></textarea>
                      </div>

                      <!-- Featured Toggle -->
                      <div class="md:col-span-3 flex items-end pb-3">
                        <label class="flex items-center gap-3 cursor-pointer group/toggle">
                          <input type="checkbox" [(ngModel)]="item.isFeatured" class="hidden peer">
                          <div class="w-12 h-6 bg-white/5 rounded-full relative transition-colors peer-checked:bg-[#c5a059]">
                            <div class="absolute top-1 left-1 w-4 h-4 bg-white/20 rounded-full transition-all peer-checked:left-7 peer-checked:bg-black"></div>
                          </div>
                          <span class="text-[10px] font-bold text-white/40 uppercase tracking-widest peer-checked:text-[#c5a059]">Featured</span>
                        </label>
                      </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 border-t border-white/5 bg-black/20 flex items-center justify-between">
          <button (click)="close.emit()" class="px-8 py-4 rounded-2xl font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Cancel</button>
          <button (click)="save()" 
                  [disabled]="isSaving"
                  class="px-10 py-4 bg-[#c5a059] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d4b476] transition-all shadow-xl shadow-[#c5a059]/20 flex items-center gap-2">
            <span *ngIf="isSaving" class="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
            {{ isSaving ? 'Saving Changes...' : 'Save All Changes' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .animate-zoom-in {
      animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class BulkEditDetailsModalComponent implements OnInit {
  @Input() selectedProducts: Product[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  editableItems: any[] = [];
  isSaving = false;
  bulkTitle: string = ''; // New: state for bulk title input

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.editableItems = this.selectedProducts.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      description: p.description,
      isFeatured: p.isFeatured
    }));
  }

  getMainImageUrl(product: Product): string {
    return this.productService.getMainImageUrl(product);
  }

  // New: Apply title to all items
  applyBulkTitleAll() {
    if (!this.bulkTitle.trim()) return;
    this.editableItems.forEach(item => {
      item.title = this.bulkTitle;
    });
  }

  save() {
    this.isSaving = true;
    this.productService.bulkUpdateDetails(this.editableItems).subscribe({
      next: () => {
        this.isSaving = false;
        this.updated.emit();
        this.close.emit();
      },
      error: (err: any) => {
        console.error('Error updating details:', err);
        alert('An error occurred while updating product details.');
        this.isSaving = false;
      }
    });
  }
}
