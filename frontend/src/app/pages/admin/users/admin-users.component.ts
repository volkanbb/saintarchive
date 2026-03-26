import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUserService, AdminUser, CreateAdminRequest } from '../../../core/services/admin-user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Sistem Yöneticileri</h2>
          <p class="text-slate-500 text-sm">Panel erişimi olan tüm hesapları yönetin.</p>
        </div>
        <button (click)="showCreateModal = true" class="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Yeni Yönetici Ekle
        </button>
      </div>

      <!-- Users List -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ad Soyad</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">E-posta</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let user of admins" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                    {{ user.fullName.charAt(0) }}
                  </div>
                  <span class="font-medium text-slate-700">{{ user.fullName }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-500">{{ user.email }}</td>
              <td class="px-6 py-4 text-right">
                <button (click)="deleteUser(user)" class="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="admins.length === 0">
              <td colspan="3" class="px-6 py-12 text-center text-slate-400">Yönetici bulunamadı.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
          <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800 uppercase tracking-tight">Yeni Yönetici Tanımla</h3>
            <button (click)="showCreateModal = false" class="text-slate-400 hover:text-slate-600"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          
          <form (submit)="createAdmin($event)" class="p-8 space-y-6">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Ad Soyad</label>
                <input type="text" [(ngModel)]="newUser.fullName" name="fullName" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">E-posta</label>
                <input type="email" [(ngModel)]="newUser.email" name="email" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Geçici Şifre</label>
                <input type="password" [(ngModel)]="newUser.password" name="password" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all">
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="button" (click)="showCreateModal = false" class="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Vazgeç</button>
              <button type="submit" [disabled]="loading" class="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50">
                {{ loading ? 'Oluşturuluyor...' : 'Hesabı Oluştur' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminUserService);
  
  admins: AdminUser[] = [];
  showCreateModal = false;
  loading = false;
  
  newUser: CreateAdminRequest = {
    email: '',
    password: '',
    fullName: ''
  };

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.adminService.getAdmins().subscribe({
      next: (data) => this.admins = data,
      error: (err) => console.error('Failed to load admins', err)
    });
  }

  createAdmin(event: Event): void {
    event.preventDefault();
    this.loading = true;
    this.adminService.createAdmin(this.newUser).subscribe({
      next: () => {
        this.loading = false;
        this.showCreateModal = false;
        this.newUser = { email: '', password: '', fullName: '' };
        this.loadAdmins();
      },
      error: (err) => {
        this.loading = false;
        alert('Hata: ' + (err.error?.message || 'Hesap oluşturulamadı.'));
      }
    });
  }

  deleteUser(user: AdminUser): void {
    if (confirm(`${user.fullName} isimli yöneticiyi silmek istediğinize emin misiniz?`)) {
      this.adminService.deleteAdmin(user.id).subscribe({
        next: () => this.loadAdmins(),
        error: (err) => alert('Silme işlemi başarısız.')
      });
    }
  }
}
