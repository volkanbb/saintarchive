import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportService } from '../../../core/services/import.service';
import { CategoryService } from '../../../core/services/category.service';
import { ImportPreview } from '../../../core/models/import.model';
import { Category } from '../../../core/models/category.model';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { concatMap, delay, from, of, catchError, finalize } from 'rxjs';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="animate-fade-in pb-12" *ngIf="preview">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 class="text-3xl font-display font-bold text-slate-900">Review Extraction</h2>
          <p class="text-slate-500 mt-1">Review scraped data, assign categories, and publish to storefront.</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="cancel()" class="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors">Discard</button>
          
          <!-- Individual Publish (Only if no queue) -->
          <button *ngIf="queueIds.length === 0" [disabled]="!selectedCategory || isBulkProcessing" (click)="confirm()" class="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
            Publish Product
          </button>

          <!-- Bulk Publish (If queue exists) -->
          <button *ngIf="queueIds.length > 0" [disabled]="!selectedCategory || isBulkProcessing" (click)="startBulkPublish()" class="px-8 py-2.5 rounded-xl bg-[#c5a059] text-black font-black uppercase tracking-widest text-[11px] hover:bg-[#d4b476] shadow-xl shadow-[#c5a059]/30 transition-all disabled:opacity-30 disabled:grayscale flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Start Bulk Publish
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <!-- Metadata Form -->
        <div class="xl:col-span-4 space-y-6">
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Standard Metadata
            </h3>
            
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Product Title</label>
                <input type="text" [(ngModel)]="preview.title" 
                       class="w-full rounded-xl border-slate-300 border bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-medium text-slate-900">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Categorization <span class="text-red-500">*</span></label>
                <div class="space-y-4">
                  <div class="relative">
                    <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()"
                            class="w-full appearance-none rounded-xl border-slate-300 border bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-slate-900 font-bold">
                      <option value="" disabled selected>Select a category folder</option>
                      <option *ngFor="let cat of categories" [value]="cat.id">{{cat.name}}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  <div class="relative" *ngIf="subCategories.length > 0">
                    <select [(ngModel)]="selectedSubCategory" 
                            class="w-full appearance-none rounded-xl border-slate-300 border bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-slate-900">
                      <option value="" selected>Select sub-category (Optional)</option>
                      <option *ngFor="let sub of subCategories" [value]="sub.id">{{sub.name}}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Price (TL)</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-slate-400 font-medium">₺</span>
                  <input type="number" [(ngModel)]="price" 
                         class="w-full rounded-xl border-slate-300 border bg-slate-50 pl-10 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-bold text-slate-900"
                         placeholder="0.00">
                </div>
              </div>

              <div class="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <input type="checkbox" [(ngModel)]="isFeatured" id="isFeatured" 
                       class="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500">
                <label for="isFeatured" class="text-sm font-bold text-amber-900 cursor-pointer">
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          <!-- Bulk Actions Info Card -->
          <div class="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-900/20 text-white border border-white/5" *ngIf="queueIds.length > 0">
            <h3 class="text-lg font-bold flex items-center gap-2 mb-2">
              <span class="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              Auto-Publish System
            </h3>
            <p class="text-white/60 text-xs">Ready to process all {{ queueIds.length + 1 }} items in the current batch automatically.</p>
            <div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
               <span class="text-[10px] text-white/30 font-bold uppercase tracking-widest">Est. Time</span>
               <span class="text-[10px] text-[#c5a059] font-black uppercase tracking-widest">{{ (queueIds.length + 1) * 2 }} SECONDS</span>
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
              <div class="flex flex-col gap-4" cdkDropList (cdkDropListDropped)="onDrop($event)">
                <div *ngFor="let img of preview.images; let i = index" 
                     cdkDrag
                     class="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 group transition-all animate-slide-up shadow-sm">
                  
                  <div class="cursor-move text-slate-300 hover:text-slate-600 transition-colors" cdkDragHandle>
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </div>

                  <div class="w-20 h-20 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm relative">
                     <img [src]="getProxyUrl(img)" (error)="onImageError(i)" referrerpolicy="no-referrer" class="w-full h-full object-cover">
                     <div *ngIf="mainImage === img" class="absolute top-1 left-1 bg-brand-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">PRIMARY</div>
                  </div>

                  <div class="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p class="text-[10px] text-slate-400 font-mono truncate max-w-[150px] sm:max-w-[300px]">{{ img }}</p>
                      <div class="mt-2 flex items-center gap-3">
                        <button *ngIf="mainImage !== img" (click)="setMain(img)" 
                                class="text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-widest transition-colors">Set Primary</button>
                        <span *ngIf="mainImage === img" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cover Image</span>
                      </div>
                    </div>
                    <button (click)="removeImage(i)" 
                            class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-end sm:self-center">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div *cdkDragPlaceholder class="h-24 bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bulk Processing Overlay -->
      <div *ngIf="isBulkProcessing" class="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-8 overflow-hidden">
        <div class="max-w-xl w-full text-center animate-zoom-in">
          <div class="mb-12 relative">
             <div class="w-32 h-32 mx-auto rounded-full border-4 border-white/5 flex items-center justify-center">
                <div class="absolute inset-0 border-4 border-t-[#c5a059] rounded-full animate-spin"></div>
                <span class="text-3xl font-display font-black text-white">{{ Math.round((bulkCurrent / bulkTotal) * 100) }}%</span>
             </div>
          </div>
          
          <h2 class="text-4xl font-display font-black text-white mb-2 uppercase tracking-tighter">Publishing Catalog</h2>
          <p class="text-[#c5a059] font-bold text-sm tracking-[0.3em] uppercase mb-8">Item {{ bulkCurrent }} of {{ bulkTotal }}</p>
          
          <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-6">
            <div class="h-full bg-[#c5a059] transition-all duration-500 shadow-[0_0_20px_rgba(197,160,89,0.5)]" 
                 [style.width.%]="(bulkCurrent / bulkTotal) * 100"></div>
          </div>
          
          <div class="p-6 bg-white/5 rounded-3xl border border-white/10 text-left">
            <p class="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Currently Processing:</p>
            <p class="text-white font-medium line-clamp-1 truncate">{{ currentProcessingTitle }}</p>
          </div>

          <p class="mt-8 text-white/30 text-xs italic">Do not close this tab. The system is adding 2s delay between items to avoid Cloudflare blocks.</p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
    .animate-zoom-in { animation: zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class PreviewComponent implements OnInit {
  preview: ImportPreview | null = null;
  categories: Category[] = [];
  subCategories: Category[] = [];
  selectedCategory = '';
  selectedSubCategory = '';
  mainImage = '';
  price: number = 0;
  isFeatured: boolean = false;
  queueIds: string[] = [];
  
  // Bulk Tracking
  isBulkProcessing = false;
  bulkTotal = 0;
  bulkCurrent = 0;
  currentProcessingTitle = '';
  Math = Math;

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
        this.loadPreview(id);
      }
    });

    this.route.queryParamMap.subscribe(queryParams => {
      const queue = queryParams.get('queue');
      this.queueIds = queue ? queue.split(',').filter(x => !!x) : [];
    });
    
    this.categoryService.getCategories().subscribe(res => {
      this.categories = res;
      if (res.length > 0) {
        this.selectedCategory = res[0].id;
        this.onCategoryChange();
      }
    });
  }

  loadPreview(id: string) {
    this.importService.getPreview(id).subscribe(data => {
      this.preview = data;
      if (data.images.length > 0) {
        this.mainImage = data.images[0];
        // Pre-fill price if it was previously set (optional, keep 0 for new)
      }
    });
  }

  onCategoryChange() {
    const category = this.categories.find(c => c.id === this.selectedCategory);
    this.subCategories = category?.subCategories || [];
    this.selectedSubCategory = '';
  }

  onDrop(event: CdkDragDrop<string[]>) {
    if (this.preview) {
      moveItemInArray(this.preview.images, event.previousIndex, event.currentIndex);
    }
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
    
    const request = this.createRequest(this.preview);
    this.importService.confirmImport(request).subscribe(() => {
      this.goToNext();
    });
  }

  private createRequest(data: ImportPreview) {
    return {
      tempImportId: data.tempImportId,
      title: data.title,
      description: data.description,
      price: this.price,
      categoryId: this.selectedCategory,
      subCategoryId: this.selectedSubCategory || null,
      isFeatured: this.isFeatured,
      selectedImages: data.images,
      mainImage: data.tempImportId === this.preview?.tempImportId ? this.mainImage : (data.images[0] || '')
    };
  }

  private goToNext() {
    if (this.queueIds.length > 0) {
      const nextId = this.queueIds[0];
      const remaining = this.queueIds.slice(1).join(',');
      
      this.router.navigate(['/admin/preview', nextId], { 
        queryParams: remaining ? { queue: remaining } : {} 
      });
    } else {
      this.router.navigate(['/admin/categories']);
    }
  }

  startBulkPublish() {
    if (!this.preview || !this.selectedCategory) return;
    
    const allIds = [this.preview.tempImportId, ...this.queueIds];
    this.bulkTotal = allIds.length;
    this.bulkCurrent = 0;
    this.isBulkProcessing = true;

    from(allIds).pipe(
      concatMap(id => {
        // Step 1: Get Preview (for data)
        return this.importService.getPreview(id).pipe(
          concatMap(data => {
            this.bulkCurrent++;
            this.currentProcessingTitle = data.title;
            const request = this.createRequest(data);
            return this.importService.confirmImport(request);
          }),
          // Step 2: Mandatory Delay to avoid Cloudflare/Server blocks
          delay(2000), 
          catchError(err => {
            console.error('Failed to publish item:', id, err);
            return of(null); // Continue with next item even if one fails
          })
        );
      }),
      finalize(() => {
        this.isBulkProcessing = false;
        this.router.navigate(['/admin/products']);
      })
    ).subscribe();
  }

  getProxyUrl(url: string | undefined): string {
    return this.importService.getProxyUrl(url);
  }

  onImageError(index: number) {
    if (this.preview) {
      this.preview.images.splice(index, 1);
      if (this.mainImage && !this.preview.images.includes(this.mainImage)) {
        this.mainImage = this.preview.images[0] || '';
      }
    }
  }
}
