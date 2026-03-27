import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ScrapedProductInfo, Size } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = '/api/products';
  private readonly IMPORT_URL = '/api/import';

  constructor(private http: HttpClient) {}

  scrapeYupooAlbum(url: string): Observable<ScrapedProductInfo> {
    return this.http.get<ScrapedProductInfo>(`${this.IMPORT_URL}/scrape-album?url=${encodeURIComponent(url)}`);
  }

  getProducts(search?: string, categoryId?: string, subCategoryId?: string): Observable<Product[]> {
    let url = this.API_URL;
    const params = [];
    
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (categoryId) params.push(`categoryId=${categoryId}`);
    if (subCategoryId) params.push(`subCategoryId=${subCategoryId}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
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

  updateFeaturedOrder(productIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/update-order`, productIds);
  }

  getSizes(): Observable<Size[]> {
    return this.http.get<Size[]>(`${this.API_URL}/sizes`);
  }

  bulkUpdateSizes(productIds: string[], sizeIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/bulk-update-sizes`, { productIds, sizeIds });
  }

  bulkUpdateCategories(productIds: string[], categoryId: string, subCategoryId?: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/bulk-update-categories`, { productIds, categoryId, subCategoryId });
  }

  addSize(name: string): Observable<Size> {
    return this.http.post<Size>(`${this.API_URL}/sizes`, { name });
  }

  deleteSize(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/sizes/${id}`);
  }

  bulkDelete(productIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/bulk-delete`, productIds);
  }

  bulkDeleteImages(imageIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/bulk-delete-images`, imageIds);
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
