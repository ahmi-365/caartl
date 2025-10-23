import React, { useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../navigation/AppNavigator';

/* ------------------------------------------------------------------ */
type NavProp = BottomTabNavigationProp<RootStackParamList>;
/* ------------------------------------------------------------------ */

export const BottomNav = () => {
  const navigation = useNavigation<NavProp>();
  const isFocused = useIsFocused();

  const [active, setActive] = React.useState<'home' | 'favorites' | 'profile'>('home');

  /* -------------------------------------------------------------- */
  /*  Sync active state with current route                          */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!isFocused) return;

    const state = navigation.getState();
    const currentRouteName = state.routes[state.index]?.name;

    if (currentRouteName === 'Home') setActive('home');
    else if (currentRouteName === 'FavoritesScreen') setActive('favorites');
    else if (currentRouteName === 'ProfileScreen') setActive('profile');
  }, [isFocused, navigation]);

  const go = (screen: keyof RootStackParamList, id: 'home' | 'favorites' | 'profile') => {
    setActive(id);
    navigation.navigate(screen);
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
          onPress={() => go('Home', 'home')}
          activeOpacity={0.7}
        >
          <Svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <Path
              d="M17 3L3 14V31H13V21H21V31H31V14L17 3Z"
              fill={active === 'home' ? '#cadb2a' : '#ffffff'}
              stroke={active === 'home' ? '#cadb2a' : '#ffffff'}
              strokeWidth="1"
            />
          </Svg>
        </TouchableOpacity>

        {/* ---------- FAVORITES ---------- */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => go('FavoritesScreen', 'favorites')}
          activeOpacity={0.7}
        >
          <Svg width="34" height="34" viewBox="0 0 34 34" fill="none">
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
          onPress={() => go('ProfileScreen', 'profile')}
          activeOpacity={0.7}
        >
          <Svg width="34" height="34" viewBox="0 0 34 34" fill="none">
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

/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  bottomNav: {
    marginHorizontal: 24,
    height: 55,
    backgroundColor: 'rgba(0,0,0,0.79)',
    borderRadius: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    marginBottom: 10,
  },
  navItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});