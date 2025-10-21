import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const ExteriorSection: React.FC = () => {
  const [showMore, setShowMore] = useState(false);

  const exteriorFeatures = [
    'LED Headlights',
    'Alloy Wheels',
    'Sunroof',
    'Fog Lights',
    'Chrome Accents',
    'Roof Rails',
    'Tinted Windows',
    'Side Steps',
  ];

  const visibleFeatures = showMore ? exteriorFeatures : exteriorFeatures.slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.featuresListContainer}>
        {visibleFeatures.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowMore(!showMore)}>
          <Text style={styles.showMoreText}>Show More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  featuresListContainer: {
    paddingTop: 20,
  },
  featureItem: {
    paddingVertical: 14,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
  },
  showMoreButton: {
    alignSelf: 'center',
    marginTop: 20,
  },
  showMoreText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
    lineHeight: 28.15,
  },
});

export default ExteriorSection;
