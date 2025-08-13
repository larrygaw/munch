interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stallName: string;
}

const addToCart = (items: CartItem[], newItem: Omit<CartItem, 'quantity'>): CartItem[] => {
  const existingItem = items.find(item => item.id === newItem.id);
  if (existingItem) {
    return items.map(item => 
      item.id === newItem.id 
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }
  return [...items, { ...newItem, quantity: 1 }];
};

const removeFromCart = (items: CartItem[], itemId: string): CartItem[] => {
  return items.filter(item => item.id !== itemId);
};

const updateQuantity = (items: CartItem[], itemId: string, quantity: number): CartItem[] => {
  if (quantity <= 0) {
    return removeFromCart(items, itemId);
  }
  return items.map(item => 
    item.id === itemId ? { ...item, quantity } : item
  );
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

describe('Cart Logic', () => {
  const mockItem: Omit<CartItem, 'quantity'> = {
    id: '1',
    name: 'Chicken Rice',
    price: 5.50,
    stallName: 'Chicken Rice Stall',
  };

  test('should add new item to cart', () => {
    const items: CartItem[] = [];
    const result = addToCart(items, mockItem);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ ...mockItem, quantity: 1 });
  });

  test('should increment quantity for existing item', () => {
    const items: CartItem[] = [{ ...mockItem, quantity: 1 }];
    const result = addToCart(items, mockItem);
    
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(2);
  });

  test('should remove item from cart', () => {
    const items: CartItem[] = [{ ...mockItem, quantity: 1 }];
    const result = removeFromCart(items, '1');
    
    expect(result).toHaveLength(0);
  });

  test('should update item quantity', () => {
    const items: CartItem[] = [{ ...mockItem, quantity: 1 }];
    const result = updateQuantity(items, '1', 3);
    
    expect(result[0].quantity).toBe(3);
  });

  test('should remove item when quantity is 0', () => {
    const items: CartItem[] = [{ ...mockItem, quantity: 1 }];
    const result = updateQuantity(items, '1', 0);
    
    expect(result).toHaveLength(0);
  });

  test('should calculate total correctly', () => {
    const items: CartItem[] = [
      { ...mockItem, quantity: 2 },
      { id: '2', name: 'Noodles', price: 4.00, quantity: 1, stallName: 'Noodle Stall' }
    ];
    
    const total = calculateTotal(items);
    expect(total).toBe(15.00);
  });

  test('should return 0 for empty cart', () => {
    const items: CartItem[] = [];
    const total = calculateTotal(items);
    expect(total).toBe(0);
  });
}); 