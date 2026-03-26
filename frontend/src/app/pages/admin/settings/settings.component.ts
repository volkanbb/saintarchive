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
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-bold text-slate-800">System Settings</h2>
          <p class="text-slate-500">Configure global application parameters.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-8 space-y-8">
          
          <!-- WhatsApp Setting -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-8 border-b border-slate-100" *ngIf="whatsappSetting">
            <div class="space-y-1">
              <h3 class="font-bold text-slate-800">WhatsApp Contact</h3>
              <p class="text-sm text-slate-500">The phone number used for customer inquiries and orders.</p>
            </div>
            <div class="md:col-span-2 space-y-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number (Intl. Format)</label>
                <div class="flex gap-4">
                  <div class="relative flex-1">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">+</span>
                    <input type="text" 
                           [(ngModel)]="whatsappSetting.value"
                           placeholder="e.g. 33612345678"
                           class="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none font-mono">
                  </div>
                  <button (click)="saveSetting(whatsappSetting)" 
                          [disabled]="loading"
                          class="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    {{ loading ? 'Saving...' : 'Save' }}
                  </button>
                </div>
                <p class="text-[10px] text-slate-400">Enter number without +, spaces or special characters.</p>
              </div>
              
              <div *ngIf="successMessage" class="p-3 bg-green-50 text-green-700 text-xs rounded-lg flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                {{ successMessage }}
              </div>
            </div>
          </div>

          <div *ngIf="!whatsappSetting" class="py-20 text-center text-slate-400">
            <div class="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading settings...
          </div>

        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  whatsappSetting: SystemSetting | null = null;
  loading = false;
  successMessage = '';

  constructor(private settingService: SettingService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.settingService.getSettings().subscribe(settings => {
      this.whatsappSetting = settings.find(s => s.key === 'WhatsAppNumber') || null;
    });
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
