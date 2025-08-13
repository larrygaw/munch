import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stallName: string;
}

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const items: CartItem[] = JSON.parse(params.items as string);
  const total = parseFloat(params.total as string);
  const userEmail = params.email as string;

  const { clearCart } = useCart();
  const { createOrder } = useOrders();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
    { id: 'cash', name: 'Cash', icon: 'cash-outline' },
    { id: 'qr', name: 'PayNow/PayLah', icon: 'qr-code-outline' },
  ];

  const validateCardDetails = () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      Alert.alert('Error', 'Please fill in all card details.');
      return false;
    }
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      Alert.alert('Error', 'Please enter a valid card number.');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      Alert.alert('Error', 'Please enter expiry date in MM/YY format.');
      return false;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert('Error', 'Please enter a valid CVV.');
      return false;
    }
    return true;
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const pickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPaymentScreenshot(result.assets[0].uri);
      if (result.assets[0].base64) {
        await uploadOrderWithScreenshot(result.assets[0].base64);
      } else {
        Alert.alert('Error', 'No image data found.');
      }
    }
  };

  const uploadOrderWithScreenshot = async (base64Image: string) => {
    setUploading(true);
    const payload = {
      order: {
        items,
        total,
        email: userEmail,
      },
      screenshot: base64Image,
    };

    try {
      const response = await fetch('https://hooks.zapier.com/hooks/catch/23966325/uugiz9z/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setUploading(false);
      if (response.ok) {
        createOrder(items, total);
        Alert.alert('Success', 'Order and screenshot uploaded!', [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              router.push('/(tabs)/statusPage');
            },
          },
        ]);
      } else {
        Alert.alert('Upload failed', 'Could not upload to Google Sheets.');
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Upload failed', 'An error occurred while uploading.');
    }
  };

  const handleConfirmPayment = async () => {
    if (selectedPaymentMethod === 'card' && !validateCardDetails()) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await createOrder(items, total);
      clearCart();
      router.push('/(tabs)/statusPage');
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffd33d" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
            ]}
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <Ionicons
              name={method.icon as any}
              size={24}
              color={selectedPaymentMethod === method.id ? '#ffd33d' : '#666'}
            />
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethodText,
              ]}
            >
              {method.name}
            </Text>
            {selectedPaymentMethod === method.id && (
              <Ionicons name="checkmark-circle" size={24} color="#ffd33d" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedPaymentMethod === 'card' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#666"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="MM/YY"
                placeholderTextColor="#666"
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.textInput}
                placeholder="123"
                placeholderTextColor="#666"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="John Doe"
              placeholderTextColor="#666"
              value={cardholderName}
              onChangeText={setCardholderName}
              autoCapitalize="words"
            />
          </View>
        </View>
      )}

      {selectedPaymentMethod === 'cash' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cash</Text>
          <Text style={styles.paymentInfo}>
            Pay with cash at the counter.
          </Text>
        </View>
      )}

      {selectedPaymentMethod === 'qr' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan to Pay</Text>
          <Image
            source={require('../../assets/paynow-qr.jpg')}
            style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 16, borderRadius: 12 }}
            resizeMode="contain"
          />
          <Text style={styles.qrInstructions}>
            Scan this QR code with your banking/payment app to pay.
          </Text>
          <TouchableOpacity
            style={styles.payButton}
            onPress={async () => {
              if (uploading) return;
              await pickScreenshot();
            }}
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.processingContainer}>
                <Ionicons name="refresh" size={20} color="#25292e" style={styles.spinning} />
                <Text style={styles.payButtonText}>Uploading...</Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>I have paid</Text>
            )}
          </TouchableOpacity>
          {paymentScreenshot && (
            <Image
              source={{ uri: paymentScreenshot }}
              style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 16, borderRadius: 12 }}
              resizeMode="contain"
            />
          )}
        </View>
      ) : (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handleConfirmPayment}
            disabled={isProcessing || !selectedPaymentMethod}
          >
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <Ionicons name="refresh" size={20} color="#25292e" style={styles.spinning} />
                <Text style={styles.payButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>Pay ${total.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#25292e',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd33d',
    textAlign: 'center',
    flex: 1,
  },
  section: {
    backgroundColor: '#2c2f33',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  itemName: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 16,
    color: '#aaa',
    marginHorizontal: 16,
  },
  itemPrice: {
    fontSize: 16,
    color: '#ffd33d',
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#444',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    backgroundColor: '#555',
    borderColor: '#ffd33d',
    borderWidth: 2,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  selectedPaymentMethodText: {
    color: '#ffd33d',
    fontWeight: 'bold',
  },
  paymentInfo: {
    fontSize: 16,
    color: '#aaa',
    lineHeight: 24,
  },
  qrInstructions: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#555',
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  payButton: {
    backgroundColor: '#ffd33d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  payButtonDisabled: {
    backgroundColor: '#666',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25292e',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinning: {
    marginRight: 8,
  },
});
