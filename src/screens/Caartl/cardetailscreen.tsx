import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CarData } from '../../data/data';

interface CarDetailScreenProps {
  car: CarData;
  onBack: () => void;
}

export const CarDetailScreen: React.FC<CarDetailScreenProps> = ({ car, onBack }) => {
  const countdownData = [
    { value: car.countdown.days.toString(), label: 'Days' },
    { value: car.countdown.hours.toString().padStart(2, '0'), label: 'Hours' },
    { value: car.countdown.minutes.toString(), label: 'Min' },
    { value: car.countdown.seconds.toString(), label: 'Sec' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: car.imageUrl }} style={styles.image} />

          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* Countdown */}
          <View style={styles.countdownContainer}>
            {countdownData.map((item, index) => (
              <View key={index} style={styles.countdownItem}>
                <Text style={styles.countdownValue}>{item.value}</Text>
                <Text style={styles.countdownLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.title}>{car.title}</Text>
              <Text style={styles.subtitle}>{car.subtitle}</Text>
            </View>
            <TouchableOpacity style={styles.heartButton}>
              <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <Path
                  d="M14 24.5L12.075 22.75C6.3 17.64 2.5 14.23 2.5 10.15C2.5 6.74 5.24 4 8.65 4C10.64 4 12.56 4.93 14 6.42C15.44 4.93 17.36 4 19.35 4C22.76 4 25.5 6.74 25.5 10.15C25.5 14.23 21.7 17.64 15.925 22.75L14 24.5Z"
                  stroke="#cadb2a"
                  strokeWidth="2"
                  fill="none"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Details Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{car.bids} Bids</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{car.year}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{car.condition}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{car.mileage} Km</Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.priceValue}>AED {car.currentBid.toLocaleString()}</Text>
            </View>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Seller Expectation</Text>
              <Text style={styles.priceValue}>AED {car.sellerExpectation.toLocaleString()}</Text>
            </View>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specGrid}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Year</Text>
                <Text style={styles.specValue}>{car.year}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Condition</Text>
                <Text style={styles.specValue}>{car.condition}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Mileage</Text>
                <Text style={styles.specValue}>{car.mileage} Km</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Type</Text>
                <Text style={styles.specValue}>{car.type}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              This {car.title} {car.subtitle} is in excellent condition with only {car.mileage}km on the odometer.
              Perfect for daily commuting or long trips. Full service history available.
              Don't miss this opportunity to own this amazing vehicle!
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        style={styles.bottomGradient}
      >
        <TouchableOpacity style={styles.bidButton} activeOpacity={0.8}>
          <Text style={styles.bidButtonText}>Place Bid</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    gap: 8,
  },
  countdownItem: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownValue: {
    fontFamily: 'Lato',
    fontWeight: '700',
    fontSize: 20,
    color: '#cadb2a',
  },
  countdownLabel: {
    fontFamily: 'Lato',
    fontSize: 12,
    color: '#ffffff',
  },
  content: {
    padding: 24,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 28,
    color: '#ffffff',
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 20,
    color: '#cadb2a',
    lineHeight: 28,
  },
  heartButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#ffffff',
  },
  priceSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  priceLabel: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  priceValue: {
    fontFamily: 'Lato',
    fontWeight: '700',
    fontSize: 20,
    color: '#cadb2a',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 16,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  specItem: {
    width: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  specLabel: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  specValue: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#ffffff',
  },
  description: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 22,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  bidButton: {
    backgroundColor: '#cadb2a',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: '#000000',
  },
});