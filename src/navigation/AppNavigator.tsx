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
// MyBookings is in Drawer now
import ViewBookingScreen from '../screens/ViewBookingScreen';
import MyBiddingsScreen from '../screens/MyBiddingsScreen';
import PreferencesListScreen from '../screens/PreferencesListScreen';
import ManagePreferenceScreen from '../screens/ManagePreferenceScreen';
import PaymentReceiptsScreen from '../screens/PaymentReceiptsScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import SellCarInquiryScreen from '../screens/SellCarInquiryScreen';
import AppointmentInquiryScreen from '../screens/AppointmentInquiryScreen';
import ContactInquiryScreen from '../screens/ContactInquiryScreen';
import InquiryTypeScreen from '../screens/InquiryTypeScreen';
// Auctions (HomescreenLight) is in Drawer now

// Navigator
import { DrawerNavigator } from './DrawerNavigator';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  DrawerRoot: undefined; // Contains ListedVehicles, Auctions, MyBookings
  FavoritesScreen: undefined;
  ProfileScreen: undefined;
  EditProfile: undefined;
  CarDetailPage: { carId: number };
  LiveAuction: { carId: number; viewType?: 'live' | 'negotiation' | 'upcoming' };
  // Auctions removed from stack
  BiddingDetail: { vehicleId: number };
  ChangePassword: undefined;
  BookCar: { vehicle: any };
  // MyBookings removed from stack
  ViewBooking: { vehicleId: number };
  MyBiddings: undefined;
  PreferencesList: undefined;
  ManagePreference: { preferenceId?: number; preferenceData?: any };
  Payments: undefined;
  InvoiceDetail: { invoice: any };
  InquiryType: undefined;
  SellCarInquiry: undefined;
  AppointmentInquiry: undefined;
  ContactInquiry: undefined;
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
      gestureEnabled: true,
      gestureDirection: 'horizontal',
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
        }}
      >
        {/* 🟢 GROUP 1: Main Tabs / Drawer Root (Fade Animation) */}
        <Stack.Group screenOptions={{ animation: 'fade' }}>
          <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        </Stack.Group>

        {/* 🟢 GROUP 2: Inner Screens / Details (Slide Animation) */}
        <Stack.Group
          screenOptions={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal'
          }}
        >
          {/* Drawer Items handled as stack for animation */}
          <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
          <Stack.Screen name="MyBiddings" component={MyBiddingsScreen} />
          <Stack.Screen name="Payments" component={PaymentReceiptsScreen} />

          {/* Features */}
          <Stack.Screen name="InquiryType" component={InquiryTypeScreen} />
          <Stack.Screen name="SellCarInquiry" component={SellCarInquiryScreen} />
          <Stack.Screen name="AppointmentInquiry" component={AppointmentInquiryScreen} />
          <Stack.Screen name="ContactInquiry" component={ContactInquiryScreen} />

          {/* Details */}
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="CarDetailPage" component={CarDetailPage} />
          <Stack.Screen name="LiveAuction" component={LiveCarAuctionScreen} />
          <Stack.Screen name="BiddingDetail" component={BiddingDetailScreen} />
          <Stack.Screen name="BookCar" component={BookCarScreen} />
          <Stack.Screen name="ViewBooking" component={ViewBookingScreen} />
          <Stack.Screen name="PreferencesList" component={PreferencesListScreen} />
          <Stack.Screen name="ManagePreference" component={ManagePreferenceScreen} />
          <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />

          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </View>
  );
};

const AppNavigator = () => {
  const { isLoading, userToken, user } = useAuth();

  if (isLoading) {
    return <SplashScreenDark />;
  }

  const isGuest = user && user.id === 0;
  return (
    <NavigationContainer theme={MyDarkTheme}>
      {userToken || isGuest ? <MainAppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;