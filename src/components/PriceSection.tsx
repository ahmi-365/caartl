import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const PriceSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.totalPriceLabel}>Total Price</Text>
      <Text style={styles.totalPriceAmount}>45,000AED</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 43,
    marginTop: 40,
    marginBottom: 20,
  },
  totalPriceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: 5,
  },
  totalPriceAmount: {
    fontSize: 34.4,
    lineHeight: 48.16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
});

export default PriceSection;
