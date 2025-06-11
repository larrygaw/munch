import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

  console.log('Cart items:', items);
  console.log('Cart total:', total);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Your Cart</Text>
          <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        
        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.stallName}>{item.stallName}</Text>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
            
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                style={styles.quantityButton}
              >
                <Ionicons name="remove-circle" size={24} color="#ffd33d" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                style={styles.quantityButton}
              >
                <Ionicons name="add-circle" size={24} color="#ffd33d" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#ff4444',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c2f33',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  stallName: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd33d',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 4,
  },
  quantity: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#2c2f33',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#fff',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  checkoutButton: {
    backgroundColor: '#ffd33d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: '600',
  },
});
