import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { SystemSetting } from '../../../core/models/system-setting.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-12 pb-24 animate-fade-in">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-4xl font-display font-black text-slate-900 tracking-tight uppercase">System Settings</h2>
          <p class="text-slate-500 mt-2 font-medium">Configure your store's global identity and contact channels.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8">
        <!-- Communication & Socials -->
        <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-10 space-y-12">
            
            <!-- WhatsApp -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start pb-10 border-b border-slate-100" *ngIf="getSetting('WhatsAppNumber') as s">
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-slate-900">WhatsApp Contact</h3>
                <p class="text-sm text-slate-500 leading-relaxed">The primary number for customer support and order inquiries.</p>
              </div>
              <div class="lg:col-span-2 space-y-4">
                <div class="flex gap-4">
                  <div class="relative flex-1 group">
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+</span>
                    <input type="text" [(ngModel)]="s.value" placeholder="e.g. 33612345678"
                           class="w-full pl-10 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-mono text-sm">
                  </div>
                  <button (click)="saveSetting(s)" [disabled]="loading"
                          class="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all active:scale-95 disabled:opacity-30">
                    SAVE
                  </button>
                </div>
                <p class="text-[10px] text-slate-400 tracking-wide uppercase font-bold">International format, no spaces or + sign.</p>
              </div>
            </div>

            <!-- Email -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start pb-10 border-b border-slate-100">
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-slate-900">Store Info</h3>
                <p class="text-sm text-slate-500 leading-relaxed">Public contact details displayed on your storefront.</p>
              </div>
              <div class="lg:col-span-2 space-y-8">
                <div class="space-y-4" *ngIf="getSetting('ContactEmail') as s">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Email</label>
                    <div class="flex gap-4">
                        <input type="email" [(ngModel)]="s.value" placeholder="e.g. info@saintarchive.com.tr"
                               class="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none transition-all text-sm">
                        <button (click)="saveSetting(s)" class="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                    </div>
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-slate-900">Social Presence</h3>
                <p class="text-sm text-slate-500 leading-relaxed">Direct links to your brand's social media profiles.</p>
              </div>
              <div class="lg:col-span-2 space-y-8">
                <div class="space-y-4" *ngIf="getSetting('InstagramUrl') as s">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Instagram Profile URL</label>
                    <div class="flex gap-4">
                        <input type="text" [(ngModel)]="s.value" placeholder="https://instagram.com/..."
                               class="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none transition-all text-sm">
                        <button (click)="saveSetting(s)" class="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                    </div>
                </div>
                <div class="space-y-4" *ngIf="getSetting('TikTokUrl') as s">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">TikTok Profile URL</label>
                    <div class="flex gap-4">
                        <input type="text" [(ngModel)]="s.value" placeholder="https://tiktok.com/@..."
                               class="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none transition-all text-sm">
                        <button (click)="saveSetting(s)" class="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                    </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Legal & Info Content -->
        <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-10 space-y-12">
            <div class="space-y-2">
              <h3 class="text-lg font-bold text-slate-900">Legal & Informational Pages</h3>
              <p class="text-sm text-slate-500 leading-relaxed">Long-form content for your footer pages (Privacy, Terms, Shipping).</p>
            </div>

            <div class="grid grid-cols-1 gap-12">
              <!-- Privacy Policy -->
              <div class="space-y-4" *ngIf="getSetting('PrivacyPolicy') as s">
                <div class="flex items-center justify-between">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gizlilik Politikası (Privacy Policy)</label>
                  <button (click)="saveSetting(s)" class="text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-widest">SAVE CHANGES</button>
                </div>
                <textarea [(ngModel)]="s.value" rows="6" 
                          class="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none transition-all text-sm resize-none"
                          placeholder="Gizlilik politikası metnini buraya girin..."></textarea>
              </div>

              <!-- Terms -->
              <div class="space-y-4" *ngIf="getSetting('TermsAndConditions') as s">
                <div class="flex items-center justify-between">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kullanım Şartları (Terms & Conditions)</label>
                  <button (click)="saveSetting(s)" class="text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-widest">SAVE CHANGES</button>
                </div>
                <textarea [(ngModel)]="s.value" rows="6" 
                          class="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none transition-all text-sm resize-none"
                          placeholder="Kullanım şartları metnini buraya girin..."></textarea>
              </div>

              <!-- Shipping -->
              <div class="space-y-4" *ngIf="getSetting('ShippingInfo') as s">
                <div class="flex items-center justify-between">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kargo ve Teslimat (Shipping Info)</label>
                  <button (click)="saveSetting(s)" class="text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-widest">SAVE CHANGES</button>
                </div>
                <textarea [(ngModel)]="s.value" rows="6" 
                          class="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none transition-all text-sm resize-none"
                          placeholder="Kargo ve teslimat bilgilerini buraya girin..."></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Notification Toast -->
      <div *ngIf="successMessage" class="fixed bottom-10 right-10 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up z-50">
        <div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <span class="text-sm font-bold tracking-tight uppercase">{{ successMessage }}</span>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  settings: SystemSetting[] = [];
  loading = false;
  successMessage = '';

  constructor(private settingService: SettingService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.settingService.getSettings().subscribe(data => {
      this.settings = data;
    });
  }

  getSetting(key: string): SystemSetting | undefined {
    return this.settings.find(s => s.key === key);
  }

  saveSetting(setting: SystemSetting) {
    this.loading = true;
    this.successMessage = '';
    this.settingService.updateSetting(setting.key, { value: setting.value }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Setting updated successfully.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.loading = false;
        alert('Failed to update setting.');
      }
    });
  }
}
