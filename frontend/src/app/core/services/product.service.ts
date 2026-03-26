import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = '/api/products';

  constructor(private http: HttpClient) {}

  getProducts(search?: string): Observable<Product[]> {
    const url = search ? `${this.API_URL}?search=${encodeURIComponent(search)}` : this.API_URL;
    return this.http.get<Product[]>(url);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/featured`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/category/${categoryId}`);
  }

  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, product);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getProxyUrl(url: string | undefined): string {
    if (!url) return '';
    return `/api/Proxy/image?url=${encodeURIComponent(url)}`;
  }

  getMainImageUrl(product: Product): string {
    if (!product.images || product.images.length === 0) return '';
    const mainImg = product.images.find(i => i.isMain) || product.images[0];
    return this.getProxyUrl(mainImg.url);
  }
}
