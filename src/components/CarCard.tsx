import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Models from '../data/modal';

interface CarCardProps {
  car: Models.Vehicle;
  onPress: (car: Models.Vehicle) => void;
  variant?: 'negotiation' | 'live' | 'upcoming';
  isFavorite?: boolean;
  onToggleFavorite?: (car: Models.Vehicle) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  onPress,
  variant,
  isFavorite = false,
  onToggleFavorite
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        return new Date(dateStr.replace(' ', 'T'));
      };

      const targetString = variant === 'upcoming'
        ? car.auction_start_date
        : car.auction_end_date;

      const targetDate = parseDate(targetString);
      const now = new Date();
      const difference = +targetDate - +now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [car.auction_end_date, car.auction_start_date, variant]);


  const handleLike = (e: any) => {
    e.stopPropagation();
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    if (onToggleFavorite) {
      onToggleFavorite(car);
    }
  };

  const countdownData = [
    { value: countdown.days.toString(), label: 'Days' },
    { value: countdown.hours.toString().padStart(2, '0'), label: 'Hours' },
    { value: countdown.minutes.toString().padStart(2, '0'), label: 'Min' },
    { value: countdown.seconds.toString().padStart(2, '0'), label: 'Sec' },
  ];

  const brandName = car.brand?.name || '';
  const modelName = car.vehicle_model?.name || '';
  const variantName = car.variant || '';
  const fullTitle = `${brandName} ${modelName} ${variantName}`.trim();

  const currentBidValue = car.current_bid ? Number(car.current_bid) : null;
  const startingBidValue = Number(car.starting_bid_amount);

  const displayPriceLabel = currentBidValue ? 'Current Bid' : 'Starting Bid';
  const displayPriceValue = currentBidValue
    ? currentBidValue.toLocaleString()
    : startingBidValue.toLocaleString();

  const buyNowPrice = car.price ? Number(car.price).toLocaleString() : 'N/A';

  // --- FIXED IMAGE LOGIC ---
  let imageUrl = 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png'; // Default fallback

  if (car.cover_image) {
    if (typeof car.cover_image === 'string') {
      imageUrl = car.cover_image;
    } else if (car.cover_image.path) {
      imageUrl = car.cover_image.path;
    }
  } else if (car.brand?.image_source) {
    imageUrl = car.brand.image_source;
  }
  // -------------------------

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.95} onPress={() => onPress(car)}>
        <View style={styles.card}>
          <Image
            source={{ uri: imageUrl }} // 👈 Now guaranteed to be a string
            style={styles.image}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,1)']}
            style={styles.gradient}
          />

          <TouchableOpacity style={styles.heartContainer} onPress={handleLike} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                  fill={isFavorite ? '#ef4444' : 'none'}
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              </Svg>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.countdownContainer}>
            {countdownData.map((item, index) => (
              <View key={index} style={styles.countdownItem}>
                <Text style={styles.countdownValue}>{item.value}</Text>
                <Text style={styles.countdownLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomContent}>
            <View style={styles.infoRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>{fullTitle}</Text>
                <Text style={styles.subtitle}>{car.year}</Text>
              </View>

              <View style={styles.priceContainer}>
                <View style={styles.priceColumn}>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>{displayPriceLabel}</Text>
                  </View>
                  <Text style={styles.priceValue}>AED {displayPriceValue}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.priceColumn}>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>Buy Now</Text>
                  </View>
                  <Text style={styles.priceValue}>AED {buyNowPrice}</Text>
                </View>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {car.bids_count ? `${car.bids_count} Bids` : '0 Bids'}
                </Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>{car.condition}</Text>
              </View>

              {car.mileage ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{car.mileage} km</Text>
                </View>
              ) : null}

              {car.engine_cc ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{car.engine_cc} cc</Text>
                </View>
              ) : null}

              {car.horsepower ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{car.horsepower} bhp</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 24 },
  card: { width: '100%', height: 211, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heartContainer: { position: 'absolute', top: 16, right: 16, padding: 8 },
  countdownContainer: { position: 'absolute', top: 12, left: 14, flexDirection: 'row', gap: 4 },
  countdownItem: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  countdownValue: { fontFamily: 'Lato', fontWeight: '700', fontSize: 16, color: '#ffffff' },
  countdownLabel: { fontFamily: 'Lato', fontSize: 10, color: '#ffffff' },
  titleContainer: { flex: 1, paddingRight: 10, justifyContent: 'center' },
  title: { fontFamily: 'Poppins', fontWeight: '700', fontSize: 16, color: '#ffffff', lineHeight: 20, textAlign: 'left' },
  subtitle: { fontFamily: 'Poppins', fontSize: 14, color: '#d3d3d3', marginTop: 4, textAlign: 'left', fontWeight: '500' },
  bottomContent: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  priceContainer: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
  priceColumn: { alignItems: 'center' },
  priceBadge: { backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4 },
  priceBadgeText: { fontFamily: 'Poppins', fontSize: 10, color: '#ffffff', fontWeight: '600' },
  priceValue: { fontFamily: 'Lato', fontWeight: '800', fontSize: 14, color: '#ffffff' },
  divider: { width: 1, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 3 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4 },
  badgeText: { fontFamily: 'Poppins', fontSize: 10, color: '#ffffff', textTransform: 'capitalize' },
});