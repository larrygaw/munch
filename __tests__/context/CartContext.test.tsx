import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { CartItem, CartProvider, useCart } from '../../app/context/CartContext';

const mockItem: Omit<CartItem, 'quantity'> = {
  id: '1',
  name: 'Chicken Rice',
  price: 5.50,
  stallName: 'Chicken Rice Stall',
};

const mockItem2: Omit<CartItem, 'quantity'> = {
  id: '2',
  name: 'Char Kway Teow',
  price: 4.50,
  stallName: 'Noodle Stall',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
  });

  describe('addToCart', () => {
    test('should add new item to cart with quantity 1', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual({
        ...mockItem,
        quantity: 1,
      });
    });

    test('should increment quantity for existing item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.addToCart(mockItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    test('should add multiple different items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.addToCart(mockItem2);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.items[1].quantity).toBe(1);
    });
  });

  describe('removeFromCart', () => {
    test('should remove item from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.removeFromCart('1');
      });

      expect(result.current.items).toHaveLength(0);
    });

    test('should not remove non-existent item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.removeFromCart('999');
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    test('should update item quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.updateQuantity('1', 3);
      });

      expect(result.current.items[0].quantity).toBe(3);
    });

    test('should remove item when quantity is less than 1', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.updateQuantity('1', 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    test('should not update non-existent item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.updateQuantity('999', 5);
      });

      expect(result.current.items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    test('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.addToCart(mockItem2);
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('total calculation', () => {
    test('should calculate total correctly for single item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
      });

      expect(result.current.total).toBe(5.50);
    });

    test('should calculate total correctly for multiple items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.addToCart(mockItem2);
      });

      expect(result.current.total).toBe(10.00);
    });

    test('should calculate total correctly for items with quantity > 1', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockItem);
        result.current.addToCart(mockItem);
      });

      expect(result.current.total).toBe(11.00);
    });

    test('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.total).toBe(0);
    });
  });

  describe('cart state', () => {
    test('should start with empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.total).toBe(0);
    });
  });
}); 