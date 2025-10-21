import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

export const UpcomingAuctionsSection = ()=> {
  const handleCardPress = () => {
    Alert.alert('Audi Model x56', 'View car details');
  };
  const countdownItems = [
    { value: '3', label: 'Days' },
    { value: '01', label: 'Hour' },
    { value: '11', label: 'Min' },
    { value: '09', label: 'Sec' },
  ];

  const carDetails = ['16 Bids', '2025', 'Used', '20 Km'];

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.95} onPress={handleCardPress}>
        <View style={styles.card}>
          <Image
            source={{ uri: 'https://c.animaapp.com/mg9397aqkN2Sch/img/audi-1.png' }}
            style={styles.image}
          />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,1)']}
            style={styles.gradient}
            start={{ x: 0, y: 0.13 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Countdown */}
          <View style={styles.countdownContainer}>
            {countdownItems.map((item, index) => (
              <View key={index} style={styles.countdownItem}>
                <Text style={styles.countdownValue}>{item.value}</Text>
                <Text style={styles.countdownLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Audi Model</Text>
            <Text style={styles.title}>x56</Text>
          </View>

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {carDetails.map((detail, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{detail}</Text>
              </View>
            ))}
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceLabels}>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>Current Bid</Text>
              </View>
              <View style={[styles.priceBadge, { marginLeft: 24 }]}>
                <Text style={styles.priceBadgeText}>Seller Expectation</Text>
              </View>
            </View>

            <View style={styles.priceValues}>
              <Text style={styles.priceValue}>Aed 34,000</Text>
              <View style={styles.divider} />
              <Text style={styles.priceValue}>Aed 45,000</Text>
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
    maxWidth: 368,
    height: 211,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 139,
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    top: 106,
    left: 0,
    right: 0,
    height: 105,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
  },
  countdownContainer: {
    position: 'absolute',
    top: 11,
    left: 14,
    flexDirection: 'row',
    gap: 4,
  },
  countdownItem: {
    width: 42,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.46)',
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
  titleContainer: {
    position: 'absolute',
    top: 137,
    left: 20,
    right: 20,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 179,
    left: 21,
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    width: 68,
    height: 15,
    backgroundColor: 'rgba(217,217,217,0.35)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Poppins',
    fontSize: 10,
    color: '#ffffff',
  },
  priceSection: {
    position: 'absolute',
    top: 134,
    left: 167,
    width: 184,
    height: 49,
  },
  priceLabels: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  priceBadge: {
    width: 75,
    height: 15,
    backgroundColor: 'rgba(217,217,217,0.35)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadgeText: {
    fontFamily: 'Poppins',
    fontSize: 8,
    color: '#ffffff',
  },
  priceValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceValue: {
    fontFamily: 'Lato',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
    width: 79,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
