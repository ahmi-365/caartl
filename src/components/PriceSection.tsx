import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PriceSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Price Column */}
        <View style={styles.priceColumn}>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <Text style={styles.totalPriceAmount}>45,000 AED</Text>
        </View>

        {/* Buy Now Button */}
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 23,
    marginTop: 20,
    marginBottom: 70,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Vertically centers the button with the price block
    
  },
  priceColumn: {
    flexDirection: 'column',
    
  },
  totalPriceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400',
    opacity: 0.8,
    marginBottom: 2,
  },
  totalPriceAmount: {
    fontSize: 34.4,
    lineHeight: 42,
    color: '#FFFFFF',
    fontWeight: '400',
    marginRight:10,

  },
  buyButton: {
    backgroundColor: '#CADB2A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buyButtonText: {
    fontFamily: 'Barlow',
    fontWeight: '700',
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
  },
});

export default PriceSection;