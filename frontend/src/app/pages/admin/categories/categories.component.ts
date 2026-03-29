import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models/category.model';
import { BulkEditCategoryDetailsModalComponent } from './bulk-edit-category-details-modal.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, BulkEditCategoryDetailsModalComponent],
  template: `
    <div class="animate-fade-in">
      <div class="mb-8">
        <h2 class="text-3xl font-display font-bold text-slate-900">Categories</h2>
        <p class="text-slate-500 mt-1">Manage product classifications across the storefront.</p>
      </div>
      
      <!-- Create/Edit box -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <h3 class="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
          {{ editingCategory ? 'Edit Category' : 'Create New Category' }}
        </h3>
        <form class="flex flex-col gap-4" (ngSubmit)="saveCategory()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
              <input type="text" [(ngModel)]="newCategory.name" name="name" required 
                     class="block w-full rounded-xl border-slate-300 border bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="e.g. Outerwear">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input type="text" [(ngModel)]="newCategory.description" name="desc" 
                     class="block w-full rounded-xl border-slate-300 border bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="Short detail...">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input type="text" [(ngModel)]="newCategory.imageUrl" name="imageUrl" 
                     class="block w-full rounded-xl border-slate-300 border bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="Yupoo or direct image URL...">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Sub-categories (Comma separated)</label>
              <input type="text" [(ngModel)]="subCategoryNames" name="subs" 
                     class="block w-full rounded-xl border-slate-300 border bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="e.g. Giyim, Aksesuar, Ayakkabı">
              <p class="text-[10px] text-slate-400 mt-1">Enter names separated by commas to add multiple sub-categories. Existing ones will be preserved.</p>
            </div>
          </div>
          <!-- Image preview -->
          <div *ngIf="newCategory.imageUrl" class="flex items-center gap-3">
            <div class="relative group">
              <img [src]="getProxyUrl(newCategory.imageUrl)" class="w-32 h-20 object-cover rounded-lg border border-slate-200" (error)="onImageError()">
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <span class="text-[10px] text-white font-bold">PREVIEW</span>
              </div>
            </div>
            <span class="text-xs text-green-600 font-medium" *ngIf="!imageError">Preview Loaded via Proxy</span>
            <span class="text-xs text-red-600 font-medium" *ngIf="imageError">Image Load Failed</span>
          </div>

          <div class="flex gap-3">
            <button type="submit" class="bg-brand-600 text-white px-8 py-2 rounded-xl font-medium hover:bg-brand-700 active:scale-95 transition-all shadow-sm shadow-brand-600/20">
              {{ editingCategory ? 'Update Changes' : 'Publish Category' }}
            </button>
            <button *ngIf="editingCategory" type="button" (click)="cancelEdit()" class="bg-slate-100 text-slate-600 px-8 py-2 rounded-xl font-medium hover:bg-slate-200 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Feedback Message -->
      <div *ngIf="feedbackMessage" 
           [ngClass]="feedbackMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'"
           class="mb-6 p-4 rounded-xl border flex items-center justify-between animate-slide-up">
        <div class="flex items-center gap-3">
            <svg *ngIf="feedbackMessage.type === 'success'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <svg *ngIf="feedbackMessage.type === 'error'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="text-sm font-bold">{{ feedbackMessage.text }}</span>
        </div>
        <button (click)="feedbackMessage = null" class="opacity-50 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Bulk Actions Bar -->
      <div *ngIf="selectedCategoryIds.size > 0" 
           class="mb-6 p-4 bg-slate-900 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-900/20 animate-slide-up">
        <div class="flex items-center gap-4 px-2">
            <span class="text-white font-black text-xs uppercase tracking-widest">{{ selectedCategoryIds.size }} Categories Selected</span>
        </div>
        <div class="flex items-center gap-3">
            <button (click)="openBulkEditModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Details
            </button>
            <button (click)="bulkDelete()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete Selected
            </button>
            <button (click)="clearSelection()" class="p-2 text-slate-400 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </div>

      <!-- Categories Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="pl-6 py-4 w-10">
                <input type="checkbox" [checked]="isAllSelected()" (change)="toggleSelectAll()"
                       class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer transition-all">
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hierarchy</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Visual</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sub-categories</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <ng-container *ngFor="let cat of categories">
              <!-- Main Category -->
              <tr class="hover:bg-slate-50 transition-colors group" [class.bg-brand-50]="selectedCategoryIds.has(cat.id)">
                <td class="pl-6 py-4">
                  <input type="checkbox" [checked]="selectedCategoryIds.has(cat.id)" (change)="toggleSelection(cat.id)"
                         class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer transition-all">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <span class="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full uppercase">Main</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <img *ngIf="cat.imageUrl" [src]="getProxyUrl(cat.imageUrl)" class="w-16 h-12 object-cover rounded-lg border border-slate-200">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-semibold text-slate-900">{{cat.name}}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let sub of cat.subCategories" class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                      {{sub.name}}
                    </span>
                    <span *ngIf="!cat.subCategories?.length" class="text-xs text-slate-400 italic">None</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <button (click)="startEdit(cat)" class="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button (click)="deleteCategory(cat.id)" class="text-slate-400 group-hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Sub Categories (Indented) -->
              <tr *ngFor="let sub of cat.subCategories" class="bg-slate-50/30 hover:bg-slate-50 transition-colors group border-l-4 border-slate-200" [class.bg-brand-50]="selectedCategoryIds.has(sub.id)">
                <td class="pl-6 py-2">
                  <input type="checkbox" [checked]="selectedCategoryIds.has(sub.id)" (change)="toggleSelection(sub.id)"
                         class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer transition-all">
                </td>
                <td class="px-6 py-2 whitespace-nowrap pl-10">
                   <span class="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full uppercase border border-slate-200">Sub</span>
                </td>
                <td class="px-6 py-2 whitespace-nowrap">
                   <div class="w-10 h-8 rounded-lg bg-slate-200/50 flex items-center justify-center text-slate-400">
                     <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   </div>
                </td>
                <td class="px-6 py-2 whitespace-nowrap">
                  <span class="text-sm font-medium text-slate-600">{{sub.name}}</span>
                </td>
                <td class="px-6 py-2">
                   <span class="text-xs text-slate-400">Belongs to {{cat.name}}</span>
                </td>
                <td class="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <button (click)="deleteCategory(sub.id)" class="text-slate-400 group-hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex items-center justify-center">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </ng-container>
            <tr *ngIf="categories.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                <p>No categories found.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bulk Edit Modal -->
    <app-bulk-edit-category-details-modal 
        *ngIf="showBulkEditModal"
        [selectedCategories]="getSelectedCategories()"
        (close)="closeBulkEditModal()"
        (updated)="onBulkUpdated()">
    </app-bulk-edit-category-details-modal>
  `
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  newCategory = { name: '', description: '', imageUrl: '' };
  subCategoryNames = '';
  editingCategory: Category | null = null;
  imageError = false;
  selectedCategoryIds = new Set<string>();
  feedbackMessage: { text: string; type: 'success' | 'error' } | null = null;
  showBulkEditModal = false;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => this.categories = res);
  }

  saveCategory() {
    if(!this.newCategory.name.trim()) return;
    
    // Parse sub-categories if any
    const subCategories = this.subCategoryNames
       ? this.subCategoryNames.split(',').map(s => ({ name: s.trim() })).filter(s => s.name.length > 0)
       : [];

    const payload = {
      ...this.newCategory,
      subCategories: subCategories as any
    };

    if (this.editingCategory) {
      this.categoryService.updateCategory(this.editingCategory.id, payload as any).subscribe({
        next: () => {
          this.showFeedback('Category updated successfully!', 'success');
          this.loadCategories();
          this.cancelEdit();
        },
        error: () => this.showFeedback('Failed to update category.', 'error')
      });
    } else {
      this.categoryService.createCategory(payload).subscribe({
        next: () => {
          this.showFeedback('Category created successfully!', 'success');
          this.loadCategories();
          this.resetForm();
        },
        error: () => this.showFeedback('Failed to create category.', 'error')
      });
    }
  }

  showFeedback(text: string, type: 'success' | 'error') {
    this.feedbackMessage = { text, type };
    setTimeout(() => {
      if (this.feedbackMessage?.text === text) this.feedbackMessage = null;
    }, 4000);
  }

  startEdit(cat: Category) {
    this.editingCategory = cat;
    this.newCategory = { 
      name: cat.name, 
      description: cat.description, 
      imageUrl: cat.imageUrl || '' 
    };
    // Populate existing sub-categories for easy addition
    this.subCategoryNames = cat.subCategories?.map(s => s.name).join(', ') || '';
    this.imageError = false;
  }

  cancelEdit() {
    this.editingCategory = null;
    this.resetForm();
  }

  resetForm() {
    this.newCategory = { name: '', description: '', imageUrl: '' };
    this.subCategoryNames = '';
    this.imageError = false;
  }

  deleteCategory(id: string) {
    if (confirm('Permanently delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        if (this.editingCategory?.id === id) this.cancelEdit();
        this.loadCategories();
      });
    }
  }

  onImageError() {
    this.imageError = true;
  }

  getProxyUrl(url: string | undefined): string {
    if (!url) return '';
    return this.productService.getProxyUrl(url);
  }

  toggleSelection(id: string) {
    if (this.selectedCategoryIds.has(id)) {
      this.selectedCategoryIds.delete(id);
    } else {
      this.selectedCategoryIds.add(id);
    }
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedCategoryIds.clear();
    } else {
      this.categories.forEach(cat => {
        this.selectedCategoryIds.add(cat.id);
        cat.subCategories?.forEach(sub => this.selectedCategoryIds.add(sub.id));
      });
    }
  }

  isAllSelected(): boolean {
    let totalCount = this.categories.length;
    this.categories.forEach(c => totalCount += (c.subCategories?.length || 0));
    return totalCount > 0 && this.selectedCategoryIds.size === totalCount;
  }

  clearSelection() {
    this.selectedCategoryIds.clear();
  }

  bulkDelete() {
    if (confirm(`Are you sure you want to delete ${this.selectedCategoryIds.size} categories/sub-categories?`)) {
      const ids = Array.from(this.selectedCategoryIds);
      this.categoryService.bulkDeleteCategories(ids).subscribe({
        next: () => {
          this.showFeedback('Selected categories deleted successfully!', 'success');
          this.selectedCategoryIds.clear();
          this.loadCategories();
        },
        error: () => this.showFeedback('Failed to delete selected categories.', 'error')
      });
    }
  }

  openBulkEditModal() {
    this.showBulkEditModal = true;
  }

  closeBulkEditModal() {
    this.showBulkEditModal = false;
  }

  onBulkUpdated() {
    this.showFeedback('Selected categories updated successfully!', 'success');
    this.selectedCategoryIds.clear();
    this.loadCategories();
  }

  getSelectedCategories(): Category[] {
    const selected: Category[] = [];
    this.categories.forEach(cat => {
      if (this.selectedCategoryIds.has(cat.id)) selected.push(cat);
      cat.subCategories?.forEach(sub => {
        if (this.selectedCategoryIds.has(sub.id)) selected.push(sub);
      });
    });
    return selected;
  }
}
