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
}

export const CarCard: React.FC<CarCardProps> = ({ car, onPress, variant }) => {
  const [liked, setLiked] = useState(false);
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
    setLiked(!liked);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const countdownData = [
    { value: countdown.days.toString(), label: 'Days' },
    { value: countdown.hours.toString().padStart(2, '0'), label: 'Hours' },
    { value: countdown.minutes.toString().padStart(2, '0'), label: 'Min' },
    { value: countdown.seconds.toString().padStart(2, '0'), label: 'Sec' },
  ];

  // Title Construction
  const brandName = car.brand?.name || '';
  const modelName = car.vehicle_model?.name || '';
  const variantName = car.variant || '';
  const fullTitle = `${brandName} ${modelName} ${variantName}`.trim();

  // Pricing Logic
  const currentBidValue = car.current_bid ? Number(car.current_bid) : null;
  const startingBidValue = Number(car.starting_bid_amount);

  const displayPriceLabel = currentBidValue ? 'Current Bid' : 'Starting Bid';
  const displayPriceValue = currentBidValue
    ? currentBidValue.toLocaleString()
    : startingBidValue.toLocaleString();

  const buyNowPrice = car.price ? Number(car.price).toLocaleString() : 'N/A';

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.95} onPress={() => onPress(car)}>
        <View style={styles.card}>
          <Image
            source={{ uri: car.cover_image || car.brand?.image_source || 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png' }}
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
                  fill={liked ? '#ef4444' : 'none'}
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              </Svg>
            </Animated.View>
          </TouchableOpacity>

          {/* Timer */}
          <View style={styles.countdownContainer}>
            {countdownData.map((item, index) => (
              <View key={index} style={styles.countdownItem}>
                <Text style={styles.countdownValue}>{item.value}</Text>
                <Text style={styles.countdownLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Bottom Info */}
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

            {/* Badges Row: Bids, Mileage, Engine, Condition, HP */}
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{car.bids_count ? `${car.bids_count} Bids` : '0 Bids'}</Text>
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

  // 👈 Bigger Price Badges
  priceBadge: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 100,
    paddingHorizontal: 10, // Increased from 8
    paddingVertical: 4,    // Increased from 2
    marginBottom: 4
  },
  // 👈 Bigger Badge Text
  priceBadgeText: {
    fontFamily: 'Poppins',
    fontSize: 10,          // Increased from 8
    color: '#ffffff',
    fontWeight: '600'
  },
  priceValue: { fontFamily: 'Lato', fontWeight: '800', fontSize: 14, color: '#ffffff' },

  divider: { width: 1, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 3 },

  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' }, // Added flexWrap to handle many badges
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4 },
  badgeText: { fontFamily: 'Poppins', fontSize: 10, color: '#ffffff', textTransform: 'capitalize' },
});



// import { LinearGradient } from 'expo-linear-gradient';
// import React, { useState } from 'react';
// import {
//   Animated,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Svg, { Path } from 'react-native-svg';
// import { CarData } from './../data/data';

// interface CarCardProps {
//   key?: string; // Optional key prop for React rendering
//   car: CarData;
//   onPress: (car: CarData) => void;
//   variant?: 'negotiation' | 'live' | 'upcoming'; // Reintroduced variant prop
// }

// export const CarCard: React.FC<CarCardProps> = ({ car, onPress, variant }) => {
//   const [liked, setLiked] = useState(false);
//   const scaleAnim = new Animated.Value(1);

//   const handleLike = (e: any) => {
//     e.stopPropagation();
//     setLiked(!liked);
//     Animated.sequence([
//       Animated.timing(scaleAnim, {
//         toValue: 1.3,
//         duration: 150,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 150,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const countdownData = [
//     { value: car.countdown.days.toString(), label: 'Days' },
//     { value: car.countdown.hours.toString().padStart(2, '0'), label: 'Hours' },
//     { value: car.countdown.minutes.toString(), label: 'Min' },
//     { value: car.countdown.seconds.toString(), label: 'Sec' },
//   ];

//   const carDetails = [
//     `${car.bids} Bids`,
//     car.year.toString(),
//     car.condition,
//     `${car.mileage} Km`,
//   ];

//   const renderCard = () => (
//     <View style={styles.card}>
//       <Image source={{ uri: car.imageUrl }} style={styles.image} />
//       <LinearGradient
//         colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,1)']}
//         style={styles.gradient}
//       />

//       {/* Heart Icon */}
//       <TouchableOpacity
//         style={styles.heartContainer}
//         onPress={handleLike}
//         activeOpacity={0.7}
//       >
//         <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//           <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//             <Path
//               d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
//               fill={liked ? '#ef4444' : 'none'}
//               stroke="#ef4444"
//               strokeWidth="2"
//             />
//           </Svg>
//         </Animated.View>
//       </TouchableOpacity>

//       {/* Countdown */}
//       <View style={styles.countdownContainer}>
//         {countdownData.map((item, index) => (
//           <View key={index} style={styles.countdownItem}>
//             <Text style={styles.countdownValue}>{item.value}</Text>
//             <Text style={styles.countdownLabel}>{item.label}</Text>
//           </View>
//         ))}
//       </View>

//       {/* Bottom Content */}
//       <View style={styles.bottomContent}>
//         <View style={styles.infoRow}>
//           <View style={styles.titleContainer}>
//             <Text style={styles.title}>{car.title}</Text>
//             <Text style={styles.title}>{car.subtitle}</Text>
//           </View>

//           <View style={styles.priceContainer}>
//             <View style={styles.priceColumn}>
//               <View style={styles.priceBadge}>
//                 <Text style={styles.priceBadgeText}>Current Bid</Text>
//               </View>
//               <Text style={styles.priceValue}>AED {car.currentBid.toLocaleString()}</Text>
//             </View>

//             <View style={styles.divider} />

//             <View style={styles.priceColumn}>
//               <View style={styles.priceBadge}>
//                 <Text style={styles.priceBadgeText}>Seller Expectation</Text>
//               </View>
//               <Text style={styles.priceValue}>AED {car.sellerExpectation.toLocaleString()}</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.badgeRow}>
//           {carDetails.map((detail, index) => (
//             <View key={index} style={styles.badge}>
//               <Text style={styles.badgeText}>{detail}</Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity activeOpacity={0.95} onPress={() => onPress(car)}>
//         {renderCard()}
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     maxWidth: 368,
//     marginBottom: 24,
//   },
//   card: {
//     width: '100%',
//     height: 211,
//     borderRadius: 10,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   gradient: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   heartContainer: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     padding: 8,
//   },
//   countdownContainer: {
//     position: 'absolute',
//     top: 12,
//     left: 14,
//     flexDirection: 'row',
//     gap: 4,
//   },
//   countdownItem: {
//     width: 40,
//     height: 40,
//     backgroundColor: 'rgba(0,0,0,0.45)',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   countdownValue: {
//     fontFamily: 'Lato',
//     fontWeight: '700',
//     fontSize: 16,
//     color: '#ffffff',
//   },
//   countdownLabel: {
//     fontFamily: 'Lato',
//     fontSize: 10,
//     color: '#ffffff',
//   },
//   titleContainer: {
//     flex: 1,
//   },
//   title: {
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     fontSize: 14,
//     color: '#ffffff',
//     lineHeight: 18,
//     textAlign: 'center',
//   },
//   bottomContent: {
//     position: 'absolute',
//     bottom: 16,
//     left: 16,
//     right: 16,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//     marginBottom: 12,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     gap: 16,
//     alignItems: 'flex-end',
//   },
//   priceColumn: {
//     alignItems: 'center',
//   },
//   priceBadge: {
//     backgroundColor: 'rgba(255,255,255,0.35)',
//     borderRadius: 100,
//     paddingHorizontal: 12,
//     paddingVertical: 2,
//     marginBottom: 4,
//   },
//   priceBadgeText: {
//     fontFamily: 'Poppins',
//     fontSize: 8,
//     color: '#ffffff',
//   },
//   priceValue: {
//     fontFamily: 'Lato',
//     fontWeight: '700',
//     fontSize: 14,
//     color: '#ffffff',
//   },
//   divider: {
//     width: 1,
//     height: 39,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//   },
//   badgeRow: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   badge: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 100,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//   },
//   badgeText: {
//     fontFamily: 'Poppins',
//     fontSize: 12,
//     color: '#ffffff',
//   },
// });