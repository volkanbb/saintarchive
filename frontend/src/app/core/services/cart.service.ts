import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor() {
    this.loadCart();
  }

  get items(): CartItem[] {
    return this.cartItems.value;
  }

  private saveCart(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartItems.next(items);
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        this.cartItems.next(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart', e);
        this.cartItems.next([]);
      }
    }
  }

  addToCart(product: Product, quantity: number = 1, size?: string): void {
    const items = [...this.cartItems.value];
    const existingItem = items.find(i => i.product.id === product.id && i.size === size);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({ product, quantity, size });
    }

    this.saveCart(items);
  }

  updateQuantity(productId: string, quantity: number, size?: string): void {
    if (quantity <= 0) {
      this.removeFromCart(productId, size);
      return;
    }

    const items = [...this.cartItems.value];
    const item = items.find(i => i.product.id === productId && i.size === size);
    if (item) {
      item.quantity = quantity;
      this.saveCart(items);
    }
  }

  removeFromCart(productId: string, size?: string): void {
    const items = this.cartItems.value.filter(i => !(i.product.id === productId && i.size === size));
    this.saveCart(items);
  }

  clearCart(): void {
    this.saveCart([]);
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getCartCount(): number {
    return this.cartItems.value.reduce((total, item) => total + item.quantity, 0);
  }
}
