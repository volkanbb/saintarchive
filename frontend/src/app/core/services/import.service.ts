import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImportPreview } from '../models/import.model';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private readonly API_URL = '/api/import';

  constructor(private http: HttpClient) {}

  previewImport(url: string): Observable<{ taskId: string }> {
    // Send string as JSON string or plain text. The backend expects [FromBody] string url
    return this.http.post<{ taskId: string }>(this.API_URL, `"${url}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getTaskStatus(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/task/${id}`);
  }

  getPreview(id: string): Observable<ImportPreview> {
    return this.http.get<ImportPreview>(`${this.API_URL}/preview/${id}`);
  }

  confirmImport(data: any): Observable<{ productId: string }> {
    return this.http.post<{ productId: string }>(`${this.API_URL}/confirm`, data);
  }

  getPendingImports(): Observable<ImportPreview[]> {
    return this.http.get<ImportPreview[]>(`${this.API_URL}/pending`);
  }

  getProxyUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.includes('yupoo.com')) {
      return `/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
    return url;
  }
}
