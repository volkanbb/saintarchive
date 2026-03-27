import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-bulk-edit-categories-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-neutral-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-zoom-in">
        <!-- Header -->
        <div class="p-8 border-b border-white/5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-display font-black text-white uppercase tracking-wider">Bulk Assign Categories</h2>
              <p class="text-white/40 text-xs mt-1 font-bold uppercase tracking-widest">{{selectedProductIds.length}} Products Selected</p>
            </div>
            <button (click)="close.emit()" class="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-8">
          <!-- Step 1: Main Category -->
          <section>
            <h3 class="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em] mb-4">Step 1: Select Main Category</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button *ngFor="let cat of categories" 
                      (click)="selectCategory(cat.id)"
                      [ngClass]="selectedCategoryId === cat.id ? 'bg-[#c5a059] text-black border-transparent' : 'bg-white/5 text-white/60 border-white/5'"
                      class="px-4 py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 text-center">
                {{cat.name}}
              </button>
            </div>
          </section>

          <!-- Step 2: Sub-Category -->
          <section *ngIf="selectedCategoryId && getSelectedCategorySubCategories().length > 0">
            <h3 class="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em] mb-4">Step 2: Select Sub-Category (Optional)</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button (click)="selectSubCategory(null)"
                      [ngClass]="selectedSubCategoryId === null ? 'bg-[#c5a059] text-black border-transparent' : 'bg-white/5 text-white/60 border-white/5'"
                      class="px-4 py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 text-center">
                None
              </button>
              <button *ngFor="let sub of getSelectedCategorySubCategories()" 
                      (click)="selectSubCategory(sub.id)"
                      [ngClass]="selectedSubCategoryId === sub.id ? 'bg-[#c5a059] text-black border-transparent' : 'bg-white/5 text-white/60 border-white/5'"
                      class="px-4 py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 text-center">
                {{sub.name}}
              </button>
            </div>
          </section>

          <div *ngIf="!selectedCategoryId" class="p-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
            <svg class="w-12 h-12 text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p class="text-white/20 text-xs font-bold uppercase tracking-widest">Select a main category to continue</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 border-t border-white/5 bg-black/20 flex items-center justify-between">
          <button (click)="close.emit()" class="px-8 py-4 rounded-2xl font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Cancel</button>
          <button (click)="apply()" 
                  [disabled]="!selectedCategoryId || isApplying"
                  [class.opacity-30]="!selectedCategoryId || isApplying"
                  class="px-10 py-4 bg-[#c5a059] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d4b476] transition-all shadow-xl shadow-[#c5a059]/20 flex items-center gap-2">
            <span *ngIf="isApplying" class="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
            {{ isApplying ? 'Applying...' : 'Apply Selection' }}
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
export class BulkEditCategoriesModalComponent implements OnInit {
  @Input() selectedProductIds: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  categories: Category[] = [];
  selectedCategoryId: string | null = null;
  selectedSubCategoryId: string | null = null;
  isApplying = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  selectCategory(id: string) {
    this.selectedCategoryId = id;
    this.selectedSubCategoryId = null;
  }

  selectSubCategory(id: string | null) {
    this.selectedSubCategoryId = id;
  }

  getSelectedCategorySubCategories(): Category[] {
    const cat = this.categories.find(c => c.id === this.selectedCategoryId);
    return cat?.subCategories || [];
  }

  apply() {
    if (!this.selectedCategoryId) return;
    
    this.isApplying = true;
    this.productService.bulkUpdateCategories(
      this.selectedProductIds, 
      this.selectedCategoryId, 
      this.selectedSubCategoryId || undefined
    ).subscribe({
      next: () => {
        this.isApplying = false;
        this.updated.emit();
        this.close.emit();
      },
      error: (err: any) => {
        console.error('Error updating categories:', err);
        alert('An error occurred while updating categories.');
        this.isApplying = false;
      }
    });
  }
}
