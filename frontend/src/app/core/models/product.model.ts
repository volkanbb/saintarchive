export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  sortOrder: number;
}

export interface Size {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  subCategoryId?: string;
  subCategoryName?: string;
  isFeatured: boolean;
  sortOrder: number;
  images: ProductImage[];
  sizes: Size[];
}

export interface ScrapedProductInfo {
  title: string;
  description: string;
  url: string;
  imageUrls: string[];
}
