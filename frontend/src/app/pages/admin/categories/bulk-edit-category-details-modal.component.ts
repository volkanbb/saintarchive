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
      <div class="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <!-- Header -->
        <div class="p-8 border-b border-white/5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-display font-black text-white uppercase tracking-wider">Bulk Edit Category Details</h2>
              <p class="text-white/40 text-xs mt-1 font-bold uppercase tracking-widest">{{selectedCategories.length}} Items Selected</p>
            </div>
            <button (click)="close.emit()" class="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-8">
          <div class="space-y-6">
            <div *ngFor="let item of editableItems" class="p-6 bg-white/5 rounded-3xl border border-white/5">
              <div class="flex gap-6">
                <!-- Visual Preview -->
                <div class="w-32 h-32 rounded-2xl bg-black overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                  <img *ngIf="item.imageUrl" [src]="getProxyUrl(item.imageUrl)" class="w-full h-full object-cover opacity-80" alt="Category image">
                  <svg *ngIf="!item.imageUrl" class="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <!-- Fields -->
                <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Name -->
                  <div>
                    <label class="text-xs font-black text-brand-500 uppercase mb-2 block">Name</label>
                    <input [(ngModel)]="item.name" class="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
                  </div>
                  <div>
                    <label class="text-xs font-black text-brand-500 uppercase mb-2 block">Image URL</label>
                    <input [(ngModel)]="item.imageUrl" class="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
                  </div>
                  <div>
                    <label class="text-xs font-black text-brand-500 uppercase mb-2 block">Description</label>
                    <input [(ngModel)]="item.description" class="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
                  </div>
                  <div>
                    <label class="text-xs font-black text-brand-500 uppercase mb-2 block">Sub-categories (comma separated)</label>
                    <input [(ngModel)]="item.subCategoryNamesStr" class="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
                  </div>

                  <!-- Navbar Settings -->
                  <div class="md:col-span-2 p-4 bg-white/5 rounded-2xl flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="relative inline-flex items-center cursor-pointer" (click)="item.showInNavbar = !item.showInNavbar">
                        <div class="w-11 h-6 rounded-full" [style.background-color]="item.showInNavbar ? '#c5a059' : '#333'"></div>
                        <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" [style.transform]="item.showInNavbar ? 'translateX(20px)' : 'translateX(0)'"></div>
                      </div>
                      <span class="text-xs font-black text-white uppercase">Show in Navbar</span>
                    </div>
                    <div *ngIf="item.showInNavbar" class="flex items-center gap-2">
                      <span class="text-xs font-black text-white/40 uppercase">Order:</span>
                      <input type="number" [(ngModel)]="item.navbarOrder" class="w-16 bg-black border border-white/5 rounded-lg px-2 py-1 text-xs text-white">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 border-t border-white/5 bg-black/20 flex items-center justify-between">
          <button (click)="close.emit()" class="px-8 py-4 rounded-xl font-bold text-white/40 uppercase text-xs">Cancel</button>
          <button (click)="save()" [disabled]="isSaving" class="px-10 py-4 bg-brand-600 text-white rounded-xl font-black text-xs uppercase">
            {{ isSaving ? 'Saving...' : 'Save All Changes' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `]
})
export class BulkEditCategoryDetailsModalComponent implements OnInit {
  @Input() selectedCategories: Category[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  editableItems: any[] = [];
  isSaving = false;
  constructor(private categoryService: CategoryService, private productService: ProductService) {}
  ngOnInit(): void {
    this.editableItems = this.selectedCategories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl || '',
      showInNavbar: !!c.showInNavbar,
      navbarOrder: c.navbarOrder || 0,
      subCategoryNamesStr: c.subCategories?.map(s => s.name).join(', ') || ''
    }));
  }
  getProxyUrl(url: string | undefined): string {
    return this.productService.getProxyUrl(url);
  }
  save(): void {
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
      error: () => {
        alert('Error');
        this.isSaving = false;
      }
    });
  }
}
