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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-screen flex flex-col overflow-hidden shadow-2xl">
        <div class="p-8 border-b border-white/5 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white uppercase">Bulk Edit Category Details</h2>
          <button (click)="close.emit()" class="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">X</button>
        </div>
        <div class="flex-1 overflow-y-auto p-8">
          <div class="space-y-6">
            <div *ngFor="let item of editableItems" class="p-6 bg-white/5 rounded-2xl border border-white/5">
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="text-xs font-bold text-[#c5a059] uppercase block mb-2">Category Name</label>
                  <input [(ngModel)]="item.name" class="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
                </div>
                <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <span class="text-xs font-bold text-white uppercase">Show in Navbar</span>
                  <input type="checkbox" [(ngModel)]="item.showInNavbar" class="w-6 h-6 rounded border-white/10 bg-black text-[#c5a059]">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-8 border-t border-white/5 bg-black/20 flex items-center justify-between">
          <button (click)="close.emit()" class="px-8 py-4 text-white/40 uppercase text-xs">Cancel</button>
          <button (click)="save()" [disabled]="isSaving" class="px-10 py-4 bg-[#c5a059] text-black rounded-xl font-bold text-xs uppercase">
            {{ isSaving ? 'Saving...' : 'Save All Changes' }}
          </button>
        </div>
      </div>
    </div>
  `
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
      subCategoryNamesStr: ''
    }));
  }
  getProxyUrl(url: string | undefined): string { return ''; }
  save(): void {
    const updates = this.editableItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      showInNavbar: item.showInNavbar,
      navbarOrder: item.navbarOrder,
      subCategoryNames: []
    }));
    this.isSaving = true;
    this.categoryService.bulkUpdateCategoryDetails(updates).subscribe({
      next: () => {
        this.isSaving = false;
        this.updated.emit();
        this.close.emit();
      },
      error: () => this.isSaving = false
    });
  }
}
