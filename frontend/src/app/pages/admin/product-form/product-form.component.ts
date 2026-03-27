import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { Product, Size } from '../../../core/models/product.model';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, DragDropModule],
  template: `
    <div class="animate-fade-in max-w-4xl mx-auto pb-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-display font-bold text-slate-900">{{ isEdit ? 'Edit Product' : 'Add New Product' }}</h2>
          <p class="text-slate-500 mt-1">{{ isEdit ? 'Update details for ' + productTitle : 'Create a new product entry manually.' }}</p>
        </div>
        <a routerLink="/admin/products" class="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to List
        </a>
      </div>

      <!-- Quick Fetch from Yupoo -->
      <div *ngIf="!isEdit" class="mb-10 p-6 bg-slate-100/50 border border-slate-200 border-dashed rounded-[2rem] animate-fade-in">
        <div class="flex flex-col md:flex-row items-end gap-6">
          <div class="flex-1 space-y-2">
            <label class="text-[10px] font-black tracking-widest text-slate-400 uppercase">⚡ Quick Fetch from Yupoo</label>
            <div class="relative">
              <input type="text" [(ngModel)]="yupooUrl" placeholder="Enter Yupoo album URL (https://...)" 
                     class="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-brand-500 shadow-sm transition-all outline-none">
              <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" /></svg>
              </div>
            </div>
          </div>
          <button type="button" (click)="fetchFromYupoo()" [disabled]="fetching || !yupooUrl"
                  class="px-8 py-4 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 font-black text-xs tracking-widest hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase flex items-center gap-3">
            <span *ngIf="fetching" class="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
            {{ fetching ? 'Fetching Media...' : 'Magic Fetch' }}
          </button>
        </div>
        <p class="text-xs text-slate-400 mt-3 ml-1 italic">Automatically fills title and high-res images from any Yupoo album link.</p>
      </div>

      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-8">
        <!-- Basic Info Section -->
        <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2 col-span-2 md:col-span-1">
              <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Product Title</label>
              <input type="text" formControlName="title" placeholder="e.g. Nike x Nocta Tech Fleece Jacket"
                     class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none">
            </div>
            
            <div class="space-y-2 col-span-2 md:col-span-1">
              <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
              <select formControlName="categoryId" (change)="onCategoryChange()"
                      class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none appearance-none">
                <option value="">Select Category</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{cat.name}}</option>
              </select>
            </div>

            <div class="space-y-2 col-span-2 md:col-span-1" *ngIf="filteredSubCategories.length > 0">
              <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Sub-category</label>
              <select formControlName="subCategoryId" 
                      class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none appearance-none">
                <option [value]="null">Select Sub-category (Optional)</option>
                <option *ngFor="let sub of filteredSubCategories" [value]="sub.id">{{sub.name}}</option>
              </select>
            </div>

            <div class="space-y-2 col-span-2 md:col-span-1">
              <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Price (₺)</label>
              <input type="number" formControlName="price" placeholder="0.00"
                     class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-mono">
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</label>
            <textarea formControlName="description" rows="5" placeholder="Detailed product description..."
                      class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none resize-none"></textarea>
          </div>
        </div>

        <!-- Sizes Section -->
        <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h3 class="text-lg font-bold text-slate-900 mb-6">Available Sizes</h3>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <button *ngFor="let size of availableSizes" 
                        type="button"
                        (click)="toggleSize(size)"
                        [class.bg-slate-900]="isSizeSelected(size.id)"
                        [class.text-white]="isSizeSelected(size.id)"
                        [class.border-slate-900]="isSizeSelected(size.id)"
                        class="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold transition-all hover:border-slate-900 active:scale-95 uppercase tracking-widest">
                    {{ size.name }}
                </button>
            </div>
            <p class="text-xs text-slate-400 mt-4 italic">Select the sizes available for this specific product.</p>
        </div>

        <!-- Images Section -->
        <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-slate-900">Product Images</h3>
              <p class="text-xs text-slate-500 mt-0.5">Drag to reorder. Add image URLs and select one as primary (Main).</p>
            </div>
            <button type="button" (click)="addImage()" 
                    class="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              Add Image
            </button>
          </div>

          <div formArrayName="images" class="space-y-4" cdkDropList (cdkDropListDropped)="onDrop($event)">
            <div *ngFor="let img of images.controls; let i=index" [formGroupName]="i" 
                 cdkDrag
                 class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all animate-slide-up bg-white">
              
              <!-- Drag Handle -->
              <div class="cursor-move text-slate-300 hover:text-slate-600 transition-colors" cdkDragHandle>
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>

              <!-- Preview -->
              <div class="w-20 h-20 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm relative">
                 <img *ngIf="img.get('url')?.value" [src]="getProxyUrl(img.get('url')?.value)" 
                      (error)="onImageError(i)"
                      referrerpolicy="no-referrer"
                      class="w-full h-full object-cover">
                 <div *ngIf="!img.get('url')?.value" class="w-full h-full flex items-center justify-center text-slate-300">
                   <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 </div>
                 
                 <!-- Main Image Indicator -->
                 <div *ngIf="img.get('isMain')?.value" class="absolute top-1 left-1 bg-brand-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                   MAIN
                 </div>
              </div>

              <div class="flex-1 space-y-3">
                <input type="text" formControlName="url" placeholder="Yupoo or Image URL"
                       class="w-full px-4 py-2 text-sm rounded-lg bg-white border border-slate-200 focus:border-brand-500 outline-none transition-all">
                
                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2 cursor-pointer group/label">
                    <input type="radio" [value]="true" formControlName="isMain" (change)="onMainChange(i)"
                           class="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500">
                    <span class="text-xs font-semibold text-slate-600 group-hover/label:text-slate-900 transition-colors uppercase tracking-tight">Primary Cover</span>
                  </label>
                </div>
              </div>

              <button type="button" (click)="removeImage(i)" 
                       class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>

              <!-- Drag Preview -->
              <div *cdkDragPlaceholder class="h-24 bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl"></div>
            </div>
          </div>

          <div *ngIf="images.length === 0" class="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl mt-4">
             No images added yet. Click "Add Image" to begin.
          </div>
        </div>

        <!-- Submit -->
        <div class="flex items-center justify-end gap-4 pt-4">
          <button type="button" routerLink="/admin/products" 
                  class="px-8 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button type="submit" [disabled]="productForm.invalid || loading"
                  class="px-10 py-3 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-600/30 transition-all flex items-center gap-2">
            <span *ngIf="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isEdit ? 'Save Changes' : 'Publish Product' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  filteredSubCategories: Category[] = [];
  isEdit = false;
  productId: string | null = null;
  productTitle = '';
  loading = false;
  availableSizes: Size[] = [];
  selectedSizes: Size[] = [];
  
  // Yupoo Fetching
  yupooUrl = '';
  fetching = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      subCategoryId: [null],
      sizes: [[]],
      images: this.fb.array([])
    });
  }

  get images() {
    return this.productForm.get('images') as FormArray;
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
      if (this.isEdit && this.productForm.get('categoryId')?.value) {
        this.onCategoryChange(false);
      }
    });

    this.productService.getSizes().subscribe(data => {
        this.availableSizes = data;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.productId = id;
      this.loadProduct(id);
    } else {
      // Add one empty image for convenience
      this.addImage(true);
    }
  }

  fetchFromYupoo() {
    if (!this.yupooUrl || !this.yupooUrl.includes('yupoo.com')) {
      alert('Please enter a valid Yupoo album URL.');
      return;
    }

    this.fetching = true;
    this.productService.scrapeYupooAlbum(this.yupooUrl).subscribe({
      next: (data) => {
        this.productForm.patchValue({
          title: data.title,
          description: data.description || ''
        });

        // Clear existing images and add new ones
        this.images.clear();
        data.imageUrls.forEach((url, index) => {
          this.images.push(this.fb.group({
            url: [url, Validators.required],
            isMain: [index === 0]
          }));
        });

        this.fetching = false;
        this.yupooUrl = ''; // Clear after success
      },
      error: (err) => {
        this.fetching = false;
        console.error('Fetch failed', err);
        alert(err.error || 'Failed to fetch product data from Yupoo.');
      }
    });
  }

  onCategoryChange(resetSub = true) {
    const categoryId = this.productForm.get('categoryId')?.value;
    const category = this.categories.find(c => c.id === categoryId);
    this.filteredSubCategories = category?.subCategories || [];
    
    if (resetSub) {
      this.productForm.get('subCategoryId')?.setValue(null);
    }
  }

  loadProduct(id: string) {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.productTitle = product.title;
        this.productForm.patchValue({
          title: product.title,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId,
          sizes: product.sizes || []
        });

        this.selectedSizes = product.sizes || [];

        if (this.categories.length > 0) {
          this.onCategoryChange(false);
        }

        // Clear default image and add actual images
        this.images.clear();
        product.images.forEach(img => {
          this.images.push(this.fb.group({
            url: [img.url, Validators.required],
            isMain: [img.isMain]
          }));
        });
        this.loading = false;
      },
      error: () => {
        alert('Could not load product');
        this.router.navigate(['/admin/products']);
      }
    });
  }

  addImage(isMain = false) {
    this.images.push(this.fb.group({
      url: ['', Validators.required],
      isMain: [isMain]
    }));
  }

  onDrop(event: CdkDragDrop<any>) {
    const from = event.previousIndex;
    const to = event.currentIndex;

    if (from === to) return;

    const control = this.images.at(from);
    this.images.removeAt(from);
    this.images.insert(to, control);
  }

  removeImage(index: number) {
    this.images.removeAt(index);
  }

  onMainChange(index: number) {
    // Unset other images
    for (let i = 0; i < this.images.length; i++) {
       if (i !== index) {
         this.images.at(i).get('isMain')?.setValue(false, { emitEvent: false });
       }
    }
  }

  getProxyUrl(url: string | undefined): string {
    return this.productService.getProxyUrl(url);
  }

  isSizeSelected(sizeId: string): boolean {
    return this.selectedSizes.some(s => s.id === sizeId);
  }

  toggleSize(size: Size) {
    const index = this.selectedSizes.findIndex(s => s.id === size.id);
    if (index > -1) {
      this.selectedSizes.splice(index, 1);
    } else {
      this.selectedSizes.push(size);
    }
    this.productForm.patchValue({ sizes: this.selectedSizes });
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.loading = true;
    const productData = this.productForm.value;

    if (this.isEdit && this.productId) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: () => {
          alert('Product updated successfully');
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.loading = false;
          alert('Error updating product');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          alert('Product created successfully');
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.loading = false;
          alert('Error creating product');
        }
      });
    }
  }

  onImageError(index: number) {
    console.warn('Manual image failed to load, removing:', this.images.at(index).get('url')?.value);
    this.images.removeAt(index);
  }
}
