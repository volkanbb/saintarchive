import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SettingService } from '../../../core/services/setting.service';
import { SystemSetting } from '../../../core/models/system-setting.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-black text-white py-24 px-6 md:px-12 animate-fade-in">
      <div class="max-w-4xl mx-auto">
        <!-- Breadcrumb / Label -->
        <div class="flex items-center gap-4 mb-8 opacity-50 font-black text-[10px] tracking-[0.3em] uppercase">
          <span class="w-12 h-[1px] bg-white"></span>
          KURUMSAL / {{ pageTitle }}
        </div>

        <!-- Header -->
        <div class="mb-16">
          <h1 class="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-tight">
            {{ pageTitle }}
          </h1>
          <div class="mt-8 w-24 h-1 bg-brand-500"></div>
        </div>

        <!-- Content Area -->
        <div class="prose prose-invert prose-brand max-w-none">
          <div class="bg-[#0A0A0A] border border-white/5 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px]"></div>
            
            <div class="relative z-10 text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap text-lg">
              {{ content }}
            </div>

            <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 grayscale opacity-20">
               <div class="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
               <p class="text-[10px] font-bold tracking-widest uppercase">Yükleniyor...</p>
            </div>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="mt-20 flex justify-center">
            <a routerLink="/" class="group flex items-center gap-4 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-all">
                <svg class="w-4 h-4 transition-transform group-hover:-translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                ARŞİVE DÖN
            </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: black; }
    .font-display { font-family: 'Outfit', sans-serif; }
  `]
})
export class InfoPageComponent implements OnInit, OnDestroy {
  pageTitle = '';
  content = '';
  loading = true;
  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private settingService: SettingService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.data.subscribe(data => {
      const settingKey = data['settingKey'];
      this.pageTitle = data['title'];
      this.loadContent(settingKey);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadContent(key: string) {
    this.loading = true;
    this.settingService.getSettings().subscribe({
      next: (settings) => {
        const setting = settings.find(s => s.key === key);
        this.content = setting?.value || 'İçerik bulunamadı.';
        this.loading = false;
      },
      error: () => {
        this.content = 'İçerik yüklenirken bir hata oluştu.';
        this.loading = false;
      }
    });
  }
}
