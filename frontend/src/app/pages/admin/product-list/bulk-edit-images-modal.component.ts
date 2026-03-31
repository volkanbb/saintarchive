import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-bulk-edit-images-modal',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" (click)="onBackdropClick($event)">
      <div class="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-white uppercase tracking-wider">Bulk Manage Images</h2>
            <p class="text-white/40 text-xs mt-1">{{selectedProducts.length}} Products Selected</p>
          </div>
          <button (click)="close.emit()" class="text-white/40 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div *ngFor="let product of selectedProducts" class="mb-10 last:mb-0">
            <h3 class="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#c5a059]"></span>
              {{product.title}}
              <span class="text-white/20 font-normal lowercase ml-auto">Drag images to reorder</span>
            </h3>
            
            <div #imageList="cdkDropList" 
                 cdkDropList 
                 cdkDropListOrientation="vertical"
                 (cdkDropListDropped)="onImageDropped($event, product)"
                 class="flex flex-col gap-3">
              
              <div *ngFor="let img of product.images" 
                   cdkDrag
                   [cdkDragData]="img"
                   (click)="toggleImage(img.id)"
                   [ngClass]="isSelected(img.id) ? 'ring-2 ring-[#c5a059] bg-[#c5a059]/5' : 'bg-white/5'"
                   class="relative flex items-center gap-4 p-3 rounded-2xl cursor-pointer group transition-all border border-white/5 hover:border-white/10">
                
                <!-- Placeholder while dragging -->
                <div *cdkDragPlaceholder class="h-24 w-full bg-white/5 border-2 border-dashed border-white/20 rounded-2xl"></div>

                <!-- Drag Handle -->
                <div class="text-white/20 group-hover:text-white/40 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 9h14M5 15h14"/></svg>
                </div>
                
                <!-- Image Preview (Increased size) -->
                <div class="relative w-24 h-24 rounded-xl overflow-hidden bg-black shrink-0">
                  <img [src]="getProxyUrl(img.url)" 
                       class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity">
                  
                  <div *ngIf="img.isMain" class="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase border border-white/10 pointer-events-none">Main</div>
                </div>

                <!-- Image Details / Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] text-white/40 font-mono truncate mb-1">{{img.url.split('/').pop()}}</p>
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">Position: {{product.images.indexOf(img) + 1}}</span>
                    <span *ngIf="isSelected(img.id)" class="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">Selected for deletion</span>
                  </div>
                </div>

                <!-- Selection Checkbox (Visual only, click handled by row) -->
                <div class="w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center shrink-0"
                     [ngClass]="isSelected(img.id) ? 'bg-[#c5a059] border-[#c5a059]' : 'border-white/10 group-hover:border-white/30'">
                  <svg *ngIf="isSelected(img.id)" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-white/5 bg-black/20 flex items-center justify-between">
          <div class="flex flex-col gap-1">
             <p class="text-white/40 text-[10px] font-bold uppercase tracking-widest">
              {{selectedImageIds.size}} Images Selected for Deletion
            </p>
             <p *ngIf="hasChanges" class="text-[#c5a059] text-[9px] font-bold uppercase animate-pulse">
                Order changes detected
             </p>
          </div>
          <div class="flex gap-4">
            <button (click)="close.emit()" class="px-6 py-3 rounded-xl border border-white/5 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">Cancel</button>
            
            <button (click)="confirmDelete()" 
                    *ngIf="selectedImageIds.size > 0"
                    [disabled]="isProcessing"
                    class="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
              <span *ngIf="isProcessing" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              {{isProcessing ? 'Deleting...' : 'Delete Selected'}}
            </button>

            <button (click)="saveAllChanges()" 
                    [disabled]="!hasChanges || isProcessing"
                    [class.opacity-50]="!hasChanges || isProcessing"
                    class="px-8 py-3 rounded-xl bg-[#c5a059] hover:bg-[#b08d4a] text-black text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
              <span *ngIf="isProcessing" class="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
              {{isProcessing ? 'Saving...' : 'Save All Changes'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 12px;
      box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
      opacity: 0.8;
      z-index: 1000 !important;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class BulkEditImagesModalComponent implements OnInit {
  @Input() selectedProducts: Product[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  selectedImageIds = new Set<string>();
  isProcessing = false;
  hasChanges = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {}

  onImageDropped(event: CdkDragDrop<any[]>, product: Product) {
    if (event.previousIndex === event.currentIndex) return;
    
    moveItemInArray(product.images, event.previousIndex, event.currentIndex);
    this.hasChanges = true;
    
    // Update sortOrder local fields (optional but good for consistency)
    product.images.forEach((img, idx) => img.sortOrder = idx);
  }

  onBackdropClick(event: MouseEvent) {
    if (this.hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to exit?')) {
        this.close.emit();
      }
    } else {
      this.close.emit();
    }
  }

  toggleImage(id: string) {
    if (this.selectedImageIds.has(id)) {
      this.selectedImageIds.delete(id);
    } else {
      this.selectedImageIds.add(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedImageIds.has(id);
  }

  getProxyUrl(url: string | undefined): string {
    return this.productService.getProxyUrl(url);
  }

  saveAllChanges() {
    this.isProcessing = true;
    
    // For each product, we send the new images list (which contains the new order)
    // The backend UpdateProduct handles replacing images and preserving order.
    const updateTasks = this.selectedProducts.map(p => 
      this.productService.updateProduct(p.id!, p)
    );

    // We use a simple counter to track completion or forkJoin if it's many.
    // For now, let's just do them sequentially or concurrently and wait for all.
    // Since we don't have a specific bulk image update endpoint, we use the regular one.
    
    // Optimization: Only update products that actually changed (we could track this per product)
    
    let completedCount = 0;
    updateTasks.forEach(task => {
      task.subscribe({
        next: () => {
          completedCount++;
          if (completedCount === updateTasks.length) {
            this.isProcessing = false;
            this.hasChanges = false;
            this.deleted.emit(); // Signal to refresh list
            this.close.emit();
          }
        },
        error: (err) => {
          console.error('Error updating product images:', err);
          completedCount++;
          if (completedCount === updateTasks.length) {
            this.isProcessing = false;
            alert('Some updates failed. Please check console for details.');
          }
        }
      });
    });
  }

  confirmDelete() {
    if (this.selectedImageIds.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedImageIds.size} selected images? This action cannot be undone.`)) {
      this.isProcessing = true;
      this.productService.bulkDeleteImages(Array.from(this.selectedImageIds)).subscribe({
        next: () => {
          this.isProcessing = false;
          this.deleted.emit();
          this.close.emit();
        },
        error: (err: any) => {
          console.error('Error deleting images:', err);
          alert('An error occurred while deleting images.');
          this.isProcessing = false;
        }
      });
    }
  }
}
