import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#ffd33d', 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen 
        name="homePage" 
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="cartPage" 
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cart-sharp' : 'cart-outline'} color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="statusPage" 
        options={{ 
          tabBarLabel : 'Status',
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name={focused ? 'clockcircle' : 'clockcircleo'} color={color} size={22} />
          ),
        }} 
      />
    </Tabs>
  );
}
