import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Screens
import { SplashScreenDark } from '../screens/SplashScreenDark';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { CarDetailPage } from '../components/CarDetailPage';
import LiveCarAuctionScreen from '../screens/LiveCarAuctionScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

// Navigator
import { DrawerNavigator } from './DrawerNavigator';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  DrawerRoot: undefined;
  FavoritesScreen: undefined;
  ProfileScreen: undefined;
  EditProfile: undefined;
  CarDetailPage: { carId: number };
  LiveAuction: { carId: number }; // 👈 FIXED: Now accepts carId
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainAppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* DrawerRoot contains ONLY the Home screen */}
    <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />

    {/* Screens on top of the drawer */}
    <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />

    <Stack.Screen name="CarDetailPage" component={CarDetailPage} />
    <Stack.Screen name="LiveAuction" component={LiveCarAuctionScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return <SplashScreenDark />;
  }

  return (
    <NavigationContainer>
      {userToken ? <MainAppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;