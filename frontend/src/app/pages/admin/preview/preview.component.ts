import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportService } from '../../../core/services/import.service';
import { CategoryService } from '../../../core/services/category.service';
import { ImportPreview } from '../../../core/models/import.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in pb-12" *ngIf="preview">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 class="text-3xl font-display font-bold text-slate-900">Review Extraction</h2>
          <p class="text-slate-500 mt-1">Review scraped data, assign categories, and publish to storefront.</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="cancel()" class="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors">Discard</button>
          <button [disabled]="!selectedCategory" (click)="confirm()" class="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center gap-2">
            Publish Product
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <!-- Metadata Form -->
        <div class="xl:col-span-4 space-y-6">
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Basic Details
            </h3>
            
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Product Title</label>
                <input type="text" [(ngModel)]="preview.title" 
                       class="w-full rounded-xl border-slate-300 border bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-medium text-slate-900">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Categorization <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select [(ngModel)]="selectedCategory" 
                          class="w-full appearance-none rounded-xl border-slate-300 border bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-slate-900">
                    <option value="" disabled selected>Select a category folder</option>
                    <option *ngFor="let cat of categories" [value]="cat.id">{{cat.name}}</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Price (TL)</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-slate-400 font-medium">₺</span>
                  <input type="number" [(ngModel)]="price" 
                         class="w-full rounded-xl border-slate-300 border bg-slate-50 pl-10 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-medium text-slate-900"
                         placeholder="0.00">
                </div>
              </div>

              <div class="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <input type="checkbox" [(ngModel)]="isFeatured" id="isFeatured" 
                       class="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500">
                <label for="isFeatured" class="text-sm font-bold text-amber-900 cursor-pointer">
                  Featured Product (Show in Homepage Slider)
                </label>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Detailed Profile (Optional)</label>
                <textarea [(ngModel)]="preview.description" rows="6" 
                          class="w-full rounded-xl border-slate-300 border bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-slate-700 text-sm"></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Media Gallery -->
        <div class="xl:col-span-8">
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Media Curation
              </h3>
              <span class="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{{ preview.images.length }} Extracted Images</span>
            </div>
            
            <div class="bg-slate-50 rounded-2xl p-4 flex-1 border border-slate-100 min-h-[500px] overflow-y-auto custom-scrollbar">
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                
                <div *ngFor="let img of preview.images; let i = index" 
                     class="relative group rounded-xl overflow-hidden aspect-square bg-white shadow-sm border-2 transition-all cursor-pointer"
                     [ngClass]="mainImage === img ? 'border-brand-500 ring-4 ring-brand-50' : 'border-transparent hover:border-slate-300'">
                  
                  <img [src]="getProxyUrl(img)" (error)="onImageError(i)" referrerpolicy="no-referrer" class="w-full h-full object-cover">
                  
                  <!-- Main Image Badge -->
                  <div *ngIf="mainImage === img" class="absolute top-2 left-2 bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm z-10">
                    Primary
                  </div>
                  
                  <!-- Hover Controls overlay -->
                  <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button *ngIf="mainImage !== img" (click)="setMain(img)" class="w-24 bg-white text-slate-900 text-xs font-bold py-1.5 rounded-full hover:bg-brand-50 transition-colors shadow-lg">
                      Set Primary
                    </button>
                    <button (click)="removeImage(i)" class="w-24 bg-red-500 text-white text-xs font-bold py-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg">
                      <svg class="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                </div>

              </div>
              
              <div *ngIf="preview.images.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400">
                <svg class="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p>No images remaining.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #94a3b8;
    }
  `]
})
export class PreviewComponent implements OnInit {
  preview: ImportPreview | null = null;
  categories: Category[] = [];
  selectedCategory = '';
  mainImage = '';
  price: number = 0;
  isFeatured: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private importService: ImportService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.importService.getPreview(id).subscribe(data => {
          this.preview = data;
          if (data.images.length > 0) this.mainImage = data.images[0];
        });
      }
    });
    
    this.categoryService.getCategories().subscribe(res => {
      this.categories = res;
      if (res.length > 0) this.selectedCategory = res[0].id;
    });
  }

  setMain(url: string) {
    this.mainImage = url;
  }

  removeImage(index: number) {
    if (this.preview) {
      this.preview.images.splice(index, 1);
      if (this.mainImage && !this.preview.images.includes(this.mainImage)) {
        this.mainImage = this.preview.images[0] || '';
      }
    }
  }

  cancel() {
    this.router.navigate(['/admin/import']);
  }

  confirm() {
    if (!this.preview || !this.selectedCategory) return;
    
    const request = {
      tempImportId: this.preview.tempImportId,
      title: this.preview.title,
      description: this.preview.description,
      price: this.price,
      categoryId: this.selectedCategory,
      isFeatured: this.isFeatured,
      selectedImages: this.preview.images,
      mainImage: this.mainImage
    };
    
    this.importService.confirmImport(request).subscribe(() => {
      const queue = this.route.snapshot.queryParamMap.get('queue');
      if (queue) {
        const ids = queue.split(',');
        const nextId = ids[0];
        const remaining = ids.slice(1).join(',');
        
        this.router.navigate(['/admin/preview', nextId], { 
          queryParams: remaining ? { queue: remaining } : {} 
        });
      } else {
        this.router.navigate(['/admin/categories']);
      }
    });
  }

  getProxyUrl(url: string | undefined): string {
    return this.importService.getProxyUrl(url);
  }

  onImageError(index: number) {
    if (this.preview) {
      console.warn('Image failed to load, removing from preview:', this.preview.images[index]);
      this.preview.images.splice(index, 1);
      // Update main image if the one we removed was the main one
      if (this.mainImage && !this.preview.images.includes(this.mainImage)) {
        this.mainImage = this.preview.images[0] || '';
      }
    }
  }
}
