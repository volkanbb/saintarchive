import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { SystemSetting, UpdateSettingRequest } from '../models/system-setting.model';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private apiUrl = '/api/settings';
  private settingsCache$?: Observable<SystemSetting[]>;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<SystemSetting[]> {
    if (!this.settingsCache$) {
      this.settingsCache$ = this.http.get<SystemSetting[]>(this.apiUrl).pipe(
        shareReplay(1)
      );
    }
    return this.settingsCache$;
  }

  getSetting(key: string): Observable<SystemSetting> {
    return this.http.get<SystemSetting>(`${this.apiUrl}/${key}`);
  }

  updateSetting(key: string, request: UpdateSettingRequest): Observable<void> {
    this.settingsCache$ = undefined; // Invalidate cache
    return this.http.put<void>(`${this.apiUrl}/${key}`, request);
  }
}
