import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';

const stalls = [
  {
    id: '1',
    name: 'Chicken Rice Stall',
    location: { lat: 1.35050, lng: 103.84947 },
    menuItems: [
      { id: '1', name: 'Chicken Rice', price: 5.50, description: 'Steamed chicken with fragrant rice and chili sauce' },
      { id: '2', name: 'Roasted Chicken Rice', price: 6.00, description: 'Roasted chicken with fragrant rice and chili sauce' },
      { id: '3', name: 'Chicken Noodle Soup', price: 4.50, description: 'Chicken noodle soup with vegetables' },
    ]
  },
  {
    id: '2',
    name: 'Noodle Stall',
    location: { lat: 1.35050, lng: 103.84947 },
    menuItems: [
      { id: '1', name: 'Char Kway Teow', price: 4.50, description: 'Stir-fried flat rice noodles with prawns and Chinese sausage' },
      { id: '2', name: 'Laksa', price: 5.00, description: 'Spicy coconut curry noodle soup' },
      { id: '3', name: 'Beef Noodles', price: 6.50, description: 'Beef noodle soup with tender beef slices' },
    ]
  },
  {
    id: '3',
    name: 'Drinks Stall',
    location: { lat: 1.35050, lng: 103.84947 },
    menuItems: [
      { id: '1', name: 'Iced Milo', price: 2.50, description: 'Chilled Milo with ice' },
      { id: '2', name: 'Teh Tarik', price: 2.00, description: 'Pulled tea with condensed milk' },
      { id: '3', name: 'Lemon Tea', price: 2.50, description: 'Refreshing lemon tea' },
    ]
  },
  {
    id: '4',
    name: 'Dessert Stall',
    location: { lat: 1.35050, lng: 103.84947 },
    menuItems: [
      { id: '1', name: 'Ice Kacang', price: 3.50, description: 'Shaved ice dessert with red beans and syrup' },
      { id: '2', name: 'Chendol', price: 3.00, description: 'Traditional dessert with green jelly and coconut milk' },
      { id: '3', name: 'Durian Shaved Ice', price: 4.00, description: 'Rich durian top on shaved ice' },
    ]
  },
];

export default function HomePage() {
  const { addToCart } = useCart();
  const { getEstimatedWaitingTime, stallOrders } = useOrders();
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

  const openLocation = async (stallName: string, location: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open Google Maps on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open location.');
    }
  };

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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
        <Text style={styles.header}>Stalls</Text>
        {filteredStalls.map((stall) => {
          const estimatedTime = getEstimatedWaitingTime(stall.name);
          const stallData = stallOrders.find(s => s.stallName === stall.name);
          const totalOrders = stallData?.totalOrders || 0;
          const totalItems = stallData?.totalItems || 0;

          return (
            <View key={stall.id} style={styles.stallContainer}>
              <View style={styles.stallHeader}>
                <View style={styles.stallInfo}>
                  <Text style={styles.stallName}>{stall.name}</Text>
                  <View style={styles.stallStats}>
                    <Text style={styles.stallStatsText}>
                      {totalOrders} orders • {totalItems} items
                    </Text>
                  </View>
                </View>
                <View style={styles.stallActions}>
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={() => openLocation(stall.name, stall.location)}
                  >
                    <Ionicons name="location-outline" size={16} color="#ffd33d" />
                    <Text style={styles.locationText}>Location</Text>
                  </TouchableOpacity>
                  <View style={styles.waitingTimeContainer}>
                    <Ionicons name="time-outline" size={16} color="#ffd33d" />
                    <Text style={styles.waitingTimeText}>
                      ~{estimatedTime} min wait
                    </Text>
                  </View>
                </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stallInfo: {
    flex: 1,
  },
  stallName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffd33d',
  },
  stallStats: {
    marginTop: 4,
  },
  stallStatsText: {
    fontSize: 14,
    color: '#aaa',
  },
  stallActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  locationText: {
    color: '#ffd33d',
    fontSize: 14,
    marginLeft: 6,
  },
  waitingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitingTimeText: {
    fontSize: 14,
    color: '#ffd33d',
    marginLeft: 6,
    fontWeight: '500',
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
