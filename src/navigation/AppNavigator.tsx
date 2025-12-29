import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import BiddingDetailScreen from '../screens/BiddingDetailScreen';
import BookCarScreen from '../screens/BookCarScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen'; // 1. Import Here
import ViewBookingScreen from '../screens/ViewBookingScreen'; // Import the new screen

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
  LiveAuction: { carId: number; viewType?: 'live' | 'negotiation' | 'upcoming' };
  BiddingDetail: { vehicleId: number };
  ChangePassword: undefined;
  BookCar: { vehicle: any };
  MyBookings: undefined; // 2. Add Type Here
  ViewBooking: { vehicleId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MyDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000000',
    card: '#111',
    text: '#fff',
  },
};

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#000' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainAppStack = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000',
        paddingBottom: insets.bottom,
        paddingTop: insets.top
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'slide_from_right',
        }}
      >
        {/* Tab Screens (Fade Animation) */}
        <Stack.Screen
          name="DrawerRoot"
          component={DrawerNavigator}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="FavoritesScreen"
          component={FavoritesScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="MyBookings"
          component={MyBookingsScreen}
          options={{ animation: 'fade' }} // 3. Register Screen Here
        />

        {/* Inner Screens (Slide Animation) */}
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="CarDetailPage" component={CarDetailPage} />
        <Stack.Screen name="LiveAuction" component={LiveCarAuctionScreen} />
        <Stack.Screen name="BiddingDetail" component={BiddingDetailScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="BookCar" component={BookCarScreen} />
        <Stack.Screen name="ViewBooking" component={ViewBookingScreen} />
      </Stack.Navigator>
    </View>
  );
};

const AppNavigator = () => {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return <SplashScreenDark />;
  }

  return (
    <NavigationContainer theme={MyDarkTheme}>
      {userToken ? <MainAppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;