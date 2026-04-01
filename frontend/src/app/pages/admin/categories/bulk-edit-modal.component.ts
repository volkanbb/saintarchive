import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-bulk-edit-category-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-edit-modal.component.html',
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class BulkEditCategoryDetailsModalComponent implements OnInit {
  @Input() selectedCategories: Category[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  editableItems: any[] = [];
  isSaving = false;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.editableItems = this.selectedCategories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl || '',
      showInNavbar: !!c.showInNavbar,
      navbarOrder: c.navbarOrder || 0,
      subCategoryNamesStr: c.subCategories?.map(s => s.name).join(', ') || ''
    }));
  }

  getProxyUrl(url: string | undefined): string {
    if (!url) return '';
    return this.productService.getProxyUrl(url);
  }

  save(): void {
    if (this.editableItems.some(i => !i.name.trim())) {
      alert('Category names cannot be empty.');
      return;
    }

    const updates = this.editableItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      showInNavbar: item.showInNavbar,
      navbarOrder: item.navbarOrder,
      subCategoryNames: item.subCategoryNamesStr
        ? item.subCategoryNamesStr.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : []
    }));

    this.isSaving = true;
    this.categoryService.bulkUpdateCategoryDetails(updates).subscribe({
      next: () => {
        this.isSaving = false;
        this.updated.emit();
        this.close.emit();
      },
      error: (err: any) => {
        console.error('Error updating categories:', err);
        alert('An error occurred while saving changes.');
        this.isSaving = false;
      }
    });
  }
}
