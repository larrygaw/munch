import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

// Mock data - Replace this with your actual data source
const stalls = [
  {
    id: '1',
    name: 'Burger King',
    image: 'https://example.com/burger-king.jpg',
    menuItems: [
      { id: '1', name: 'Whopper', price: 8.99, description: 'Flame-grilled beef patty topped with tomatoes, lettuce, mayo, pickles, and onions' },
      { id: '2', name: 'Chicken Royale', price: 7.99, description: 'Crispy chicken fillet topped with lettuce and creamy mayo' },
    ]
  },
  {
    id: '2',
    name: 'Pizza Hut',
    image: 'https://example.com/pizza-hut.jpg',
    menuItems: [
      { id: '1', name: 'Margherita Pizza', price: 12.99, description: 'Classic pizza with tomato sauce, mozzarella, and basil' },
      { id: '2', name: 'Pepperoni Pizza', price: 14.99, description: 'Pizza topped with pepperoni and cheese' },
    ]
  },
];

export default function HomePage() {
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddToCart = (item: any, stallName: string) => {
    console.log('Adding to cart:', { ...item, stallName });
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      stallName: stallName,
    });
  };

  // Filter stalls and menu items based on search query
  const filteredStalls = useMemo(() => {
    if (!searchQuery.trim()) return stalls;

    const query = searchQuery.toLowerCase();
    return stalls.map(stall => ({
      ...stall,
      menuItems: stall.menuItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    })).filter(stall => stall.menuItems.length > 0);
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food items..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView>
        <Text style={styles.header}>Food Stalls</Text>
        {filteredStalls.map((stall) => (
          <View key={stall.id} style={styles.stallContainer}>
            <View style={styles.stallHeader}>
              <Text style={styles.stallName}>{stall.name}</Text>
            </View>
            <View style={styles.divider} />
            {stall.menuItems.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddToCart(item, stall.name)}
                    >
                      <Ionicons name="add-circle" size={24} color="#ffd33d" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2f33',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 16,
  },
  stallContainer: {
    marginBottom: 20,
  },
  stallHeader: {
    padding: 16,
  },
  stallName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffd33d',
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginHorizontal: 16,
  },
  menuItem: {
    padding: 16,
    backgroundColor: '#2c2f33',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  menuItemContent: {
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  itemDescription: {
    fontSize: 14,
    color: '#aaa',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd33d',
  },
  addButton: {
    padding: 4,
  },
});
