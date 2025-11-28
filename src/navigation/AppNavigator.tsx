import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// --- Import All Your Screens ---
import { SplashScreenDark } from '../screens/SplashScreenDark';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { HomescreenLight } from '../screens/Caartl/homescreen';
import LiveCarAuctionScreen from '../screens/LiveCarAuctionScreen';
import { CarDetailPage } from '../components/CarDetailPage';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

// Define the parameters for each screen
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  LiveAuction: undefined;
  CarDetailPage: { carId: number }; // Example with params
  ProfileScreen: undefined;
  FavoritesScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// A stack for screens shown when the user is NOT logged in
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// A stack for screens shown when the user IS logged in
const MainAppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* If you use a Bottom Tab Navigator, you would place it here as a single screen */}
    <Stack.Screen name="Home" component={HomescreenLight} />
    <Stack.Screen name="LiveAuction" component={LiveCarAuctionScreen} />
    <Stack.Screen name="CarDetailPage" component={CarDetailPage} />
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
  </Stack.Navigator>
);

// RENAMED: from RootNavigator to AppNavigator
const AppNavigator = () => {
  const { isLoading, userToken } = useAuth();

  // 1. While the AuthContext is loading, show the animated splash screen
  if (isLoading) {
    return <SplashScreenDark />;
  }

  // 2. After loading, the NavigationContainer will render the correct stack
  return (
    <NavigationContainer>
      {userToken ? <MainAppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;