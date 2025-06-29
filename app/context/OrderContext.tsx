import React, { createContext, useContext, useState } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  stallName: string;
  price: number;
  status: 'preparing' | 'ready' | 'completed';
  estimatedTime: number; // in minutes
  startTime: Date;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  orderTime: Date;
  status: 'preparing' | 'ready' | 'completed';
  estimatedReadyTime: Date;
}

interface OrderContextType {
  orders: Order[];
  createOrder: (items: any[], totalAmount: number) => void;
  updateOrderStatus: (orderId: string, status: 'preparing' | 'ready' | 'completed') => void;
  clearOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder = (items: any[], totalAmount: number) => {
    const orderItems: OrderItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      stallName: item.stallName,
      price: item.price,
      status: 'preparing' as const,
      estimatedTime: 3,
      startTime: new Date(),
    }));

    const orderTime = new Date();
    const estimatedReadyTime = new Date(orderTime.getTime() + (orderItems.length * 3 * 60000));

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      items: orderItems,
      totalAmount,
      orderTime,
      status: 'preparing',
      estimatedReadyTime,
    };

    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: 'preparing' | 'ready' | 'completed') => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const clearOrders = () => {
    setOrders([]);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        clearOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
} 