import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingService } from '../../../core/services/setting.service';
import { SystemSetting } from '../../../core/models/system-setting.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-black text-white py-24 px-6 md:px-12 animate-fade-in">
      <div class="max-w-6xl mx-auto">
        <!-- Breadcrumb / Label -->
        <div class="flex items-center gap-4 mb-8 opacity-50 font-black text-[10px] tracking-[0.3em] uppercase">
          <span class="w-12 h-[1px] bg-white"></span>
          GET IN TOUCH
        </div>

        <!-- Main Header -->
        <div class="mb-20">
          <h1 class="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase leading-[0.85]">
            SAINT <br> 
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">ARCHIVE</span>
          </h1>
          <p class="mt-6 text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
            Direct channels to our support team and social ecosystem. Explore our archive and connect with us globally.
          </p>
        </div>

        <!-- Contact Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          
          <!-- WhatsApp Card -->
          <a [href]="'https://wa.me/' + getSettingValue('WhatsAppNumber')" target="_blank"
             class="group relative bg-[#0A0A0A] border border-white/5 p-10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-brand-500/50 hover:shadow-[0_0_50px_rgba(180,150,80,0.1)]">
            <div class="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-[80px] group-hover:bg-brand-500/20 transition-all"></div>
            
            <div class="flex flex-col h-full justify-between gap-12 relative z-10">
              <div class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <svg class="w-6 h-6 text-brand-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold mb-2">WHATSAPP</h2>
                <p class="text-sm text-slate-500 font-medium">Direct orders & inquiries.</p>
                <div class="mt-6 flex items-center gap-2 text-brand-400 font-black text-[10px] tracking-widest uppercase group-hover:gap-4 transition-all">
                  CHAT NOW <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </div>
          </a>

          <!-- Instagram Card -->
          <a [href]="getSettingValue('InstagramUrl')" target="_blank"
             class="group relative bg-[#0A0A0A] border border-white/5 p-10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-pink-500/50 hover:shadow-[0_0_50px_rgba(236,72,153,0.1)]">
            <div class="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[80px] group-hover:bg-pink-500/20 transition-all"></div>
            
            <div class="flex flex-col h-full justify-between gap-12 relative z-10">
              <div class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <svg class="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.136.07 1.99.307 2.486.695.635.49 1.08.96 1.407 1.635.327.675.565 1.53.635 2.666.058 1.136.07 1.516.07 4.85s-.012 3.584-.07 4.85c-.07 1.136-.307 1.99-.695 2.486-.49.635-.96 1.08-1.635 1.407-.675.327-1.53.565-2.666.635-1.136.058-1.516.07-4.85.07s-3.584-.012-4.85-.07c-1.136-.07-1.99-.307-2.486-.695-.635-.49-1.08-.96-1.407-1.635-.327-.675-.565-1.53-.635-2.666C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.07-1.136.307-1.99.695-2.486.49-.635.96-1.08 1.635-1.407.675-.327 1.53-.565 2.666-.635 1.136-.058 1.516-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold mb-2">INSTAGRAM</h2>
                <p class="text-sm text-slate-500 font-medium">Inside the archive.</p>
                <div class="mt-6 flex items-center gap-2 text-pink-500 font-black text-[10px] tracking-widest uppercase group-hover:gap-4 transition-all">
                  FOLLOW US <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </div>
          </a>

          <!-- Telegram Card -->
          <a [href]="getSettingValue('TelegramUrl')" target="_blank"
             class="group relative bg-[#0A0A0A] border border-white/5 p-10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(59,130,246,0.1)]">
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all"></div>
            
            <div class="flex flex-col h-full justify-between gap-12 relative z-10">
              <div class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.597 0 11.944-5.347 11.944-11.944C23.888 5.347 18.541 0 11.944 0zm5.631 8.271l-1.921 9.062c-.144.646-.525.803-1.063.501l-2.924-2.155-1.411 1.358c-.156.156-.287.287-.588.287l.21-2.978 5.419-4.895c.235-.209-.052-.326-.366-.117l-6.696 4.215-2.886-.9c-.627-.196-.64-.627.13-.93l11.282-4.348c.523-.196.979.117.814.864z"/></svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold mb-2">TELEGRAM</h2>
                <p class="text-sm text-slate-500 font-medium">Private drops & news.</p>
                <div class="mt-6 flex items-center gap-2 text-blue-500 font-black text-[10px] tracking-widest uppercase group-hover:gap-4 transition-all">
                  JOIN CHANNEL <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </div>
          </a>

        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-20">
            <div class="space-y-6">
                <h3 class="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">OFFICIAL EMAIL</h3>
                <a [href]="'mailto:' + getSettingValue('ContactEmail')" class="text-3xl font-display font-medium hover:text-brand-400 transition-colors">
                    {{ getSettingValue('ContactEmail') }}
                </a>
            </div>
            <div class="space-y-6">
                <h3 class="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">LOCATION</h3>
                <p class="text-3xl font-display font-medium">
                    {{ getSettingValue('StoreAddress') }}
                </p>
            </div>
        </div>

        <!-- Footer Accent -->
        <div class="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-30 text-[10px] font-black tracking-[0.5em] uppercase">
            <span>AVAILABLE 24/7 GLOBALLY</span>
            <span>SAINT ARCHIVE &copy; 2026</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: black; }
    .font-display { font-family: 'Outfit', sans-serif; }
  `]
})
export class ContactComponent implements OnInit {
  settings: SystemSetting[] = [];

  constructor(private settingService: SettingService) {}

  ngOnInit(): void {
    this.settingService.getSettings().subscribe(data => {
      this.settings = data;
    });
  }

  getSettingValue(key: string): string {
    return this.settings.find(s => s.key === key)?.value || '';
  }
}
