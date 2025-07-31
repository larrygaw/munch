import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrders } from '../context/OrderContext';

export default function StatusPage() {
  const { orders, updateOrderStatus, getOrderQueuePosition } = useOrders();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getRemainingTime = (estimatedTime: Date) => {
    const remaining = estimatedTime.getTime() - currentTime.getTime();
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / 60000);
  };

  useEffect(() => {
    orders.forEach(order => {
      const remainingTime = getRemainingTime(order.estimatedReadyTime);
      
      if (remainingTime <= 0 && order.status === 'preparing') {
        updateOrderStatus(order.id, 'ready');
      }
    });
  }, [currentTime, orders, updateOrderStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Ionicons name="time-outline" size={24} color="#ffd33d" />;
      case 'ready':
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case 'completed':
        return <Ionicons name="checkmark-done-circle" size={24} color="#2196F3" />;
      default:
        return <Ionicons name="help-circle-outline" size={24} color="#666" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>No Orders Yet</Text>
          <Text style={styles.emptySubtext}>Your order status will appear here after checkout from the cart</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Order Status</Text>
      
      <ScrollView style={styles.ordersContainer} showsVerticalScrollIndicator={false}>
        {orders.map((order) => {
          const queuePosition = getOrderQueuePosition(order.id);
          const remainingTime = getRemainingTime(order.estimatedReadyTime);

          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
                  <Text style={styles.orderTime}>
                    Ordered at {formatTime(order.orderTime)}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  {getStatusIcon(order.status)}
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {order.items.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemStall}>{item.stallName}</Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.orderFooter}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
                </View>

                {order.status === 'preparing' && (
                  <View style={styles.queueInfo}>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time-outline" size={16} color="#ffd33d" />
                      <Text style={styles.timeText}>
                        {remainingTime} min remaining
                      </Text>
                    </View>
                    <View style={styles.queueContainer}>
                      <Ionicons name="people-outline" size={16} color="#ffd33d" />
                      <Text style={styles.queueText}>
                        Position #{queuePosition} in queue
                      </Text>
                    </View>
                  </View>
                )}

                {order.status === 'ready' && (
                  <TouchableOpacity 
                    style={styles.pickupButton}
                    onPress={() => updateOrderStatus(order.id, 'completed')}
                  >
                    <Text style={styles.pickupButtonText}>Pick Up</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'completed' && (
                  <View style={styles.completedContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.completedText}>Order Completed</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
  },
  ordersContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  orderCard: {
    backgroundColor: '#2c2f33',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  orderTime: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  itemStall: {
    fontSize: 14,
    color: '#aaa',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd33d',
  },
  orderFooter: {
    marginTop: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  queueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#ffd33d',
    marginLeft: 6,
    fontWeight: '500',
  },
  queueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  queueText: {
    fontSize: 14,
    color: '#ffd33d',
    marginLeft: 6,
    fontWeight: '500',
  },
  pickupButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },
});
