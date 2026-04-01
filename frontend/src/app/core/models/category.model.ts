export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  parentCategoryId?: string;
  showInNavbar?: boolean;
  navbarOrder?: number;
  subCategories?: Category[];
}
