import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CarCard } from '../../components/CarCard';
import { CarData, carsData } from '../../data/data';
import { TopBar } from '../../components/TopBar';
import { BottomNav } from '../../components/BottomNavigation';
import { FilterPopup } from '../../components/FilterPopup';
import { RootStackParamList } from '../../navigation/AppNavigator';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomescreenLight = () => {
  const navigation = useNavigation<HomeNavigationProp>();

  const [activeTab, setActiveTab] = useState('live');
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  /* ---------------------------------------------------- */
  /* Handlers                                            */
  /* ---------------------------------------------------- */
  const handleMenuPress = () => alert('Menu button pressed');
  const handleNotificationPress = () => alert('You have 3 new notifications');
  const handleSearchPress = () => alert(`Searching for: ${searchText || 'Honda Pilot 7-Passenger'}`);
  const handleTabPress = (tabId: string) => setActiveTab(tabId);
  const handleNavPress = (navId: string) => {
    setActiveNavItem(navId);
    alert(`${navId} pressed`);
  };

  const handleCarPress = (car: CarData) => {
    navigation.navigate('LiveAuction');
  };

  const applyFilters = (filters: any) => {
    console.log('Applied filters ->', filters);
    // TODO: filter `carsData` here
  };

  /* ---------------------------------------------------- */
  /* Main UI                                            */
  /* ---------------------------------------------------- */
  return (
    <View style={styles.container}>
      <TopBar onMenuPress={handleMenuPress} onNotificationPress={handleNotificationPress} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 120 }}
      >
        {/* ==== SEARCH BAR + FILTER ICON ==== */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Circle cx="11" cy="11" r="8" stroke="#8c9199" strokeWidth="2" />
              <Path d="M21 21L16.65 16.65" stroke="#8c9199" strokeWidth="2" strokeLinecap="round" />
            </Svg>

            <TextInput
              placeholder="Search for Honda Pilot 7-Passenger"
              placeholderTextColor="#8c9199"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchPress}
            />

            {/* FILTER ICON */}
            <TouchableOpacity onPress={() => setFilterVisible(true)}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M14 17H5" stroke="#8c9199" strokeWidth={2} strokeLinecap="round" />
                <Path d="M19 7h-9" stroke="#8c9199" strokeWidth={2} strokeLinecap="round" />
                <Circle cx={17} cy={17} r={3} stroke="#8c9199" strokeWidth={2} />
                <Circle cx={7} cy={7} r={3} stroke="#8c9199" strokeWidth={2} />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* ==== TAB NAVIGATION ==== */}
        <View style={styles.tabContainer}>
          {[
            { id: 'live', label: 'Live' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'negotiations', label: 'Negotiations' },
          ].map((tab) => (
            <View
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive,
                ]}
                onPress={() => handleTabPress(tab.id)}
              >
                {tab.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ==== CAR CARDS ==== */}
        <View style={styles.contentContainer}>
          {carsData.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onPress={handleCarPress}
              variant={
                activeTab === 'negotiations'
                  ? 'negotiation'
                  : activeTab === 'upcoming'
                  ? 'upcoming'
                  : 'live'
              }
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ==== FILTER POPUP ==== */}
      <FilterPopup
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={applyFilters}
      />

      {/* ==== BOTTOM NAV ==== */}
      <BottomNav  />
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  searchContainer: { paddingHorizontal: 26, marginBottom: 24 },
  searchBar: {
    height: 59,
    backgroundColor: '#edeeef',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 31,
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: 8,
    color: '#000000',
    marginHorizontal: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 29,
    marginBottom: 24,
  },
  tabButton: {
    height: 37,
    borderRadius: 5,
    paddingHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: { backgroundColor: '#cadb2a' },
  tabButtonInactive: { backgroundColor: '#121212' },
  tabText: { fontFamily: 'Poppins', fontWeight: '500', fontSize: 16 },
  tabTextActive: { color: '#010101' },
  tabTextInactive: { color: '#ffffff' },
  contentContainer: { paddingHorizontal: 26 },
});