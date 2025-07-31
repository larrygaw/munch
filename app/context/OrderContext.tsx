import React, { createContext, useContext, useEffect, useState } from 'react';
import { StallOrderCount, StallOrderService } from '../services/stallOrderService';

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
  stallOrders: StallOrderCount[];
  createOrder: (items: any[], totalAmount: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: 'preparing' | 'ready' | 'completed') => Promise<void>;
  clearOrders: () => void;
  getEstimatedWaitingTime: (stallName: string) => number;
  getOrderQueuePosition: (orderId: string) => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stallOrders, setStallOrders] = useState<StallOrderCount[]>([]);

  useEffect(() => {
    const unsubscribe = StallOrderService.subscribeToStallOrders((stallOrders) => {
      setStallOrders(stallOrders);
    });
    return () => unsubscribe();
  }, []);

  const createOrder = async (items: any[], totalAmount: number) => {
    const orderItems: OrderItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      stallName: item.stallName,
      price: item.price,
      status: 'preparing' as const,
      estimatedTime: 3, // Changed from 7 to 3 minutes
      startTime: new Date(),
    }));

    const orderTime = new Date();
    const estimatedReadyTime = calculateEstimatedReadyTimeFromFirebase(orderItems, orderTime);

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      items: orderItems,
      totalAmount,
      orderTime,
      status: 'preparing',
      estimatedReadyTime,
    };

    setOrders(prev => [newOrder, ...prev]);
    
    // Update Firebase counts for each stall
    for (const item of orderItems) {
      await StallOrderService.addOrderToStall(item.stallName, item.quantity);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'preparing' | 'ready' | 'completed') => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    
    // Remove from Firebase when order is completed (for queue calculations)
    // But keep the order visible on status page
    if (status === 'completed' && order) {
      for (const item of order.items) {
        await StallOrderService.removeOrderFromStall(item.stallName, item.quantity);
      }
    }
  };

  const clearOrders = () => {
    setOrders([]);
  };

  const calculateEstimatedReadyTimeFromFirebase = (orderItems: OrderItem[], orderTime: Date): Date => {
    const totalWaitingTime = orderItems.reduce((total, item) => {
      const stallWaitingTime = StallOrderService.calculateWaitingTime(item.stallName, stallOrders);
      return total + (item.quantity * 3); // 3 minutes per item
    }, 0);
    const finalWaitingTime = Math.max(5, totalWaitingTime);
    return new Date(orderTime.getTime() + (finalWaitingTime * 60000));
  };

  const getEstimatedWaitingTime = (stallName: string): number => {
    return StallOrderService.calculateWaitingTime(stallName, stallOrders);
  };

  const getOrderQueuePosition = (orderId: string): number => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return 0;
    
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const orderIndex = preparingOrders.findIndex(o => o.id === orderId);
    return orderIndex + 1;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        stallOrders,
        createOrder,
        updateOrderStatus,
        clearOrders,
        getEstimatedWaitingTime,
        getOrderQueuePosition,
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