import React, { useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import CustomAlert from './ui/CustomAlert';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BottomNav = () => {
  // @ts-ignore
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const route = useRoute();

  const [active, setActive] = React.useState<'home' | 'auction' | 'booking' | 'profile'>('home');
  const { user } = useAuth();
  const [showLoginAlert, setShowLoginAlert] = React.useState(false);

  useEffect(() => {
    if (!isFocused) return;

    if (route.name === 'ListedVehicles' || route.name === 'DrawerRoot') {
      setActive('home');
    } else if (route.name === 'Auctions') {
      setActive('auction');
    } else if (route.name === 'MyBookings') {
      setActive('booking');
    } else if (route.name === 'ProfileScreen') {
      setActive('profile');
    }
  }, [isFocused, route.name]);

  const goHome = () => {
    setActive('home');
    // @ts-ignore
    navigation.navigate('DrawerRoot', { screen: 'ListedVehicles' });
  };

  const goAuction = () => {
    setActive('auction');
    // 🟢 Navigate to Auctions inside DrawerRoot
    // @ts-ignore
    navigation.navigate('DrawerRoot', { screen: 'Auctions' });
  };

  const goBooking = () => {
    setActive('booking');
    if (user && user.id === 0) {
      setShowLoginAlert(true);
      return;
    }
    // 🟢 Navigate to MyBookings inside DrawerRoot
    // @ts-ignore
    navigation.navigate('DrawerRoot', { screen: 'MyBookings' });
  };

  const goProfile = () => {
    setActive('profile');
    navigation.navigate('ProfileScreen');
  };

  const getColor = (key: string) => (active === key ? '#cadb2a' : '#ffffff');

  return (
    <>
      <LinearGradient
        colors={['rgba(202,219,42,0)', 'rgba(202,219,42,0.69)']}
        style={styles.bottomGradient}
      >
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={goHome} activeOpacity={0.7}>
            <MaterialCommunityIcons name="car" size={26} color={getColor('home')} />
            <Text style={[styles.navLabel, { color: getColor('home') }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={goAuction} activeOpacity={0.7}>
            <MaterialCommunityIcons name="gavel" size={26} color={getColor('auction')} />
            <Text style={[styles.navLabel, { color: getColor('auction') }]}>Auction</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={goBooking} activeOpacity={0.7}>
            <MaterialCommunityIcons name="tag" size={26} color={getColor('booking')} />
            <Text style={[styles.navLabel, { color: getColor('booking') }]}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={goProfile} activeOpacity={0.7}>
            <Svg width="26" height="26" viewBox="0 0 34 34" fill="none">
              <Path d="M17 17C20.4518 17 23 14.4518 23 11C23 7.54822 20.4518 5 17 5C13.5482 5 11 7.54822 11 11C11 14.4518 13.5482 17 17 17Z" fill={getColor('profile')} />
              <Path d="M17 20C11.9 20 7 23.1 7 27H27C27 23.1 22.1 20 17 20Z" fill={getColor('profile')} />
            </Svg>
            <Text style={[styles.navLabel, { color: getColor('profile') }]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <CustomAlert
        visible={showLoginAlert}
        title="Please Login"
        message="Create an account or login to Caartl to use all features."
        onClose={() => setShowLoginAlert(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    justifyContent: 'flex-end',
  },
  bottomNav: {
    marginHorizontal: 15,
    height: 70,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  navItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    fontFamily: 'Poppins',
    marginTop: 4,
    fontWeight: '500',
  }
});