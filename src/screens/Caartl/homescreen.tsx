import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Text,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation, useFocusEffect, DrawerActions } from '@react-navigation/native';
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
import { Feather } from '@expo/vector-icons';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FilterState {
  condition?: string;
  make?: string;
  model?: string;
  make_id?: number;
  vehicle_model_id?: number;
  year?: number;
  min_price?: number;
  max_price?: number;
}

export const HomescreenLight = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'negotiations'>('live');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter State
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  // Data State
  const [auctions, setAuctions] = useState<Models.Vehicle[]>([]);
  const [favoritesIds, setFavoritesIds] = useState<Set<number>>(new Set());

  // Loading & Pagination State
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ------------------------------------------------------------------
  // API Call
  // ------------------------------------------------------------------
  const fetchAuctions = async (pageNumber: number, isRefresh = false, searchVal = searchText, filters = activeFilters) => {
    if (loadingMore && !isRefresh) return;

    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const queryParams = {
        search: searchVal,
        ...filters
      };

      const result = await apiService.getAuctions(10, pageNumber, queryParams as any);

      if (result.success && result.data.data) {
        const newVehicles = result.data.data.data;
        const currentPage = result.data.data.current_page;
        const lastPage = result.data.data.last_page;

        setHasMore(currentPage < lastPage);

        if (isRefresh || pageNumber === 1) {
          setAuctions(newVehicles);
        } else {
          setAuctions(prev => [...prev, ...newVehicles]);
        }
      } else {
        if (pageNumber === 1) setAuctions([]);
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuctions(1);
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const res = await apiService.getFavorites();
    if (res.success && Array.isArray(res.data.data)) {
      setFavoritesIds(new Set(res.data.data.map(v => v.id)));
    }
  };

  useFocusEffect(
    useCallback(() => {
      apiService.getFavorites().then(res => {
        if (res.success && res.data.data) {
          setFavoritesIds(new Set(res.data.data.map(v => v.id)));
        }
      });
    }, [])
  );

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchAuctions(1, true, searchText, activeFilters);
    fetchFavorites();
  };

  const handleLoadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAuctions(nextPage, false, searchText, activeFilters);
    }
  };

  const handleSearchSubmit = () => {
    setPage(1);
    setHasMore(true);
    fetchAuctions(1, true, searchText, activeFilters);
  };

  const applyFilters = (newFilters: FilterState) => {
    console.log('Applying Filters:', newFilters);
    setActiveFilters(newFilters);
    setPage(1);
    setHasMore(true);
    setAuctions([]);
    fetchAuctions(1, true, searchText, newFilters);
  };

  const clearAllFilters = () => {
    setSearchText('');
    const emptyFilters = {};
    setActiveFilters(emptyFilters);
    setPage(1);
    setHasMore(true);
    fetchAuctions(1, true, '', emptyFilters);
  };

  const removeFilter = (key: keyof FilterState) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];

    // Clean up paired keys
    if (key === 'make') delete newFilters['make_id'];
    if (key === 'model') delete newFilters['vehicle_model_id'];

    applyFilters(newFilters);
  };

  const handleMenuPress = () => navigation.dispatch(DrawerActions.openDrawer());
  const handleNotificationPress = () => alert('Notifications');
  const handleTabPress = (tabId: any) => setActiveTab(tabId);

  const handleCarPress = (car: Models.Vehicle) => {
    if (activeTab === 'live') navigation.navigate('LiveAuction', { carId: car.id });
    else navigation.navigate('CarDetailPage', { carId: car.id });
  };

  const handleToggleFavorite = async (car: Models.Vehicle) => {
    const isFav = favoritesIds.has(car.id);
    const newSet = new Set(favoritesIds);
    isFav ? newSet.delete(car.id) : newSet.add(car.id);
    setFavoritesIds(newSet);
    try { await apiService.toggleFavorite(car.id); } catch (e) { setFavoritesIds(favoritesIds); }
  };

  const getCardVariant = (tab: string) => (tab === 'negotiations' ? 'negotiation' : tab as any);

  // --- Render Helper ---
  const getDisplayData = () => {
    const now = new Date();
    return auctions.filter(car => {
      const start = new Date(car.auction_start_date.replace(' ', 'T'));
      const end = new Date(car.auction_end_date.replace(' ', 'T'));

      if (activeTab === 'live') return now >= start && now <= end;
      if (activeTab === 'upcoming') return now < start;
      return true;
    });
  };

  const displayData = getDisplayData();

  // Helper: Filter valid keys for display
  const activeFilterKeys = Object.entries(activeFilters).filter(([key, val]) => {
    // Exclude IDs, null/undefined, and empty strings
    return val !== null && val !== undefined && val !== '' && !key.includes('_id');
  });
  const hasActiveFilters = searchText.length > 0 || activeFilterKeys.length > 0;

  return (
    <View style={styles.container}>
      <TopBar onMenuPress={handleMenuPress} onNotificationPress={handleNotificationPress} />

      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CarCard
            car={item}
            onPress={handleCarPress}
            variant={getCardVariant(activeTab)}
            isFavorite={favoritesIds.has(item.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}

        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#cadb2a" />
        }

        ListHeaderComponent={
          <>
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Circle cx="11" cy="11" r="8" stroke="#8c9199" strokeWidth="2" /><Path d="M21 21L16.65 16.65" stroke="#8c9199" strokeWidth="2" strokeLinecap="round" /></Svg>
                <TextInput
                  placeholder="Search..."
                  placeholderTextColor="#8c9199"
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={setSearchText}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                />
                <TouchableOpacity onPress={() => setFilterVisible(true)}>
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M14 17H5" stroke="#8c9199" strokeWidth={2} strokeLinecap="round" /><Path d="M19 7h-9" stroke="#8c9199" strokeWidth={2} strokeLinecap="round" /><Circle cx={17} cy={17} r={3} stroke="#8c9199" strokeWidth={2} /><Circle cx={7} cy={7} r={3} stroke="#8c9199" strokeWidth={2} /></Svg>
                </TouchableOpacity>
              </View>
            </View>

            {/* 🟢 Active Filters Section */}
            {hasActiveFilters && (
              <View style={styles.activeFiltersContainer}>
                <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllButton}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  {searchText ? (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>"{searchText}"</Text>
                      <TouchableOpacity onPress={() => { setSearchText(''); handleSearchSubmit(); }}>
                        <Feather name="x" size={14} color="#000" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {activeFilterKeys.map(([key, value]) => {
                    // Format Label
                    let label = key.replace('_', ' ');
                    label = label.charAt(0).toUpperCase() + label.slice(1);

                    // Format Condition value (capitalize)
                    let displayValue = value;
                    if (key === 'condition' && typeof value === 'string') {
                      displayValue = value.charAt(0).toUpperCase() + value.slice(1);
                    }

                    return (
                      <View key={key} style={styles.filterChip}>
                        <Text style={styles.filterChipText}>{label}: {displayValue}</Text>
                        <TouchableOpacity onPress={() => removeFilter(key as keyof FilterState)}>
                          <Feather name="x" size={14} color="#000" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={styles.tabContainer}>
              {['live', 'upcoming', 'negotiations'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                  onPress={() => handleTabPress(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }

        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color="#cadb2a" style={{ marginVertical: 20 }} /> : <View style={{ height: 100 }} />
        }

        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No vehicles found.</Text>
            </View>
          ) : null
        }
      />

      <FilterPopup
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={applyFilters}
        currentFilters={activeFilters} // 👈 Pass current filters to popup
      />

      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  listContent: { paddingTop: 120, paddingHorizontal: 26 },
  searchContainer: { marginBottom: 15 },
  searchBar: { height: 59, backgroundColor: '#edeeef', borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, justifyContent: 'space-between' },
  searchInput: { flex: 1, fontFamily: 'Poppins', fontSize: 14, color: '#000000', marginHorizontal: 12 },

  // Filter Chips Styles
  activeFiltersContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, height: 30 },
  clearAllButton: { marginRight: 10, paddingVertical: 5 },
  clearAllText: { color: '#cadb2a', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600', textDecorationLine: 'underline' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#cadb2a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 8 },
  filterChipText: { color: '#000', fontSize: 11, fontFamily: 'Poppins', fontWeight: '600' },

  tabContainer: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  tabButton: { height: 37, borderRadius: 5, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  tabButtonActive: { backgroundColor: '#cadb2a' },
  tabText: { fontFamily: 'Poppins', fontWeight: '500', fontSize: 14, color: '#ffffff' },
  activeTabText: { color: '#010101' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyStateText: { color: '#8c9199', fontFamily: 'Poppins', fontSize: 16 },
});


// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import Svg, { Path, Circle } from 'react-native-svg';
// import { useNavigation, useFocusEffect, DrawerActions } from '@react-navigation/native'; // 👈 Import DrawerActions
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// // Imports
// import { CarCard } from '../../components/CarCard';
// import { TopBar } from '../../components/TopBar';
// import { BottomNav } from '../../components/BottomNavigation';
// import { FilterPopup } from '../../components/FilterPopup';
// import { RootStackParamList } from '../../navigation/AppNavigator';
// import apiService from '../../services/ApiService';
// import * as Models from '../../data/modal';
// import { useAlert } from '../../context/AlertContext';

// type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// export const HomescreenLight = () => {
//   const navigation = useNavigation<HomeNavigationProp>();
//   const { showAlert } = useAlert();

//   const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'negotiations'>('live');
//   const [searchText, setSearchText] = useState('');
//   const [filterVisible, setFilterVisible] = useState(false);

//   // Data State
//   const [auctions, setAuctions] = useState<Models.Vehicle[]>([]);
//   const [favoritesIds, setFavoritesIds] = useState<Set<number>>(new Set());
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   /* ---------------------------------------------------- */
//   /* Data Fetching                                        */
//   /* ---------------------------------------------------- */
//   const fetchData = useCallback(async () => {
//     try {
//       const result = await apiService.getAuctions(50);
//       if (result.success && result.data.data.data) {
//         setAuctions(result.data.data.data);
//       }

//       const favoritesResult = await apiService.getFavorites();
//       if (favoritesResult.success && Array.isArray(favoritesResult.data.data)) {
//         const ids = new Set(favoritesResult.data.data.map(v => v.id));
//         setFavoritesIds(ids);
//       }

//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   useFocusEffect(
//     useCallback(() => {
//       apiService.getFavorites().then(res => {
//         if (res.success && res.data.data) {
//           setFavoritesIds(new Set(res.data.data.map(v => v.id)));
//         }
//       });
//     }, [])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchData();
//   };

//   /* ---------------------------------------------------- */
//   /* Filtering Logic                                      */
//   /* ---------------------------------------------------- */
//   const parseDate = (dateStr: string) => {
//     if (!dateStr) return new Date();
//     return new Date(dateStr.replace(' ', 'T'));
//   };

//   const getFilteredAuctions = () => {
//     const now = new Date();

//     return auctions.filter((car) => {
//       if (searchText) {
//         const query = searchText.toLowerCase();
//         const matchesTitle = car.title?.toLowerCase().includes(query);
//         const matchesBrand = car.brand?.name?.toLowerCase().includes(query);
//         const matchesModel = car.vehicle_model?.name?.toLowerCase().includes(query);

//         if (!matchesTitle && !matchesBrand && !matchesModel) return false;
//       }

//       const startDate = parseDate(car.auction_start_date);
//       const endDate = parseDate(car.auction_end_date);

//       if (car.status !== 'published') return false;

//       if (activeTab === 'live') {
//         return now >= startDate && now <= endDate;
//       }

//       if (activeTab === 'upcoming') {
//         return now < startDate;
//       }

//       if (activeTab === 'negotiations') {
//         return false;
//       }

//       return true;
//     });
//   };

//   const filteredData = getFilteredAuctions();

//   /* ---------------------------------------------------- */
//   /* Handlers                                            */
//   /* ---------------------------------------------------- */

//   const getCardVariant = (tab: string): 'live' | 'upcoming' | 'negotiation' => {
//     if (tab === 'negotiations') return 'negotiation';
//     return tab as 'live' | 'upcoming';
//   };

//   // 👈 FIXED: Open Drawer instead of alert
//   const handleMenuPress = () => {
//     navigation.dispatch(DrawerActions.openDrawer());
//   };

//   const handleNotificationPress = () => alert('You have 3 new notifications');
//   const handleSearchPress = () => console.log(`Searching for: ${searchText}`);

//   const handleTabPress = (tabId: 'live' | 'upcoming' | 'negotiations') => {
//     setActiveTab(tabId);
//   };

//   const handleCarPress = (car: Models.Vehicle) => {
//     navigation.navigate('CarDetailPage', { carId: car.id });
//   };

//   const handleToggleFavorite = async (car: Models.Vehicle) => {
//     const isFav = favoritesIds.has(car.id);
//     const newSet = new Set(favoritesIds);
//     if (isFav) {
//       newSet.delete(car.id);
//     } else {
//       newSet.add(car.id);
//     }
//     setFavoritesIds(newSet);

//     try {
//       await apiService.toggleFavorite(car.id);
//     } catch (error) {
//       console.error("Failed to toggle favorite", error);
//       setFavoritesIds(favoritesIds);
//     }
//   };

//   const applyFilters = (filters: any) => {
//     console.log('Applied filters ->', filters);
//   };

//   return (
//     <View style={styles.container}>
//       <TopBar onMenuPress={handleMenuPress} onNotificationPress={handleNotificationPress} />

//       <ScrollView
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingTop: 120, paddingBottom: 100 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#cadb2a" />
//         }
//       >
//         <View style={styles.searchContainer}>
//           <View style={styles.searchBar}>
//             <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <Circle cx="11" cy="11" r="8" stroke="#8c9199" strokeWidth="2" />
//               <Path d="M21 21L16.65 16.65" stroke="#8c9199" strokeWidth="2" strokeLinecap="round" />
//             </Svg>

//             <TextInput
//               placeholder="Search for Honda Pilot..."
//               placeholderTextColor="#8c9199"
//               style={styles.searchInput}
//               value={searchText}
//               onChangeText={setSearchText}
//               onSubmitEditing={handleSearchPress}
//             />

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

//         <View style={styles.tabContainer}>
//           {[
//             { id: 'live', label: 'Live' },
//             { id: 'upcoming', label: 'Upcoming' },
//             { id: 'negotiations', label: 'Negotiations' },
//           ].map((tab) => (
//             <TouchableOpacity
//               key={tab.id}
//               style={[
//                 styles.tabButton,
//                 activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive,
//               ]}
//               onPress={() => handleTabPress(tab.id as any)}
//             >
//               <Text
//                 style={[
//                   styles.tabText,
//                   activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive,
//                 ]}
//               >
//                 {tab.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View style={styles.contentContainer}>
//           {loading ? (
//             <ActivityIndicator size="large" color="#cadb2a" style={{ marginTop: 50 }} />
//           ) : filteredData.length > 0 ? (
//             filteredData.map((car) => (
//               <CarCard
//                 key={car.id}
//                 car={car}
//                 onPress={handleCarPress}
//                 variant={getCardVariant(activeTab)}
//                 isFavorite={favoritesIds.has(car.id)}
//                 onToggleFavorite={handleToggleFavorite}
//               />
//             ))
//           ) : (
//             <View style={styles.emptyState}>
//               <Text style={styles.emptyStateText}>No {activeTab} auctions found.</Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>

//       <FilterPopup
//         visible={filterVisible}
//         onClose={() => setFilterVisible(false)}
//         onApply={applyFilters}
//       />

//       <BottomNav />
//     </View>
//   );
// };

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
//   searchInput: { flex: 1, fontFamily: 'Poppins', fontSize: 14, color: '#000000', marginHorizontal: 12 },
//   tabContainer: { flexDirection: 'row', gap: 6, paddingHorizontal: 29, marginBottom: 24 },
//   tabButton: { height: 37, borderRadius: 5, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
//   tabButtonActive: { backgroundColor: '#cadb2a' },
//   tabButtonInactive: { backgroundColor: '#121212' },
//   tabText: { fontFamily: 'Poppins', fontWeight: '500', fontSize: 14 },
//   tabTextActive: { color: '#010101' },
//   tabTextInactive: { color: '#ffffff' },
//   contentContainer: { paddingHorizontal: 26 },
//   emptyState: { alignItems: 'center', marginTop: 50 },
//   emptyStateText: { color: '#8c9199', fontFamily: 'Poppins', fontSize: 16 },
// });