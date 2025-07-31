import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { OrderProvider, useOrders } from '../../app/context/OrderContext';
import { StallOrderService } from '../../app/services/stallOrderService';

// Mock the StallOrderService
jest.mock('../../app/services/stallOrderService');

const mockStallOrderService = StallOrderService as jest.Mocked<typeof StallOrderService>;

// Mock data
const mockItems = [
  {
    id: '1',
    name: 'Chicken Rice',
    price: 5.50,
    quantity: 2,
    stallName: 'Chicken Rice Stall',
  },
  {
    id: '2',
    name: 'Char Kway Teow',
    price: 4.50,
    quantity: 1,
    stallName: 'Noodle Stall',
  },
];

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OrderProvider>{children}</OrderProvider>
);

describe('OrderContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the subscribeToStallOrders method
    mockStallOrderService.subscribeToStallOrders.mockReturnValue(() => {});
  });

  describe('createOrder', () => {
    test('should create new order with correct structure', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      await act(async () => {
        await result.current.createOrder(mockItems, 15.50);
      });

      expect(result.current.orders).toHaveLength(1);
      const order = result.current.orders[0];
      
      expect(order.items).toHaveLength(2);
      expect(order.totalAmount).toBe(15.50);
      expect(order.status).toBe('preparing');
      expect(order.items[0].status).toBe('preparing');
      expect(order.items[0].estimatedTime).toBe(3);
    });

    test('should call StallOrderService for each item', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      await act(async () => {
        await result.current.createOrder(mockItems, 15.50);
      });

      expect(mockStallOrderService.addOrderToStall).toHaveBeenCalledTimes(2);
      expect(mockStallOrderService.addOrderToStall).toHaveBeenCalledWith('Chicken Rice Stall', 2);
      expect(mockStallOrderService.addOrderToStall).toHaveBeenCalledWith('Noodle Stall', 1);
    });
  });

  describe('updateOrderStatus', () => {
    test('should update order status correctly', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      // First create an order
      await act(async () => {
        await result.current.createOrder(mockItems, 15.50);
      });

      const orderId = result.current.orders[0].id;

      // Update the order status
      await act(async () => {
        await result.current.updateOrderStatus(orderId, 'ready');
      });

      expect(result.current.orders[0].status).toBe('ready');
    });

    test('should remove from Firebase when order is completed', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      // First create an order
      await act(async () => {
        await result.current.createOrder(mockItems, 15.50);
      });

      const orderId = result.current.orders[0].id;

      // Complete the order
      await act(async () => {
        await result.current.updateOrderStatus(orderId, 'completed');
      });

      expect(mockStallOrderService.removeOrderFromStall).toHaveBeenCalledTimes(2);
      expect(mockStallOrderService.removeOrderFromStall).toHaveBeenCalledWith('Chicken Rice Stall', 2);
      expect(mockStallOrderService.removeOrderFromStall).toHaveBeenCalledWith('Noodle Stall', 1);
    });
  });

  describe('clearOrders', () => {
    test('should clear all orders', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      // First create some orders
      await act(async () => {
        await result.current.createOrder(mockItems, 15.50);
        await result.current.createOrder(mockItems, 15.50);
      });

      expect(result.current.orders).toHaveLength(2);

      // Clear orders
      act(() => {
        result.current.clearOrders();
      });

      expect(result.current.orders).toHaveLength(0);
    });
  });

  describe('getEstimatedWaitingTime', () => {
    test('should return waiting time from StallOrderService', () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      // Mock the calculateWaitingTime method
      mockStallOrderService.calculateWaitingTime.mockReturnValue(15);

      const waitingTime = result.current.getEstimatedWaitingTime('Chicken Rice Stall');

      expect(waitingTime).toBe(15);
      expect(mockStallOrderService.calculateWaitingTime).toHaveBeenCalledWith('Chicken Rice Stall', []);
    });
  });

  describe('getOrderQueuePosition', () => {
    test('should return correct queue position for preparing orders', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      // Create multiple orders
      await act(async () => {
        await result.current.createOrder(mockItems, 15.50);
        await result.current.createOrder(mockItems, 15.50);
      });

      const firstOrderId = result.current.orders[0].id;
      const secondOrderId = result.current.orders[1].id;

      expect(result.current.getOrderQueuePosition(firstOrderId)).toBe(1);
      expect(result.current.getOrderQueuePosition(secondOrderId)).toBe(2);
    });

    test('should return 0 for non-existent order', () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      const position = result.current.getOrderQueuePosition('non-existent-id');

      expect(position).toBe(0);
    });

    test('should not count completed orders in queue', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      // Create an order
      await act(async () => {
        await result.current.createOrder(mockItems, 15.50);
      });

      const orderId = result.current.orders[0].id;

      // Complete the order
      await act(async () => {
        await result.current.updateOrderStatus(orderId, 'completed');
      });

      // Queue position should be 0 since order is completed
      expect(result.current.getOrderQueuePosition(orderId)).toBe(0);
    });
  });

  describe('order state', () => {
    test('should start with empty orders array', () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      expect(result.current.orders).toHaveLength(0);
      expect(result.current.stallOrders).toHaveLength(0);
    });
  });
}); 