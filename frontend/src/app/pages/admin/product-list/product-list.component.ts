import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Size } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { FormsModule } from '@angular/forms';
import { BulkEditImagesModalComponent } from './bulk-edit-images-modal.component';
import { BulkEditCategoriesModalComponent } from './bulk-edit-categories-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, BulkEditImagesModalComponent, BulkEditCategoriesModalComponent, FormsModule],
  template: `
    <div class="animate-fade-in pb-20">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-display font-bold text-slate-900">Manage Products</h2>
          <p class="text-slate-500 mt-1">Review, edit, and delete your published products.</p>
        </div>
        <div class="flex items-center gap-4">
          <a routerLink="/admin/featured-sort" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            Sort Featured
          </a>
          <a routerLink="/admin/import" class="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-black hover:bg-brand-700 shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Import New
          </a>
        </div>
      </div>

      <div class="flex items-center gap-4 mb-8 p-4 bg-white rounded-2xl border border-slate-200">
        <div class="flex-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Main Category</label>
          <select [(ngModel)]="selectedCategoryId" (change)="onCategoryChange()" 
                  class="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer">
            <option [value]="''">All Categories</option>
            <option *ngFor="let cat of allCategories" [value]="cat.id">{{cat.name}}</option>
          </select>
        </div>
        <div class="flex-1" *ngIf="getSelectedCategorySubCategories().length > 0 || selectedSubCategoryId">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Sub Category</label>
          <select [(ngModel)]="selectedSubCategoryId" (change)="onSubCategoryChange()"
                  class="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer">
            <option [value]="''">All Sub-Categories</option>
            <option *ngFor="let sub of getSelectedCategorySubCategories()" [value]="sub.id">{{sub.name}}</option>
          </select>
        </div>
        <div class="w-10 flex items-end justify-center pb-2">
            <button *ngIf="selectedCategoryId || selectedSubCategoryId" (click)="clearFilters()" class="text-slate-300 hover:text-red-500 transition-colors" title="Clear Filters">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <div *ngIf="selectedProductIds.size > 0" 
           class="mb-6 p-4 bg-slate-900 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-900/20 animate-slide-up">
        <div class="flex items-center gap-4 px-2">
            <span class="text-white font-black text-xs uppercase tracking-widest">{{ selectedProductIds.size }} Products Selected</span>
        </div>
        <div class="flex items-center gap-3">
            <button (click)="openBulkSizeModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Assign Sizes
            </button>
            <button (click)="openBulkCategoryModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Assign Category
            </button>
            <button (click)="openBulkImageModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Manage Images
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

      <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="pl-6 py-4 w-10">
                    <input type="checkbox" [checked]="isAllSelected()" (change)="toggleSelectAll()"
                           class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer transition-all">
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sizes</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let product of products" class="hover:bg-slate-50/50 transition-colors group" [class.bg-brand-50]="selectedProductIds.has(product.id)">
                <td class="pl-6 py-4">
                    <input type="checkbox" [checked]="selectedProductIds.has(product.id)" (change)="toggleSelection(product.id)"
                           class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer transition-all">
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      <img *ngIf="product.images.length > 0" 
                           [src]="getMainImageUrl(product)" 
                           referrerpolicy="no-referrer"
                           class="w-full h-full object-cover">
                    </div>
                    <div>
                      <div class="font-semibold text-slate-900 line-clamp-1">{{product.title}}</div>
                      <div class="text-xs text-slate-500 font-mono mt-0.5">{{product.categoryName}}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1 max-w-[200px]">
                    <span *ngFor="let s of product.sizes" class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{{s.name}}</span>
                  </div>
                </td>
                <td class="px-6 py-4 font-mono font-bold text-slate-900 text-sm">₺{{product.price | number:'1.2-2'}}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a [routerLink]="['/admin/products/edit', product.id]" class="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all" title="Edit Product">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </a>
                    <button (click)="deleteProduct(product.id)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Product">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Bulk Size Modal -->
    <div *ngIf="showBulkSizeModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
            <div class="p-8 border-b border-slate-100">
                <h3 class="text-2xl font-display font-black text-slate-900">Assign Sizes</h3>
                <p class="text-slate-500 mt-1">Assign selected sizes to {{ selectedProductIds.size }} products.</p>
            </div>
            <div class="p-8 max-h-[400px] overflow-y-auto">
                <div class="grid grid-cols-3 gap-3">
                    <button *ngFor="let size of availableSizes" 
                            type="button"
                            (click)="toggleSizeInBulk(size.id)"
                            [class.bg-slate-900]="selectedSizeIdsForBulk.has(size.id)"
                            [class.text-white]="selectedSizeIdsForBulk.has(size.id)"
                            [class.border-slate-900]="selectedSizeIdsForBulk.has(size.id)"
                            class="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold transition-all hover:border-slate-900 active:scale-95 uppercase">
                        {{ size.name }}
                    </button>
                </div>
            </div>
            <div class="p-6 bg-slate-50 flex items-center justify-between gap-4">
                <button (click)="closeBulkSizeModal()" class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all text-xs uppercase tracking-widest">Cancel</button>
                <button (click)="applyBulkSizes()" 
                        [disabled]="applying"
                        class="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/20 disabled:opacity-30">
                    {{ applying ? 'Applying...' : 'Apply Sizes' }}
                </button>
            </div>
        </div>
    </div>

    <!-- Bulk Image Modal -->
    <app-bulk-edit-images-modal 
        *ngIf="showBulkImageModal"
        [selectedProducts]="getSelectedProducts()"
        (close)="closeBulkImageModal()"
        (deleted)="onImagesDeleted()">
    </app-bulk-edit-images-modal>

    <!-- Bulk Category Modal -->
    <app-bulk-edit-categories-modal 
        *ngIf="showBulkCategoryModal"
        [selectedProductIds]="getSelectedProductIdsArray()"
        (close)="closeBulkCategoryModal()"
        (updated)="onCategoriesUpdated()">
    </app-bulk-edit-categories-modal>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  selectedProductIds = new Set<string>();
  
  showBulkSizeModal = false;
  availableSizes: Size[] = [];
  selectedSizeIdsForBulk = new Set<string>();
  applying = false;

  showBulkImageModal = false;
  showBulkCategoryModal = false;
  
  allCategories: Category[] = [];
  selectedCategoryId: string = '';
  selectedSubCategoryId: string = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.productService.getSizes().subscribe(data => this.availableSizes = data);
    this.categoryService.getCategories().subscribe(data => this.allCategories = data);
  }

  loadProducts() {
    this.productService.getProducts(undefined, this.selectedCategoryId || undefined, this.selectedSubCategoryId || undefined).subscribe(data => {
      this.products = data;
    });
  }

  toggleSelection(id: string) {
    if (this.selectedProductIds.has(id)) {
      this.selectedProductIds.delete(id);
    } else {
      this.selectedProductIds.add(id);
    }
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedProductIds.clear();
    } else {
      this.products.forEach(p => this.selectedProductIds.add(p.id));
    }
  }

  isAllSelected(): boolean {
    return this.products.length > 0 && this.selectedProductIds.size === this.products.length;
  }

  clearSelection() {
    this.selectedProductIds.clear();
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.products = this.products.filter(p => p.id !== id);
        this.selectedProductIds.delete(id);
      });
    }
  }

  bulkDelete() {
    if (confirm(`Are you sure you want to delete ${this.selectedProductIds.size} products?`)) {
      const ids = Array.from(this.selectedProductIds);
      this.productService.bulkDelete(ids).subscribe(() => {
        this.products = this.products.filter(p => !this.selectedProductIds.has(p.id));
        this.selectedProductIds.clear();
      });
    }
  }

  openBulkSizeModal() {
    this.selectedSizeIdsForBulk.clear();
    this.showBulkSizeModal = true;
  }

  closeBulkSizeModal() {
    this.showBulkSizeModal = false;
  }

  toggleSizeInBulk(sizeId: string) {
    if (this.selectedSizeIdsForBulk.has(sizeId)) {
      this.selectedSizeIdsForBulk.delete(sizeId);
    } else {
      this.selectedSizeIdsForBulk.add(sizeId);
    }
  }

  applyBulkSizes() {
    if (this.selectedSizeIdsForBulk.size === 0) {
      alert('Please select at least one size.');
      return;
    }
    
    this.applying = true;
    const productIds = Array.from(this.selectedProductIds);
    const sizeIds = Array.from(this.selectedSizeIdsForBulk);
    
    this.productService.bulkUpdateSizes(productIds, sizeIds).subscribe(() => {
      this.applying = false;
      this.closeBulkSizeModal();
      this.clearSelection();
      this.loadProducts();
    });
  }

  toggleIsFeatured(product: Product) {
    const updatedProduct = { ...product, isFeatured: !product.isFeatured };
    this.productService.updateProduct(product.id, updatedProduct).subscribe(() => {
      product.isFeatured = updatedProduct.isFeatured;
    });
  }

  getMainImageUrl(product: Product): string {
    return this.productService.getMainImageUrl(product);
  }

  openBulkImageModal() {
    this.showBulkImageModal = true;
  }

  closeBulkImageModal() {
    this.showBulkImageModal = false;
  }

  getSelectedProducts(): Product[] {
    return this.products.filter(p => this.selectedProductIds.has(p.id));
  }

  onImagesDeleted() {
    this.loadProducts();
    // Keep selection if products still exist, but refresh their data
  }

  openBulkCategoryModal() {
    this.showBulkCategoryModal = true;
  }

  closeBulkCategoryModal() {
    this.showBulkCategoryModal = false;
  }

  onCategoriesUpdated() {
    this.loadProducts();
    this.clearSelection();
  }

  getSelectedProductIdsArray(): string[] {
    return Array.from(this.selectedProductIds);
  }

  onCategoryChange() {
    this.selectedSubCategoryId = '';
    this.loadProducts();
  }

  onSubCategoryChange() {
    this.loadProducts();
  }

  getSelectedCategorySubCategories(): Category[] {
    const cat = this.allCategories.find(c => c.id === this.selectedCategoryId);
    return cat?.subCategories || [];
  }

  clearFilters() {
    this.selectedCategoryId = '';
    this.selectedSubCategoryId = '';
    this.loadProducts();
  }
}
