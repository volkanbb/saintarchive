import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  userName: string;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/users`;

  getAdmins(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.apiUrl);
  }

  createAdmin(request: CreateAdminRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  deleteAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
