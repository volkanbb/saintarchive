import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImportService } from '../../../core/services/import.service';
import { interval, switchMap, takeWhile, tap } from 'rxjs';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto animate-fade-in">
      <div class="mb-8 text-center sm:text-left">
        <h2 class="text-3xl font-display font-bold text-slate-900">Yupoo Automation Engine</h2>
        <p class="text-slate-500 mt-2 text-lg">Paste an authenticated Yupoo product link to automatically extract high-resolution media and metadata.</p>
      </div>
      
      <div class="bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden">
        
        <!-- Abstract Decoration -->
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-60"></div>

        <div class="relative z-10">
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-800 mb-2">Target URL</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <input type="url" [(ngModel)]="url" 
                     placeholder="https://goat-official222.x.yupoo.com/categories/..." 
                     class="block w-full pl-11 pr-4 py-4 border-slate-200 border rounded-2xl bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-base shadow-sm">
            </div>
            <p class="text-xs text-slate-400 mt-2 ml-1">Example: https://x.yupoo.com/photos/vendor/albums/12345</p>
          </div>
          
          <div *ngIf="loading" class="mb-6 bg-brand-50 border border-brand-100 rounded-xl p-4 flex flex-col gap-3 animate-fade-in">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <svg class="w-5 h-5 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-brand-900">{{progressMessage || 'Initializing Scraping Protocol...'}}</p>
                <p class="text-xs text-brand-700 mt-0.5">Contacting Yupoo servers and pulling media. This avoids Cloudflare timeouts.</p>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div *ngIf="progressCount > 0 || totalCount > 0" class="w-full bg-brand-200/50 rounded-full h-2 overflow-hidden mt-1">
              <div class="bg-brand-600 h-full transition-all duration-500" 
                   [style.width.%]="totalCount > 0 ? (progressCount / totalCount * 100) : 10"></div>
            </div>
            <div *ngIf="totalCount > 0" class="flex justify-between text-[10px] font-bold text-brand-700 uppercase tracking-wider">
               <span>Extracted {{progressCount}} items</span>
               <span>Total: {{totalCount}}</span>
            </div>
          </div>
          
          <div *ngIf="error" class="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div class="mt-1">
              <p class="text-sm font-semibold text-red-900">Extraction Failed</p>
              <p class="text-xs text-red-700 mt-0.5">{{error}}</p>
            </div>
          </div>
          
          <button [disabled]="!url || loading" (click)="startImport()" 
                  class="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span *ngIf="!loading">Launch Extraction</span>
            <span *ngIf="loading">Processing...</span>
            <svg *ngIf="!loading" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ImportComponent {
  url = '';
  loading = false;
  error = '';
  progressMessage = '';
  progressCount = 0;
  totalCount = 0;

  constructor(private importService: ImportService, private router: Router) {}

  startImport() {
    if (!this.url) return;
    this.loading = true;
    this.error = '';
    this.progressMessage = 'Creating extraction task...';
    this.progressCount = 0;
    this.totalCount = 0;

    this.importService.previewImport(this.url).subscribe({
      next: (res: any) => {
        const taskId = res.taskId;
        
        // Start polling
        interval(2000).pipe(
          switchMap(() => this.importService.getTaskStatus(taskId)),
          tap(status => {
            this.progressCount = status.processedAlbums;
            this.totalCount = status.totalAlbums;
            
            if (status.status === 'Processing') {
              this.progressMessage = `Extracting product info (${this.progressCount}/${this.totalCount})...`;
            } else if (status.status === 'Completed') {
              this.progressMessage = 'Extraction complete! Redirecting...';
            } else if (status.status === 'Failed') {
              this.error = status.errorMessage || 'Extraction failed unexpectedly.';
              this.loading = false;
            }
          }),
          takeWhile(status => status.status === 'Pending' || status.status === 'Processing', true)
        ).subscribe({
          complete: () => {
            this.importService.getTaskStatus(taskId).subscribe(finalStatus => {
              if (finalStatus.status === 'Completed' && finalStatus.previewIds?.length > 0) {
                const ids = finalStatus.previewIds;
                this.router.navigate(['/admin/preview', ids[0]], { 
                  queryParams: { queue: ids.slice(1).join(',') } 
                });
              } else if (finalStatus.status === 'Completed') {
                this.error = 'No items were successfully extracted from the target URL.';
                this.loading = false;
              }
            });
          }
        });
      },
      error: (err) => {
        this.error = typeof err.error === 'string' ? err.error : (err.message || 'Unable to establish connection or scrape data.');
        this.loading = false;
      }
    });
  }
}
