import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomNav } from '../components/BottomNavigation';
import { TopBar } from '../components/TopBar';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([
    {
      id: '1',
      name: 'Audi e-tron Premium',
      price: 'AED 35,000',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      has360: false,
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Suzuki Swift',
      price: 'AED 25,000',
      image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=400&h=300&fit=crop',
      has360: true,
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Audi e-tron Premium',
      price: 'AED 35,000',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      has360: false,
      isFavorite: true,
    },
    {
      id: '4',
      name: 'Suzuki Swift',
      price: 'AED 25,000',
      image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=400&h=300&fit=crop',
      has360: true,
      isFavorite: true,
    },
  ]);

  const toggleFavorite = (id) => {
    setFavorites(
      favorites.map((car) =>
        car.id === id ? { ...car, isFavorite: !car.isFavorite } : car
      )
    );
  };

  const renderCarCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {/* Car Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.carImage} />

          {/* 360 View Badge */}
          {item.has360 && (
            <View style={styles.badge360}>
              <Text style={styles.badge360Text}>360 View</Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <MaterialCommunityIcons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={item.isFavorite ? '#ff4444' : '#333'}
            />
          </TouchableOpacity>

          {/* Video Icon */}
          {/* <TouchableOpacity style={styles.videoButton}>
            <Feather name="video" size={18} color="#fff" />
          </TouchableOpacity> */}
        </View>

        {/* Car Info */}
        <View style={styles.carInfo}>
          <Text style={styles.carName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.carPrice}>{item.price}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View
      // colors={['rgba(202, 219, 42, 0)', 'rgba(202, 219, 42, 0.46)']}
      style={styles.container}
      
    >
      {/* Header */}
     <TopBar/>
      {/* Car Grid */}
      <FlatList
        data={favorites}
        renderItem={renderCarCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <BottomNav/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 120,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  cardContainer: {
    width: '50%',
    padding: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge360: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#CADB2A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badge360Text: {
    color: '#000',
    fontSize: 11,
    fontWeight: '600',
  },
favoriteButton: {
  position: 'absolute',
  top: 10,
  right: 0, // Shift the button so half is outside the card
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  justifyContent: 'center',
  alignItems: 'center',
},
  videoButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carInfo: {
    padding: 12,
  },
  carName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  carPrice: {
    color: '#84867bff',
    fontSize: 13,
    fontWeight: '600',
  },
});