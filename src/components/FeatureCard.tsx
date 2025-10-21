import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({icon, title, subtitle}) => {
  return (
    <View style={styles.container}>
      <Image
        source={{uri: icon}}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 36) / 2,
    height: 105.71,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 19,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12.5,
    elevation: 5,
  },
  icon: {
    width: 33.83,
    height: 33.83,
    marginBottom: 3,
  },
  title: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
    lineHeight: 28,
    marginBottom: 1,
  },
  subtitle: {
    color: '#CADB2A',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
    lineHeight: 19.6,
  },
});

export default FeatureCard;
