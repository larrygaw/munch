import { router } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../FirebaseConfig';

export default function SignOutPage() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      if (!user) {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      router.replace('/login');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Out</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.text}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25292e',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffd33d',
    marginBottom: 40,
  },
  button: {
    width: '90%',
    backgroundColor: '#ffd33d',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 15,
  },
  text: {
    color: '#25292e',
    fontSize: 18,
    fontWeight: '600',
  },
}); 