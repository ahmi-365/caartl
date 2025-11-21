import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Input } from '../components/ui/input';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://api.caartl.com/api';
interface User {
  id: number;
  agent_id: string | null;
  is_approved: number;
  name: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  email: string;
  target: string | null;
  bio: string;
  phone: string;
  photo: string | null;
  roles: string[];
  permissions: string[];
}

interface LoginResponse {
  status: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
const LoginScreen = () => {
  type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const saveAuthData = async (token: string, user: User) => {
    try {
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('Auth data saved successfully');
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };
  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'user']);
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post<LoginResponse>(
        `${BASE_URL}/login`,
        {
          email: email.trim().toLowerCase(),
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000, 
        }
      );

      if (response.data.status === 'success') {
        await saveAuthData(response.data.access_token, response.data.user);
        Alert.alert('Success', 'Login successful!');
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Login failed. Please try again.';
        Alert.alert('Error', errorMessage);
      } else if (error.request) {
        Alert.alert('Error', 'Network error. Please check your connection.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAuth = async () => {
    try {
      const [token, userString] = await AsyncStorage.multiGet(['auth_token', 'user']);
      
      if (token[1] && userString[1]) {
        const user = JSON.parse(userString[1]);
        console.log('User already logged in:', user.email);
      }
    } catch (error) {
      console.error('Error checking existing auth:', error);
    }
  };
  return (
    <View style={styles.container}>
      {/* Background Images */}
      <ImageBackground
        source={{ uri: 'https://static.codia.ai/image/2025-10-20/hFdUGzMbu5.png' }}
        style={styles.topBackground}
        resizeMode="cover"
      />
      <ImageBackground
        source={{ uri: 'https://static.codia.ai/image/2025-10-20/W7Czw6Ls88.png' }}
        style={styles.bottomBackground}
        resizeMode="cover"
      />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={{ uri: 'https://static.codia.ai/image/2025-10-20/3PcrpRUpQR.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>
            Login to your account using email{'\n'}or social networks!
          </Text>
        </View>
        
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Image
            source={{ uri: 'https://static.codia.ai/image/2025-10-20/0cbxiA4x1a.png' }}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="rgba(0, 0, 0, 0.37)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        </View>
        
        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Image
            source={{ uri: 'https://static.codia.ai/image/2025-10-20/ehk1tymwRT.png' }}
            style={styles.passwordIcon}
            resizeMode="contain"
          />

          <Input
            placeholder="Password"
            secureTextEntry
            keyboardType="default"
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <Image
            source={{ uri: 'https://static.codia.ai/image/2025-10-20/csxGWWJ4GP.png' }}
            style={styles.eyeIcon}
            resizeMode="contain"
          />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity 
          style={styles.forgotPasswordContainer}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        {/* Sign Up Link */}
        <TouchableOpacity
          style={styles.signUpContainer}
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
        >
          <Text style={styles.signUpText}>
            First Time Here? <Text style={styles.signUpLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... (styles remain the same)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.5,
  },
  bottomBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width,
    height: height * 0.45,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 70,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 65,
    marginBottom: 25,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontFamily: 'Borg9',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontFamily: 'Baloo Thambi 2',
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 18,
    marginBottom: 20,
    width: '100%',
    height: 55,
  },
  inputIcon: {
    width: 22,
    height: 18,
    marginRight: 15,
  },
  passwordIcon: {
    width: 14,
    height: 18,
    marginRight: 18,
  },
  eyeIcon: {
    width: 20,
    height: 14,
    marginLeft: 'auto',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotPasswordText: {
    fontFamily: 'Baloo Thambi 2',
    fontSize: 16,
    color: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: '#CADB2A',
    borderRadius: 18,
    paddingVertical: 15,
    width: '100%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#A0A0A0',
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  signUpContainer: {
    marginBottom: 18,
  },
  signUpText: {
    fontFamily: 'Baloo Thambi 2',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  signUpLink: {
    color: '#CADB2A',
  },
});

export default LoginScreen;