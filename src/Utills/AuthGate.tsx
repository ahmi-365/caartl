import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainApp from '../navigation/Tabs'; // or your bottom tab navigator
import LoginScreen from '../screens/LoginScreen';

const AuthGate = () => {
  const [isLoading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setLoggedIn(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isLoggedIn ? <MainApp /> : <LoginScreen navigation={undefined as any} route={undefined as any} />;
};

export default AuthGate;
