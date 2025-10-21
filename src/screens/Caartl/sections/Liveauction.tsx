import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

export const LiveAuctionsSection = ()=> {
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

          {/* Bottom Content */}
          <View style={styles.bottomContent}>
            <View style={styles.badgeRow}>
              {carDetails.map((detail, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>{detail}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceColumn}>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>Current Bid</Text>
              </View>
              <Text style={styles.priceValue}>Aed 34,000</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceColumn}>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>Seller Expectation</Text>
              </View>
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
  countdownContainer: {
    position: 'absolute',
    top: 12,
    left: 14,
    flexDirection: 'row',
    gap: 4,
  },
  countdownItem: {
    width: 42,
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
  titleContainer: {
    position: 'absolute',
    bottom: 74,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 15,
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Poppins',
    fontSize: 10,
    color: '#ffffff',
  },
  priceSection: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  priceColumn: {
    alignItems: 'center',
  },
  priceBadge: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 2,
    height: 12,
    justifyContent: 'center',
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
});
