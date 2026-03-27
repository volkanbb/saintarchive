import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/user-layout/user-layout.component').then(c => c.UserLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/user/home/home.component').then(c => c.HomeComponent) },
      { path: 'products', loadComponent: () => import('./pages/user/all-products/all-products.component').then(c => c.AllProductsComponent) },
      { path: 'category/:id', loadComponent: () => import('./pages/user/category-view/category-view.component').then(c => c.CategoryViewComponent) },
      { path: 'product/:id', loadComponent: () => import('./pages/user/product-detail/product-detail.component').then(c => c.ProductDetailComponent) },
      { path: 'cart', loadComponent: () => import('./pages/user/cart/cart.component').then(c => c.CartComponent) },
      { path: 'contact', loadComponent: () => import('./pages/user/contact/contact.component').then(c => c.ContactComponent) }
    ]
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(c => c.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'categories',
        loadComponent: () => import('./pages/admin/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/admin/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./pages/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./pages/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'import',
        loadComponent: () => import('./pages/admin/import/import.component').then(m => m.ImportComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/admin/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      { path: 'preview/:id', loadComponent: () => import('./pages/admin/preview/preview.component').then(c => c.PreviewComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
