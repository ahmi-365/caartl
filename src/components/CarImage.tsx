import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CarImage: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Highest Bid + Badge Row */}
      <View style={styles.bidRow}>
        <Text style={styles.carbid}>Highest Bid</Text>
        <View style={styles.highestBidBadge}>
          <Text style={styles.highestBidBadgeText}>$45,000</Text>
        </View>
      </View>

      <Text style={styles.carTitle}>Audi Model X56</Text>
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://static.codia.ai/image/2025-10-21/1tYjZJ5LLD.png' }}
          style={styles.carImage}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']}
          style={styles.imageOverlay}
        />
        
        <Image
          source={{ uri: 'https://static.codia.ai/image/2025-10-21/43ypcAXOsL.png' }}
          style={styles.starIcon}
          resizeMode="contain"
        />
        
        <View style={styles.badgesContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>16 Bids</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2025</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Used</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>20 Km</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  carbid: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 21,
    color: '#5b5656ff',
    textTransform: 'uppercase',
  },
  highestBidBadge: {
    backgroundColor: '#cadb2a',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    // minWidth: 80,
    alignItems: 'center',
  },
  highestBidBadgeText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  carTitle: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 21,
    color:'#FFFFFF',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  carImage: {
    width: width - 40,
    height: 210,
    borderRadius: 10,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 105,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
  },
  starIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 28,
    height: 28,
  },
  badgesContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: 'rgba(217, 217, 217, 0.35)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 2,
    minWidth: 66,
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default CarImage;