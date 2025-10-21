import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const FeaturesList: React.FC = () => {
  const features = [
    {
      icon: 'https://static.codia.ai/image/2025-10-21/dy1kmutzx0.png',
      title: 'Transmission',
      subtitle: 'Auto',
    },
    {
      icon: 'https://static.codia.ai/image/2025-10-21/pAPQNoReza.png',
      title: 'Door & Seats',
      subtitle: '4 Doors and 7 Seats',
    },
    {
      icon: 'https://static.codia.ai/image/2025-10-21/9r2FDULRFr.png',
      title: 'Air Condition',
      subtitle: 'Climate Control',
    },
    {
      icon: 'https://static.codia.ai/image/2025-10-21/nnBDm0j7Hg.png',
      title: 'Fuel Type',
      subtitle: 'Diesel',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <Image
              source={{ uri: feature.icon }}
              style={styles.featureIcon}
              resizeMode="contain"
            />
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.arrowButton}>
        <Image
          source={{ uri: 'https://static.codia.ai/image/2025-10-21/6SeURzMpYu.png' }}
          style={styles.arrowIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 43,
    position: 'relative',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  featureCard: {
    width: 174,
    height: 90.03,
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12.5,
    elevation: 5,
  },
  featureIcon: {
    width: 32,
    height: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    lineHeight: 28,
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#979797',
    fontWeight: '400',
  },
  arrowButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    width: 47,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 21,
    height: 2,
    tintColor: '#FFFFFF',
  },
});

export default FeaturesList;
