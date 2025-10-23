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
      
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // Reduced from 42
    marginTop: 20,        // Reduced from 30
  },
  highestBidLabel: {
    fontSize: 16,         // Slightly smaller
    lineHeight: 24,
    color: '#8C9199',
    textAlign: 'left',
    marginBottom: 12,     // Reduced from 20
  },
  bidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,     // Reduced from 20
  },
  currentBidSection: {
    flex: 1,
  },
  sellerExpectationSection: {
    flex: 1,
  },
  bidLabelContainer: {
    backgroundColor: 'rgba(217, 217, 217, 0.35)',
    borderRadius: 186,
    paddingHorizontal: 14,  // Reduced from 20
    paddingVertical: 2,     // Reduced from 3
    alignSelf: 'flex-start',
    marginBottom: 6,        // Reduced from 8
  },
  bidLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,           // Slightly smaller
    lineHeight: 19,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bidAmount: {
    fontFamily: 'Lato',
    fontWeight: '700',
    fontSize: 24,           // Reduced from 26.04
    lineHeight: 28,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  divider: {
    width: 1.5,
    height: 56,             // Reduced from 72.55
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,   // Reduced from 20
  },
});

export default BidSection;