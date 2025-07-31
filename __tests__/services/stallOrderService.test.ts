import { StallOrderCount, StallOrderService } from '../../app/services/stallOrderService';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  increment: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock Firebase config
jest.mock('../../FirebaseConfig', () => ({
  db: {},
}));

describe('StallOrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateWaitingTime', () => {
    test('should calculate waiting time correctly for existing stall', () => {
      const stallOrders: StallOrderCount[] = [
        {
          stallName: 'Chicken Rice Stall',
          totalOrders: 3,
          totalItems: 8,
          lastUpdated: new Date(),
        },
      ];

      const waitingTime = StallOrderService.calculateWaitingTime('Chicken Rice Stall', stallOrders);

      expect(waitingTime).toBe(24); // 8 items * 3 minutes
    });

    test('should return minimum waiting time for non-existent stall', () => {
      const stallOrders: StallOrderCount[] = [];

      const waitingTime = StallOrderService.calculateWaitingTime('Non-existent Stall', stallOrders);

      expect(waitingTime).toBe(5); // Minimum time
    });

    test('should return minimum waiting time when calculation is below minimum', () => {
      const stallOrders: StallOrderCount[] = [
        {
          stallName: 'Chicken Rice Stall',
          totalOrders: 1,
          totalItems: 1,
          lastUpdated: new Date(),
        },
      ];

      const waitingTime = StallOrderService.calculateWaitingTime('Chicken Rice Stall', stallOrders);

      expect(waitingTime).toBe(5); // Minimum time (1 * 3 = 3, but minimum is 5)
    });

    test('should handle multiple stalls correctly', () => {
      const stallOrders: StallOrderCount[] = [
        {
          stallName: 'Chicken Rice Stall',
          totalOrders: 2,
          totalItems: 4,
          lastUpdated: new Date(),
        },
        {
          stallName: 'Noodle Stall',
          totalOrders: 3,
          totalItems: 6,
          lastUpdated: new Date(),
        },
      ];

      const chickenRiceTime = StallOrderService.calculateWaitingTime('Chicken Rice Stall', stallOrders);
      const noodleTime = StallOrderService.calculateWaitingTime('Noodle Stall', stallOrders);

      expect(chickenRiceTime).toBe(12); // 4 items * 3 minutes
      expect(noodleTime).toBe(18); // 6 items * 3 minutes
    });
  });

  describe('getAllStallOrderCounts', () => {
    test('should return all stall counts', async () => {
      // Mock the getStallOrderCount method
      const mockGetStallOrderCount = jest.spyOn(StallOrderService, 'getStallOrderCount');
      
      mockGetStallOrderCount
        .mockResolvedValueOnce({
          stallName: 'Chicken Rice Stall',
          totalOrders: 2,
          totalItems: 4,
          lastUpdated: new Date(),
        })
        .mockResolvedValueOnce({
          stallName: 'Noodle Stall',
          totalOrders: 3,
          totalItems: 6,
          lastUpdated: new Date(),
        })
        .mockResolvedValueOnce({
          stallName: 'Drinks Stall',
          totalOrders: 1,
          totalItems: 2,
          lastUpdated: new Date(),
        })
        .mockResolvedValueOnce({
          stallName: 'Dessert Stall',
          totalOrders: 0,
          totalItems: 0,
          lastUpdated: new Date(),
        });

      const result = await StallOrderService.getAllStallOrderCounts();

      expect(result).toHaveLength(4);
      expect(result[0].stallName).toBe('Chicken Rice Stall');
      expect(result[1].stallName).toBe('Noodle Stall');
      expect(result[2].stallName).toBe('Drinks Stall');
      expect(result[3].stallName).toBe('Dessert Stall');

      mockGetStallOrderCount.mockRestore();
    });

    test('should handle missing stall data', async () => {
      // Mock the getStallOrderCount method to return null
      const mockGetStallOrderCount = jest.spyOn(StallOrderService, 'getStallOrderCount');
      mockGetStallOrderCount.mockResolvedValue(null);

      const result = await StallOrderService.getAllStallOrderCounts();

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        stallName: 'Chicken Rice Stall',
        totalOrders: 0,
        totalItems: 0,
        lastUpdated: expect.any(Date),
      });

      mockGetStallOrderCount.mockRestore();
    });
  });

  describe('subscribeToStallOrders', () => {
    test('should return unsubscribe function', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      // Mock onSnapshot to return unsubscribe function
      const { onSnapshot } = require('firebase/firestore');
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const result = StallOrderService.subscribeToStallOrders(mockCallback);

      expect(typeof result).toBe('function');
      expect(onSnapshot).toHaveBeenCalled();
    });
  });

  describe('addOrderToStall', () => {
    test('should update existing stall document', async () => {
      const mockDocRef = {};
      const mockDocSnap = { exists: () => true, data: () => ({ totalOrders: 2, totalItems: 5 }) };

      const { doc, getDoc, updateDoc, increment } = require('firebase/firestore');
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue(mockDocSnap);
      updateDoc.mockResolvedValue(undefined);

      await StallOrderService.addOrderToStall('Chicken Rice Stall', 3);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'stallOrders', 'Chicken Rice Stall');
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        totalOrders: increment(1),
        totalItems: increment(3),
        lastUpdated: expect.any(Date),
      });
    });

    test('should create new stall document if it does not exist', async () => {
      const mockDocRef = {};
      const mockDocSnap = { exists: () => false };

      const { doc, getDoc, setDoc } = require('firebase/firestore');
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue(mockDocSnap);
      setDoc.mockResolvedValue(undefined);

      await StallOrderService.addOrderToStall('New Stall', 2);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'stallOrders', 'New Stall');
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        stallName: 'New Stall',
        totalOrders: 1,
        totalItems: 2,
        lastUpdated: expect.any(Date),
      });
    });
  });

  describe('removeOrderFromStall', () => {
    test('should remove order from existing stall', async () => {
      const mockDocRef = {};
      const mockDocSnap = { 
        exists: () => true, 
        data: () => ({ totalOrders: 3, totalItems: 8 }) 
      };

      const { doc, getDoc, updateDoc } = require('firebase/firestore');
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue(mockDocSnap);
      updateDoc.mockResolvedValue(undefined);

      await StallOrderService.removeOrderFromStall('Chicken Rice Stall', 2);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'stallOrders', 'Chicken Rice Stall');
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        totalOrders: 2, // 3 - 1
        totalItems: 6,  // 8 - 2
        lastUpdated: expect.any(Date),
      });
    });

    test('should not go below zero for orders and items', async () => {
      const mockDocRef = {};
      const mockDocSnap = { 
        exists: () => true, 
        data: () => ({ totalOrders: 1, totalItems: 1 }) 
      };

      const { doc, getDoc, updateDoc } = require('firebase/firestore');
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue(mockDocSnap);
      updateDoc.mockResolvedValue(undefined);

      await StallOrderService.removeOrderFromStall('Chicken Rice Stall', 3);

      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        totalOrders: 0, // Math.max(0, 1 - 1)
        totalItems: 0,  // Math.max(0, 1 - 3)
        lastUpdated: expect.any(Date),
      });
    });

    test('should do nothing if stall does not exist', async () => {
      const mockDocRef = {};
      const mockDocSnap = { exists: () => false };

      const { doc, getDoc, updateDoc } = require('firebase/firestore');
      doc.mockReturnValue(mockDocRef);
      getDoc.mockResolvedValue(mockDocSnap);

      await StallOrderService.removeOrderFromStall('Non-existent Stall', 2);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'stallOrders', 'Non-existent Stall');
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });
}); 