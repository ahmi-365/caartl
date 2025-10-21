import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const FeaturesSection: React.FC = () => {
  const [showMore, setShowMore] = useState(false);

  const features = [
    'Alarm System',
    'Premium sound system',
    'Heads up display',
    'Bluetooth system',
    'Climate Control',
    'Keyless Entry',
    'Cruise Control',
    'Park assist system',
  ];

  const visibleFeatures = showMore ? features : features.slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.featuresContainer}>
        <Image
          source={{uri: 'https://static.codia.ai/image/2025-10-21/xF8HpnyH1e.png'}}
          style={styles.featureImage}
          resizeMode="cover"
        />
        
        <View style={styles.featuresListContainer}>
          {visibleFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureText}>{feature}</Text>
              {feature === 'Park assist system' && (
                <Image
                  source={{uri: 'https://static.codia.ai/image/2025-10-21/bwuuGKBHoF.png'}}
                  style={styles.checkIcon}
                  resizeMode="contain"
                />
              )}
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowMore(!showMore)}>
            <Text style={styles.showMoreText}>Show More</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  featuresContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureImage: {
    width: 148,
    height: 378,
    marginRight: 20,
  },
  featuresListContainer: {
    flex: 1,
    paddingTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
    flex: 1,
  },
  checkIcon: {
    width: 21,
    height: 21,
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
  separator: {
    height: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 30,
    marginHorizontal: 9,
  },
});

export default FeaturesSection;
