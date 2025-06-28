import { router } from 'expo-router'
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import React, { useState } from 'react'
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { auth } from '../FirebaseConfig'


const index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password)
      if (user) router.replace('/(tabs)/homePage');
    } catch (error: any) {
      console.log(error)
      alert('Sign in failed: ' + error.message);
    }
  }

  const signUp = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password)
      if (user) router.replace('/(tabs)/homePage');
    } catch (error: any) {
      console.log(error)
      alert('Sign in failed: ' + error.message);
    }
  }

  const forgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for password reset instructions.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', 'Failed to send password reset email: ' + error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Munch</Text>
      <TextInput style={styles.textInput} placeholder="e.g. munch@gmail.com" 
        placeholderTextColor="#D3D3D3" value={email} onChangeText={setEmail} />
      <TextInput style={styles.textInput} placeholder="password" 
        placeholderTextColor="#D3D3D3" value={password} onChangeText={setPassword} secureTextEntry/>
      
      <TouchableOpacity style={styles.forgotPasswordButton} onPress={forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      
      <View style={styles.buttonRow}>
    <TouchableOpacity style={styles.buttonLogin} onPress={signIn}>
      <Text style={styles.textLogin}>Login</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.buttonSignUp} onPress={signUp}>
      <Text style={styles.textSignUp}>Sign Up</Text>
    </TouchableOpacity>
  </View>
</SafeAreaView>
  )
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25292e', // Dark theme background
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 40,
    color: '#ffd33d', // Yellow accent color
  },
  textInput: {
    height: 50,
    width: '90%',
    backgroundColor: '#2c2f33', // Dark input background
    borderColor: '#444', // Dark border
    borderWidth: 2,
    borderRadius: 15,
    marginVertical: 15,
    paddingHorizontal: 25,
    fontSize: 16,
    color: '#fff', // White text
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  buttonLogin: {
    width: '40%',
    marginVertical: 10,
    backgroundColor: '#ffd33d', // Yellow accent color
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonSignUp: {
    width: '40%',
    marginVertical: 10,
    backgroundColor: '#2c2f33', // Dark button background
    borderWidth: 2,
    borderColor: '#ffd33d', // Yellow border
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },

  textLogin: {
    color: '#25292e', // Dark text on yellow background
    fontSize: 18,
    fontWeight: '600',
  },

  textSignUp: {
    color: '#ffd33d', // Yellow text on dark background
    fontSize: 18,
    fontWeight: '600',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  forgotPasswordButton: {
    width: '90%',
    marginVertical: 10,
    backgroundColor: '#2c2f33', // Dark button background
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },

  forgotPasswordText: {
    color: '#ffd33d', // Yellow text on dark background
    fontSize: 18,
    fontWeight: '600',
  },
})