export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
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
  images: ProductImage[];
}

export interface ScrapedProductInfo {
  title: string;
  description: string;
  url: string;
  imageUrls: string[];
}
