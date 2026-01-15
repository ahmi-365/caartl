import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiService from '../services/ApiService';
import * as Models from '../data/modal';
import { useAlert } from '../context/AlertContext';
import { RootStackParamList } from '../navigation/AppNavigator';

// Reuse CarCard for consistent listing UI
import { CarCard } from '../components/CarCard';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();

  const [favorites, setFavorites] = useState<Models.Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      const result = await apiService.getFavorites();
      if (result.success && Array.isArray(result.data.data)) {
        setFavorites(result.data.data);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      showAlert('Error', 'Failed to load favorites.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  // Toggle Logic - Remove from list optimistically
  const handleToggleFavorite = async (id: number) => {
    const previousFavorites = [...favorites];
    setFavorites(favorites.filter((car) => car.id !== id));

    try {
      const result = await apiService.toggleFavorite(id);
      if (!result.success) {
        setFavorites(previousFavorites); // Revert if failed
        showAlert('Error', 'Could not remove from favorites.');
      }
    } catch (error) {
      setFavorites(previousFavorites);
      showAlert('Error', 'Network error.');
    }
  };

  const handleCardPress = (car: Models.Vehicle) => {
    navigation.navigate('CarDetailPage', { carId: car.id });
  };

  // 🟢 Fixed Navigation logic for nested drawer
  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // @ts-ignore
      navigation.navigate('DrawerRoot', { screen: 'ListedVehicles' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header with Round Back Button */}
      <View style={[styles.customHeader, { paddingTop: 10 }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#cadb2a" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          numColumns={2}
          key={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#cadb2a" />
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <CarCard
                car={item}
                onPress={handleCardPress}
                variant="listed"
                isFavorite={true}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
                hideBadges={true}
                hidePrice={true}
              />
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="heart-broken" size={50} color="#333" />
              <Text style={styles.emptyText}>No favorites yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  screenTitle: { color: '#cadb2a', fontSize: 20, fontFamily: 'Poppins', fontWeight: 'bold' },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },

  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  columnWrapper: { justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: 0 },

  emptyText: { color: '#666', marginTop: 15, fontSize: 16, fontFamily: 'Poppins' },
});