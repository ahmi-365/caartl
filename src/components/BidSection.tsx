import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const BidSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.highestBidLabel}>Highest Bid</Text>
      
      <View style={styles.bidContainer}>
        <View style={styles.currentBidSection}>
          <View style={styles.bidLabelContainer}>
            <Text style={styles.bidLabel}>Current Bid</Text>
          </View>
          <Text style={styles.bidAmount}>AED 34,000</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sellerExpectationSection}>
          <View style={styles.bidLabelContainer}>
            <Text style={styles.bidLabel}>Seller Expectation</Text>
          </View>
          <Text style={styles.bidAmount}>AED 45,000</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.bidButton}>
        <Text style={styles.bidButtonText}>Bid Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 42,
    marginTop: 30,
  },
  highestBidLabel: {
    fontSize: 18,
    lineHeight: 28.15,
    color: '#8C9199',
    textAlign: 'left',
    marginBottom: 20,
  },
  bidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentBidSection: {
    flex: 1,
  },
  sellerExpectationSection: {
    flex: 1,
  },
  bidLabelContainer: {
    backgroundColor: 'rgba(217, 217, 217, 0.35)',
    borderRadius: 186.03,
    paddingHorizontal: 20,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bidLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14.88,
    lineHeight: 22.32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bidAmount: {
    fontFamily: 'Lato',
    fontWeight: '700',
    fontSize: 26.04,
    lineHeight: 31.25,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  divider: {
    width: 1.86,
    height: 72.55,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
  },
  bidButton: {
    backgroundColor: '#CADB2A',
    borderRadius: 11,
    paddingVertical: 12.5,
    paddingHorizontal: 54,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  bidButtonText: {
    fontFamily: 'Barlow',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 24,
    color: '#000000',
    textAlign: 'center',
  },
});

export default BidSection;
