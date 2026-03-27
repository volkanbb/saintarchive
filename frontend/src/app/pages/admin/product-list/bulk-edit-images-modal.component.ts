import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-bulk-edit-images-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
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
          <div *ngFor="let product of selectedProducts" class="mb-8 last:mb-0">
            <h3 class="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#c5a059]"></span>
              {{product.title}}
            </h3>
            
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              <div *ngFor="let img of product.images" 
                   (click)="toggleImage(img.id)"
                   [ngClass]="isSelected(img.id) ? 'ring-2 ring-[#c5a059]' : ''"
                   class="relative aspect-square bg-black rounded-xl overflow-hidden cursor-pointer group transition-all">
                <img [src]="getProxyUrl(img.url)" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
                
                <!-- Selection Overlay -->
                <div *ngIf="isSelected(img.id)" class="absolute inset-0 bg-[#c5a059]/20 flex items-center justify-center">
                  <div class="bg-[#c5a059] rounded-full p-1 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div *ngIf="img.isMain" class="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase border border-white/10">Main</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-white/5 bg-black/20 flex items-center justify-between">
          <p class="text-white/40 text-[10px] font-bold uppercase tracking-widest">
            {{selectedImageIds.size}} Images Selected for Deletion
          </p>
          <div class="flex gap-4">
            <button (click)="close.emit()" class="px-6 py-3 rounded-xl border border-white/5 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">Cancel</button>
            <button (click)="confirmDelete()" 
                    [disabled]="selectedImageIds.size === 0 || isDeleting"
                    [class.opacity-50]="selectedImageIds.size === 0 || isDeleting"
                    class="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
              <span *ngIf="isDeleting" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              {{isDeleting ? 'Deleting...' : 'Delete Selected'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class BulkEditImagesModalComponent implements OnInit {
  @Input() selectedProducts: Product[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  selectedImageIds = new Set<string>();
  isDeleting = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {}

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

  confirmDelete() {
    if (this.selectedImageIds.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedImageIds.size} selected images? This action cannot be undone.`)) {
      this.isDeleting = true;
      this.productService.bulkDeleteImages(Array.from(this.selectedImageIds)).subscribe({
        next: () => {
          this.isDeleting = false;
          this.deleted.emit();
          this.close.emit();
        },
        error: (err: any) => {
          console.error('Error deleting images:', err);
          alert('An error occurred while deleting images.');
          this.isDeleting = false;
        }
      });
    }
  }
}
