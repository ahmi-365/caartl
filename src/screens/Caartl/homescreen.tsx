import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Imports
import { CarCard } from '../../components/CarCard';
import { TopBar } from '../../components/TopBar';
import { BottomNav } from '../../components/BottomNavigation';
import { FilterPopup } from '../../components/FilterPopup';
import { RootStackParamList } from '../../navigation/AppNavigator';
import apiService from '../../services/ApiService';
import * as Models from '../../data/modal';
import { useAlert } from '../../context/AlertContext';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomescreenLight = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'negotiations'>('live');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  // Data State
  const [auctions, setAuctions] = useState<Models.Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------------------------------------------- */
  /* Data Fetching                                        */
  /* ---------------------------------------------------- */
  const fetchAuctions = useCallback(async () => {
    try {
      // Fetching 50 to ensure we have enough data for client-side filtering
      const result = await apiService.getAuctions(50);
      if (result.success && result.data.data.data) {
        setAuctions(result.data.data.data);
      } else {
        console.log("Failed to fetch auctions");
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAuctions();
  };

  /* ---------------------------------------------------- */
  /* Filtering Logic                                      */
  /* ---------------------------------------------------- */

  // Helper to safely parse dates (handles "YYYY-MM-DD HH:mm:ss" strings)
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    return new Date(dateStr.replace(' ', 'T'));
  };

  const getFilteredAuctions = () => {
    const now = new Date();

    return auctions.filter((car) => {
      // 1. Search Filter
      if (searchText) {
        const query = searchText.toLowerCase();
        const matchesTitle = car.title?.toLowerCase().includes(query);
        const matchesBrand = car.brand?.name?.toLowerCase().includes(query);
        const matchesModel = car.vehicle_model?.name?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesBrand && !matchesModel) return false;
      }

      // 2. Tab Filter based on Dates
      const startDate = parseDate(car.auction_start_date);
      const endDate = parseDate(car.auction_end_date);

      // Ensure status is published for both tabs
      if (car.status !== 'published') return false;

      if (activeTab === 'live') {
        // Live: Started (start <= now) AND Not Ended (end >= now)
        // Note: You might want to include logic to hide expired items
        return now >= startDate && now <= endDate;
      }

      if (activeTab === 'upcoming') {
        // Upcoming: Starts in the future (start > now)
        return now < startDate;
      }

      if (activeTab === 'negotiations') {
        // Placeholder logic for negotiations
        return false;
      }

      return true;
    });
  };

  const filteredData = getFilteredAuctions();

  /* ---------------------------------------------------- */
  /* Helpers & Handlers                                   */
  /* ---------------------------------------------------- */

  // Fixes the type mismatch error
  const getCardVariant = (tab: string): 'live' | 'upcoming' | 'negotiation' => {
    if (tab === 'negotiations') return 'negotiation';
    return tab as 'live' | 'upcoming';
  };

  const handleMenuPress = () => alert('Menu button pressed');
  const handleNotificationPress = () => alert('You have 3 new notifications');
  const handleSearchPress = () => console.log(`Searching for: ${searchText}`);

  const handleTabPress = (tabId: 'live' | 'upcoming' | 'negotiations') => {
    setActiveTab(tabId);
  };

  const handleCarPress = (car: Models.Vehicle) => {
    navigation.navigate('CarDetailPage', { carId: car.id });
  };

  const applyFilters = (filters: any) => {
    console.log('Applied filters ->', filters);
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
        contentContainerStyle={{ paddingTop: 120, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#cadb2a" />
        }
      >
        {/* ==== SEARCH BAR + FILTER ICON ==== */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Circle cx="11" cy="11" r="8" stroke="#8c9199" strokeWidth="2" />
              <Path d="M21 21L16.65 16.65" stroke="#8c9199" strokeWidth="2" strokeLinecap="round" />
            </Svg>

            <TextInput
              placeholder="Search for Honda Pilot..."
              placeholderTextColor="#8c9199"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchPress}
            />

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
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive,
              ]}
              onPress={() => handleTabPress(tab.id as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ==== CAR CARDS ==== */}
        <View style={styles.contentContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#cadb2a" style={{ marginTop: 50 }} />
          ) : filteredData.length > 0 ? (
            filteredData.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onPress={handleCarPress}
                variant={getCardVariant(activeTab)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No {activeTab} auctions found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ==== FILTER POPUP ==== */}
      <FilterPopup
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={applyFilters}
      />

      <BottomNav />
    </View>
  );
};

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
    fontSize: 14,
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
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: { backgroundColor: '#cadb2a' },
  tabButtonInactive: { backgroundColor: '#121212' },
  tabText: { fontFamily: 'Poppins', fontWeight: '500', fontSize: 14 },
  tabTextActive: { color: '#010101' },
  tabTextInactive: { color: '#ffffff' },
  contentContainer: { paddingHorizontal: 26 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyStateText: { color: '#8c9199', fontFamily: 'Poppins', fontSize: 16 },
});





// import React, { useState } from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
//   TouchableOpacity,
// } from 'react-native';
// import Svg, { Path, Circle } from 'react-native-svg';
// import { useNavigation } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// import { CarCard } from '../../components/CarCard';
// import { CarData, carsData } from '../../data/data';
// import { TopBar } from '../../components/TopBar';
// import { BottomNav } from '../../components/BottomNavigation';
// import { FilterPopup } from '../../components/FilterPopup';
// import { RootStackParamList } from '../../navigation/AppNavigator';

