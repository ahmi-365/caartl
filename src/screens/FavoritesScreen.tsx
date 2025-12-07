import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Contexts & Services
import { BottomNav } from '../components/BottomNavigation';
import { TopBar } from '../components/TopBar';
import apiService from '../services/ApiService';
import * as Models from '../data/modal';
import { useAlert } from '../context/AlertContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
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

  const toggleFavorite = async (id: number) => {
    const previousFavorites = [...favorites];
    setFavorites(favorites.filter((car) => car.id !== id));

    try {
      const result = await apiService.toggleFavorite(id);
      if (!result.success) {
        setFavorites(previousFavorites);
        showAlert('Error', 'Could not remove from favorites.');
      }
    } catch (error) {
      setFavorites(previousFavorites);
      showAlert('Error', 'Network error.');
    }
  };

  const handleCardPress = (id: number) => {
    navigation.navigate('CarDetailPage', { carId: id });
  };

  const renderCarCard = ({ item }: { item: Models.Vehicle }) => {
    const brandName = item.brand?.name || '';
    const modelName = item.vehicle_model?.name || '';
    const carName = `${brandName} ${modelName}`.trim();
    const displayPrice = item.current_bid
      ? `AED ${Number(item.current_bid).toLocaleString()}`
      : item.price
        ? `AED ${Number(item.price).toLocaleString()}`
        : `AED ${Number(item.starting_bid_amount).toLocaleString()}`;

    const imageUrl = item.cover_image || item.brand?.image_source || 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png';
    const has360 = item.is_featured;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => handleCardPress(item.id)}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.carImage} />
            {has360 && (
              <View style={styles.badge360}>
                <Text style={styles.badge360Text}>360 View</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <MaterialCommunityIcons name="heart" size={22} color="#ff4444" />
            </TouchableOpacity>
          </View>
          <View style={styles.carInfo}>
            <Text style={styles.carName} numberOfLines={1}>{carName}</Text>
            <Text style={styles.carPrice}>{displayPrice}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* TopBar without onMenuPress prop means NO menu icon */}
      <TopBar />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#cadb2a" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderCarCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#cadb2a" />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: '#888', fontFamily: 'Poppins' }}>No favorites yet.</Text>
            </View>
          }
        />
      )}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 0 },
  listContent: { paddingHorizontal: 12, paddingBottom: 100, paddingTop: 120 },
  cardContainer: { width: '50%', padding: 8 },
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
  imageContainer: { width: '100%', aspectRatio: 4 / 3, backgroundColor: '#1a1a1a', position: 'relative', borderRadius: 16, overflow: 'hidden' },
  carImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge360: { position: 'absolute', top: 10, left: 10, backgroundColor: '#CADB2A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badge360Text: { color: '#000', fontSize: 11, fontWeight: '600' },
  favoriteButton: { position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.9)', justifyContent: 'center', alignItems: 'center' },
  carInfo: { padding: 12, paddingLeft: 4 },
  carName: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  carPrice: { color: '#84867bff', fontSize: 13, fontWeight: '600' },
});