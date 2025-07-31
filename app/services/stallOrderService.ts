import { collection, doc, getDoc, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';

export interface StallOrderCount {
  stallName: string;
  totalOrders: number;
  totalItems: number;
  lastUpdated: Date;
}

export class StallOrderService {
  private static COLLECTION_NAME = 'stallOrders';

  static subscribeToStallOrders(callback: (stallOrders: StallOrderCount[]) => void) {
    return onSnapshot(collection(db, this.COLLECTION_NAME), (snapshot: any) => {
      const stallOrders: StallOrderCount[] = [];
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        stallOrders.push({
          stallName: data.stallName,
          totalOrders: data.totalOrders || 0,
          totalItems: data.totalItems || 0,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        });
      });
      callback(stallOrders);
    });
  }

  static async getStallOrderCount(stallName: string): Promise<StallOrderCount | null> {
    const docRef = doc(db, this.COLLECTION_NAME, stallName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        stallName: data.stallName,
        totalOrders: data.totalOrders || 0,
        totalItems: data.totalItems || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      };
    }
    return null;
  }

  static async addOrderToStall(stallName: string, itemCount: number): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, stallName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        totalOrders: increment(1),
        totalItems: increment(itemCount),
        lastUpdated: new Date(),
      });
    } else {
      await setDoc(docRef, {
        stallName,
        totalOrders: 1,
        totalItems: itemCount,
        lastUpdated: new Date(),
      });
    }
  }

  static async removeOrderFromStall(stallName: string, itemCount: number): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, stallName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const newTotalOrders = Math.max(0, (data.totalOrders || 0) - 1);
      const newTotalItems = Math.max(0, (data.totalItems || 0) - itemCount);
      await updateDoc(docRef, {
        totalOrders: newTotalOrders,
        totalItems: newTotalItems,
        lastUpdated: new Date(),
      });
    }
  }

  static async getAllStallOrderCounts(): Promise<StallOrderCount[]> {
    const stallNames = [
      'Chicken Rice Stall',
      'Noodle Stall',
      'Drinks Stall',
      'Dessert Stall',
    ];
    
    const counts: StallOrderCount[] = [];
    for (const stallName of stallNames) {
      const count = await this.getStallOrderCount(stallName);
      if (count) {
        counts.push(count);
      } else {
        counts.push({
          stallName,
          totalOrders: 0,
          totalItems: 0,
          lastUpdated: new Date(),
        });
      }
    }
    return counts;
  }

  static calculateWaitingTime(stallName: string, stallOrders: StallOrderCount[]): number {
    const stallData = stallOrders.find(stall => stall.stallName === stallName);
    if (!stallData) return 5;
    const totalItems = stallData.totalItems;
    const estimatedTime = Math.max(5, totalItems * 3);
    return estimatedTime;
  }
}