// type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// export const HomescreenLight = () => {
//   const navigation = useNavigation<HomeNavigationProp>();

//   const [activeTab, setActiveTab] = useState('live');
//   const [activeNavItem, setActiveNavItem] = useState('home');
//   const [searchText, setSearchText] = useState('');
//   const [filterVisible, setFilterVisible] = useState(false);

//   /* ---------------------------------------------------- */
//   /* Handlers                                            */
//   /* ---------------------------------------------------- */
//   const handleMenuPress = () => alert('Menu button pressed');
//   const handleNotificationPress = () => alert('You have 3 new notifications');
//   const handleSearchPress = () => alert(`Searching for: ${searchText || 'Honda Pilot 7-Passenger'}`);
//   const handleTabPress = (tabId: string) => setActiveTab(tabId);
//   const handleNavPress = (navId: string) => {
//     setActiveNavItem(navId);
//     alert(`${navId} pressed`);
//   };

//   const handleCarPress = (car: CarData) => {
//     navigation.navigate('LiveAuction');
//   };

//   const applyFilters = (filters: any) => {
//     console.log('Applied filters ->', filters);
//     // TODO: filter `carsData` here
//   };

//   /* ---------------------------------------------------- */
//   /* Main UI                                            */
//   /* ---------------------------------------------------- */
//   return (
//     <View style={styles.container}>
//       <TopBar onMenuPress={handleMenuPress} onNotificationPress={handleNotificationPress} />

//       <ScrollView
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingTop: 120 }}
//       >
//         {/* ==== SEARCH BAR + FILTER ICON ==== */}
//         <View style={styles.searchContainer}>
//           <View style={styles.searchBar}>
//             <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <Circle cx="11" cy="11" r="8" stroke="#8c9199" strokeWidth="2" />
//               <Path d="M21 21L16.65 16.65" stroke="#8c9199" strokeWidth="2" strokeLinecap="round" />
//             </Svg>

//             <TextInput
//               placeholder="Search for Honda Pilot 7-Passenger"
//               placeholderTextColor="#8c9199"
//               style={styles.searchInput}
//               value={searchText}
//               onChangeText={setSearchText}
//               onSubmitEditing={handleSearchPress}
//             />

//             {/* FILTER ICON */}
//             <TouchableOpacity onPress={() => setFilterVisible(true)}>
//               <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
//                 <Path d="M14 17H5" stroke="#8c9199" strokeWidth={2} strokeLinecap="round" />
//                 <Path d="M19 7h-9" stroke="#8c9199" strokeWidth={2} strokeLinecap="round" />
//                 <Circle cx={17} cy={17} r={3} stroke="#8c9199" strokeWidth={2} />
//                 <Circle cx={7} cy={7} r={3} stroke="#8c9199" strokeWidth={2} />
//               </Svg>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* ==== TAB NAVIGATION ==== */}
//         <View style={styles.tabContainer}>
//           {[
//             { id: 'live', label: 'Live' },
//             { id: 'upcoming', label: 'Upcoming' },
//             { id: 'negotiations', label: 'Negotiations' },
//           ].map((tab) => (
//             <View
//               key={tab.id}
//               style={[
//                 styles.tabButton,
//                 activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.tabText,
//                   activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive,
//                 ]}
//                 onPress={() => handleTabPress(tab.id)}
//               >
//                 {tab.label}
//               </Text>
//             </View>
//           ))}
//         </View>

//         {/* ==== CAR CARDS ==== */}
//         <View style={styles.contentContainer}>
//           {carsData.map((car) => (
//             <CarCard
//               key={car.id}
//               car={car}
//               onPress={handleCarPress}
//               variant={
//                 activeTab === 'negotiations'
//                   ? 'negotiation'
//                   : activeTab === 'upcoming'
//                     ? 'upcoming'
//                     : 'live'
//               }
//             />
//           ))}
//         </View>

//         <View style={{ height: 120 }} />
//       </ScrollView>

//       {/* ==== FILTER POPUP ==== */}
//       <FilterPopup
//         visible={filterVisible}
//         onClose={() => setFilterVisible(false)}
//         onApply={applyFilters}
//       />

//       {/* ==== BOTTOM NAV ==== */}
//       <BottomNav />
//     </View>
//   );
// };

// /* ------------------------------------------------------------------ */
// /* Styles                                                             */
// /* ------------------------------------------------------------------ */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000000' },
//   scrollView: { flex: 1 },
//   searchContainer: { paddingHorizontal: 26, marginBottom: 24 },
//   searchBar: {
//     height: 59,
//     backgroundColor: '#edeeef',
//     borderRadius: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 31,
//     justifyContent: 'space-between',
//   },
//   searchInput: {
//     flex: 1,
//     fontFamily: 'Poppins',
//     fontSize: 8,
//     color: '#000000',
//     marginHorizontal: 12,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     gap: 6,
//     paddingHorizontal: 29,
//     marginBottom: 24,
//   },
//   tabButton: {
//     height: 37,
//     borderRadius: 5,
//     paddingHorizontal: 7,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tabButtonActive: { backgroundColor: '#cadb2a' },
//   tabButtonInactive: { backgroundColor: '#121212' },
//   tabText: { fontFamily: 'Poppins', fontWeight: '500', fontSize: 16 },
//   tabTextActive: { color: '#010101' },
//   tabTextInactive: { color: '#ffffff' },
//   contentContainer: { paddingHorizontal: 26 },
// });