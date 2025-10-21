import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Animated, Alert } from 'react-native';
// import Svg, { Path } from 'react-native-svg';

export const NegotiationsSection = ()=> {
  const [liked, setLiked] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const countdownData = [
    { value: '2', label: 'Days' },
    { value: '11', label: 'Hours' },
    { value: '21', label: 'Min' },
    { value: '20', label: 'Sec' },
  ];

  const carDetails = ['12 Bids', '2025', 'Used', '20 Km'];

  const handleLike = () => {
    setLiked(!liked);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCardPress = () => {
    Alert.alert('Tesla Model 3', 'View car details');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.95} onPress={handleCardPress}>
        <View style={styles.card}>
          <Image
            source={{ uri: 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png' }}
            style={styles.image}
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,1)']}
            style={styles.gradient}
          />

          {/* Heart Icon */}
          <TouchableOpacity 
            style={styles.heartContainer}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              {/* <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path 
                  d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" 
                  fill={liked ? '#ef4444' : 'none'}
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              </Svg> */}
            </Animated.View>
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

        {/* Bottom Content */}
        <View style={styles.bottomContent}>
          <View style={styles.infoRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Tesla Model 3</Text>
              <Text style={styles.title}>Standard</Text>
            </View>

            <View style={styles.priceContainer}>
              <View style={styles.priceColumn}>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>Current Bid</Text>
                </View>
                <Text style={styles.priceValue}>AED 24,000</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.priceColumn}>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>Seller Expectation</Text>
                </View>
                <Text style={styles.priceValue}>AED 25,000</Text>
              </View>
            </View>
          </View>

          <View style={styles.badgeRow}>
            {carDetails.map((detail, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{detail}</Text>
              </View>
            ))}
          </View>
        </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    width: '100%',
    height: 211,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heartContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  countdownContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 4,
  },
  countdownItem: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownValue: {
    fontFamily: 'Lato',
    fontWeight: '700',
    fontSize: 16,
    color: '#ffffff',
  },
  countdownLabel: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: '#ffffff',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-end',
  },
  priceColumn: {
    alignItems: 'center',
  },
  priceBadge: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 4,
  },
  priceBadgeText: {
    fontFamily: 'Poppins',
    fontSize: 8,
    color: '#ffffff',
  },
  priceValue: {
    fontFamily: 'Lato',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
  },
  divider: {
    width: 1,
    height: 39,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#ffffff',
  },
});
