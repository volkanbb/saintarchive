import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Size } from '../../../core/models/product.model';

@Component({
  selector: 'app-size-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in pb-20">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-display font-bold text-slate-900">Manage Sizes</h2>
          <p class="text-slate-500 mt-1">Add or remove product size options available in the archive.</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Add New Size -->
        <div class="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
          <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Add New Size</h3>
          <form (submit)="addSize()" class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Size Name</label>
              <input [(ngModel)]="newSizeName" 
                     name="name"
                     placeholder="e.g. XL or 44"
                     class="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-brand-500 transition-all">
            </div>
            <button type="submit" 
                    [disabled]="!newSizeName.trim() || isSubmitting"
                    class="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/20 disabled:opacity-30">
              {{ isSubmitting ? 'Adding...' : 'Add Size Option' }}
            </button>
          </form>
        </div>

        <!-- Existing Sizes -->
        <div class="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Active Size Options</h3>
          
          <div *ngIf="sizes.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p class="text-slate-400 text-sm font-medium">No sizes configured yet.</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div *ngFor="let size of sizes" 
                 class="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all">
              <span class="text-sm font-black text-slate-900 uppercase tracking-widest">{{size.name}}</span>
              <button (click)="deleteSize(size)" 
                      class="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                      title="Delete">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SizeManagementComponent implements OnInit {
  sizes: Size[] = [];
  newSizeName: string = '';
  isSubmitting: boolean = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadSizes();
  }

  loadSizes() {
    this.productService.getSizes().subscribe(data => {
      this.sizes = data;
    });
  }

  addSize() {
    if (!this.newSizeName.trim()) return;
    
    this.isSubmitting = true;
    this.productService.addSize(this.newSizeName.trim()).subscribe({
      next: (size) => {
        this.sizes.push(size);
        this.sizes.sort((a,b) => a.name.localeCompare(b.name));
        this.newSizeName = '';
        this.isSubmitting = false;
      },
      error: (err) => {
        alert(err.error || 'Error adding size');
        this.isSubmitting = false;
      }
    });
  }

  deleteSize(size: Size) {
    if (confirm(`Are you sure you want to delete size "${size.name}"? This will only work if the size is not assigned to any products.`)) {
      this.productService.deleteSize(size.id).subscribe({
        next: () => {
          this.sizes = this.sizes.filter(s => s.id !== size.id);
        },
        error: (err) => {
          alert(err.error || 'Error deleting size. It might be in use.');
        }
      });
    }
  }
}
