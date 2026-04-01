import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-bulk-edit-category-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-neutral-900 border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-zoom-in">
        <!-- Header -->
        <div class="p-8 border-b border-white/5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-display font-black text-white uppercase tracking-wider">Bulk Edit Category Details</h2>
              <p class="text-white/40 text-xs mt-1 font-bold uppercase tracking-widest">{{selectedCategories.length}} Items Selected</p>
            </div>
            <button (click)="close.emit()" class="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div class="space-y-6">
            <div *ngFor="let item of editableItems; let i = index" 
                 class="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
              <div class="flex gap-6">
                <!-- Visual Preview -->
                <div class="w-32 h-32 rounded-2xl bg-black overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                  <img *ngIf="item.imageUrl" [src]="getProxyUrl(item.imageUrl)" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
                  <svg *ngIf="!item.imageUrl" class="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                
                <!-- Fields -->
                <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Name -->
                  <div>
                    <label class="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-2 block">Category Name</label>
                    <input [(ngModel)]="item.name" 
                           class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                           placeholder="Category Name">
                  </div>
                  
                  <!-- Image URL -->
                  <div>
                    <label class="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-2 block">Image URL</label>
                    <input [(ngModel)]="item.imageUrl" 
                           class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                           placeholder="Yupoo or direct image URL...">
                  </div>

                  <!-- Description -->
                  <div>
                    <label class="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-2 block">Description</label>
                    <input [(ngModel)]="item.description"
                           class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/70 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                           placeholder="Category Description">
                  </div>

                  <!-- Sub-categories -->
                  <div>
                    <label class="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-2 block">Sub-categories (Comma separated)</label>
                    <input [(ngModel)]="item.subCategoryNamesStr"
                           class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                           placeholder="Sub1, Sub2, Sub3">
                  </div>

                  <!-- Navbar Settings -->
                  <div class="md:col-span-2 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-8">
                    <div class="flex items-center gap-4">
                      <div class="relative inline-flex items-center cursor-pointer" (click)="item.showInNavbar = !item.showInNavbar">
                        <div class="w-11 h-6 rounded-full transition-colors duration-200"
                             [class.bg-brand-600]="item.showInNavbar"
                             [class.bg-white/10]="!item.showInNavbar"></div>
                        <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
                             [style.transform]="item.showInNavbar ? 'translateX(20px)' : 'translateX(0)'"></div>
                      </div>
                      <div>
                        <span class="text-[10px] font-black text-white uppercase tracking-widest block">Show in Navbar</span>
                        <span class="text-[9px] text-white/40 uppercase tracking-widest">Display as top-level link</span>
                      </div>
                    </div>

                    <div *ngIf="item.showInNavbar" class="flex items-center gap-3 animate-zoom-in">
                      <span class="text-[10px] font-black text-white/40 uppercase tracking-widest">Order:</span>
                      <input type="number" [(ngModel)]="item.navbarOrder" 
                             class="w-16 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-xs text-brand-500 font-bold focus:ring-1 focus:ring-brand-500 outline-none">
                    </div>
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
                  class="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 flex items-center gap-2">
            <span *ngIf="isSaving" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
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
export class BulkEditCategoryDetailsModalComponent implements OnInit {
  @Input() selectedCategories: Category[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  editableItems: any[] = [];
  isSaving = false;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.editableItems = this.selectedCategories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl || '',
      showInNavbar: c.showInNavbar || false,
      navbarOrder: c.navbarOrder || 0,
      subCategoryNamesStr: c.subCategories?.map(s => s.name).join(', ') || ''
    }));
  }

  getProxyUrl(url: string | undefined): string {
    if (!url) return '';
    return this.productService.getProxyUrl(url);
  }

  save() {
    if (this.editableItems.some(i => !i.name.trim())) {
      alert('Category names cannot be empty.');
      return;
    }

    const updates = this.editableItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      showInNavbar: item.showInNavbar,
      navbarOrder: item.navbarOrder,
      subCategoryNames: item.subCategoryNamesStr.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    }));

    this.isSaving = true;
    this.categoryService.bulkUpdateCategoryDetails(updates).subscribe({
      next: () => {
        this.isSaving = false;
        this.updated.emit();
        this.close.emit();
      },
      error: (err: any) => {
        console.error('Error updating category details:', err);
        alert('An error occurred while updating category details.');
        this.isSaving = false;
      }
    });
  }
}
