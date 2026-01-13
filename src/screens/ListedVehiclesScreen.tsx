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
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';

// Imports
import { CarCard } from '../components/CarCard';
import { TopBar } from '../components/TopBar';
import { BottomNav } from '../components/BottomNavigation';
import { FilterPopup } from '../components/FilterPopup';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiService from '../services/ApiService';
import * as Models from '../data/modal';
import { useAlert } from '../context/AlertContext';

type ListedScreenProp = NativeStackNavigationProp<RootStackParamList>;

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

export default function ListedVehiclesScreen() {
    const navigation = useNavigation<ListedScreenProp>();
    const { showAlert } = useAlert();

    const [searchText, setSearchText] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FilterState>({});

    const [vehicles, setVehicles] = useState<Models.Vehicle[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // ------------------------------------------------------------------
    // 1. Fetch Favorites (to know status)
    // ------------------------------------------------------------------
    const fetchFavorites = async () => {
        try {
            const result = await apiService.getFavorites();
            if (result.success && Array.isArray(result.data.data)) {
                const ids = result.data.data.map(v => v.id);
                setFavoriteIds(ids);
            }
        } catch (error) {
            console.error("Error fetching favorites", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );

    // ------------------------------------------------------------------
    // 2. Fetch Listed Vehicles
    // ------------------------------------------------------------------
    const fetchListed = async (pageNumber: number, isRefresh = false, searchVal = searchText, filters = activeFilters) => {
        if (loadingMore && !isRefresh) return;
        if (pageNumber === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const queryParams = { search: searchVal, ...filters };
            const result = await apiService.getListedVehicles(pageNumber, queryParams as any);

            if (result.success && result.data.data) {
                const newVehicles = result.data.data.data;
                const currentPage = result.data.data.current_page;
                const lastPage = result.data.data.last_page;
                setHasMore(currentPage < lastPage);

                if (isRefresh || pageNumber === 1) {
                    setVehicles(newVehicles);
                } else {
                    setVehicles(prev => [...prev, ...newVehicles]);
                }
            } else {
                if (pageNumber === 1) setVehicles([]);
            }
        } catch (error) {
            console.error("Error fetching listed vehicles:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchListed(1, true);
    }, []);

    // ------------------------------------------------------------------
    // Handlers
    // ------------------------------------------------------------------
    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchFavorites(); // Refresh favs too
        fetchListed(1, true, searchText, activeFilters);
    };

    const handleLoadMore = () => {
        if (!loadingMore && !loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchListed(nextPage, false, searchText, activeFilters);
        }
    };

    const handleSearchSubmit = () => {
        setPage(1);
        setHasMore(true);
        fetchListed(1, true, searchText, activeFilters);
    };

    const applyFilters = (newFilters: FilterState) => {
        setActiveFilters(newFilters);
        setPage(1);
        setHasMore(true);
        setVehicles([]);
        fetchListed(1, true, searchText, newFilters);
    };

    const clearAllFilters = () => {
        setSearchText('');
        const emptyFilters = {};
        setActiveFilters(emptyFilters);
        setPage(1);
        setHasMore(true);
        fetchListed(1, true, '', emptyFilters);
    };

    const removeFilter = (key: keyof FilterState) => {
        const newFilters = { ...activeFilters };
        delete newFilters[key];
        if (key === 'make') delete newFilters['make_id'];
        if (key === 'model') delete newFilters['vehicle_model_id'];
        applyFilters(newFilters);
    };

    const handleMenuPress = () => navigation.dispatch(DrawerActions.openDrawer());
    const handleNotificationPress = () => alert('Notifications');

    const handleCarPress = (car: Models.Vehicle) => {
        navigation.navigate('CarDetailPage', { carId: car.id });
    };

    // 🟢 Toggle Logic
    const handleToggleFavorite = async (carId: number) => {
        // Optimistic Update
        const isCurrentlyFav = favoriteIds.includes(carId);
        let newIds = [...favoriteIds];
        if (isCurrentlyFav) {
            newIds = newIds.filter(id => id !== carId);
        } else {
            newIds.push(carId);
        }
        setFavoriteIds(newIds);

        try {
            const result = await apiService.toggleFavorite(carId);
            if (!result.success) {
                // Revert if failed
                setFavoriteIds(favoriteIds);
                showAlert('Error', 'Failed to update favorite status');
            } else {
                // Optional: Sync with backend response if needed
                // setIsFavorited(result.data.is_favorited)
            }
        } catch (error) {
            setFavoriteIds(favoriteIds);
            console.error(error);
        }
    };

    const activeFilterKeys = Object.entries(activeFilters).filter(([key, val]) => {
        return val !== null && val !== undefined && val !== '' && !key.includes('_id');
    });
    const hasActiveFilters = searchText.length > 0 || activeFilterKeys.length > 0;

    return (
        <View style={styles.container}>
            <TopBar onMenuPress={handleMenuPress} onNotificationPress={handleNotificationPress} />

            <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CarCard
                        car={item}
                        onPress={handleCarPress}
                        variant="listed"
                        isFavorite={favoriteIds.includes(item.id)}
                        onToggleFavorite={() => handleToggleFavorite(item.id)}
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
                                    placeholder="Search vehicles..."
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

                        {/* Active Filters Section */}
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
                                        let label = key.replace('_', ' ');
                                        label = label.charAt(0).toUpperCase() + label.slice(1);
                                        let displayValue = value;
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

                        <View style={{ marginBottom: 15 }} />
                    </>
                }
                ListFooterComponent={
                    loadingMore ? <ActivityIndicator size="small" color="#cadb2a" style={{ marginVertical: 20 }} /> : <View style={{ height: 100 }} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No Vehicles Found.</Text>
                        </View>
                    ) : null
                }
            />

            <FilterPopup
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                onApply={applyFilters}
                currentFilters={activeFilters}
            />

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    listContent: { paddingTop: 80, paddingHorizontal: 26 },
    searchContainer: { marginBottom: 15 },
    searchBar: { height: 49, backgroundColor: '#edeeef', borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, justifyContent: 'space-between' },
    searchInput: { flex: 1, fontFamily: 'Poppins', fontSize: 14, color: '#000000', marginHorizontal: 12 },

    // Filter Chips Styles
    activeFiltersContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, height: 30 },
    clearAllButton: { marginRight: 10, paddingVertical: 5 },
    clearAllText: { color: '#cadb2a', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600', textDecorationLine: 'underline' },
    filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#cadb2a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 8 },
    filterChipText: { color: '#000', fontSize: 11, fontFamily: 'Poppins', fontWeight: '600' },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyStateText: { color: '#8c9199', fontFamily: 'Poppins', fontSize: 16 },
});