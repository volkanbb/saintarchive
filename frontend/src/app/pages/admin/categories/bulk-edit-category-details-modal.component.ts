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
      <div class="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-zoom-in">
        <div class="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white uppercase tracking-wider">Bulk Edit Categories</h2>
            <p class="text-white/40 text-xs font-bold uppercase tracking-widest">{{selectedCategories.length}} Items Selected</p>
          </div>
          <button (click)="close.emit()" class="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">X</button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 scrollbar-hide">
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
                
                <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-[10px] font-black text-brand-500 uppercase mb-2 block tracking-widest">Name</label>
                    <input [(ngModel)]="item.name" class="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-brand-500 outline-none">
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-brand-500 uppercase mb-2 block tracking-widest">Image URL</label>
                    <input [(ngModel)]="item.imageUrl" class="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-brand-500 outline-none">
                  </div>
                  <div class="md:col-span-2">
                    <label class="text-[10px] font-black text-brand-500 uppercase mb-2 block tracking-widest">Description</label>
                    <input [(ngModel)]="item.description" class="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-brand-500 outline-none">
                  </div>
                  <div class="md:col-span-2">
                    <label class="text-[10px] font-black text-brand-500 uppercase mb-2 block tracking-widest">Sub-categories (comma separated)</label>
                    <input [(ngModel)]="item.subCategoryNamesStr" class="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-brand-500 outline-none" placeholder="Sub-categories (comma separated)">
                  </div>
                  <div class="md:col-span-2 p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                    <span class="text-xs font-black text-white uppercase">Show in Navbar</span>
                    <input type="checkbox" [(ngModel)]="item.showInNavbar" class="w-6 h-6 rounded border-white/10 bg-black text-brand-600">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
    .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
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
      showInNavbar: !!c.showInNavbar,
      navbarOrder: c.navbarOrder || 0,
      subCategoryNamesStr: c.subCategories?.map(s => s.name).join(', ') || ''
    }));
  }

  getProxyUrl(url: string | undefined): string {
    if (!url) return '';
    return this.productService.getProxyUrl(url);
  }

  save(): void {
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
      subCategoryNames: item.subCategoryNamesStr
        ? item.subCategoryNamesStr.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : []
    }));

    this.isSaving = true;
    this.categoryService.bulkUpdateCategoryDetails(updates).subscribe({
      next: () => {
        this.isSaving = false;
        this.updated.emit();
        this.close.emit();
      },
      error: (err: any) => {
        console.error('Error updating categories:', err);
        alert('An error occurred while saving changes.');
        this.isSaving = false;
      }
    });
  }
}
