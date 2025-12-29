import React, { useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BottomNav = () => {
  // @ts-ignore
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const route = useRoute();

  const [active, setActive] = React.useState<'home' | 'booking' | 'favorites' | 'profile'>('home');

  useEffect(() => {
    if (!isFocused) return;

    if (route.name === 'HomeTab' || route.name === 'DrawerRoot') {
      setActive('home');
    } else if (route.name === 'MyBookings') {
      setActive('booking');
    } else if (route.name === 'FavoritesScreen') {
      setActive('favorites');
    } else if (route.name === 'ProfileScreen') {
      setActive('profile');
    }
  }, [isFocused, route.name]);

  const goHome = () => {
    setActive('home');
    // 🟢 FIX: Explicitly navigate to 'HomeTab' inside 'DrawerRoot'
    // @ts-ignore
    navigation.navigate('DrawerRoot', { screen: 'HomeTab' });
  };

  const goBooking = () => {
    setActive('booking');
    // @ts-ignore
    navigation.navigate('DrawerRoot', { screen: 'MyBookings' });
  };

  const goFavorites = () => {
    setActive('favorites');
    navigation.navigate('FavoritesScreen');
  };

  const goProfile = () => {
    setActive('profile');
    navigation.navigate('ProfileScreen');
  };

  return (
    <LinearGradient
      colors={['rgba(202,219,42,0)', 'rgba(202,219,42,0.69)']}
      style={styles.bottomGradient}
    >
      <View style={styles.bottomNav}>
        {/* ---------- HOME ---------- */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={goHome}
          activeOpacity={0.7}
        >
          <Svg width="30" height="30" viewBox="0 0 34 34" fill="none">
            <Path
              d="M17 3L3 14V31H13V21H21V31H31V14L17 3Z"
              fill={active === 'home' ? '#cadb2a' : '#ffffff'}
              stroke={active === 'home' ? '#cadb2a' : '#ffffff'}
              strokeWidth="1"
            />
          </Svg>
        </TouchableOpacity>

        {/* ---------- BOOKINGS (NEW ICON) ---------- */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={goBooking}
          activeOpacity={0.7}
        >
          {/* Swapped to a Calendar Event Icon */}
          <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM12 13H17V18H12V13Z"
              fill={active === 'booking' ? '#cadb2a' : '#ffffff'}
            />
          </Svg>
        </TouchableOpacity>

        {/* ---------- FAVORITES ---------- */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={goFavorites}
          activeOpacity={0.7}
        >
          <Svg width="30" height="30" viewBox="0 0 34 34" fill="none">
            <Path
              d="M17 28.5L14.7 26.4C7.4 19.72 3 15.78 3 10.95C3 7.01 6.01 4 9.95 4C12.13 4 14.22 5.02 15.65 6.64H18.35C19.78 5.02 21.87 4 24.05 4C27.99 4 31 7.01 31 10.95C31 15.78 26.6 19.72 19.3 26.4L17 28.5Z"
              fill={active === 'favorites' ? '#cadb2a' : 'none'}
              stroke={active === 'favorites' ? '#cadb2a' : '#ffffff'}
              strokeWidth="2"
            />
          </Svg>
        </TouchableOpacity>

        {/* ---------- PROFILE ---------- */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={goProfile}
          activeOpacity={0.7}
        >
          <Svg width="30" height="30" viewBox="0 0 34 34" fill="none">
            <Path
              d="M17 17C20.4518 17 23 14.4518 23 11C23 7.54822 20.4518 5 17 5C13.5482 5 11 7.54822 11 11C11 14.4518 13.5482 17 17 17Z"
              fill={active === 'profile' ? '#cadb2a' : '#ffffff'}
            />
            <Path
              d="M17 20C11.9 20 7 23.1 7 27H27C27 23.1 22.1 20 17 20Z"
              fill={active === 'profile' ? '#cadb2a' : '#ffffff'}
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',

  },
  bottomNav: {
    marginHorizontal: 24,
    height: 55,
    backgroundColor: 'rgba(0,0,0,0.79)',
    borderRadius: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  navItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});