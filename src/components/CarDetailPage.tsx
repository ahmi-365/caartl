import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Header from './Header';
import FeatureCard from './FeatureCard';
import TabNavigation from './TabNavigation';
import DetailsSection from './DetailsSection';
import FeaturesSection from './FeaturesSection';
import ExteriorSection from './ExteriorSection';

const {width} = Dimensions.get('window');

const CarDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Details');

  const renderContent = () => {
    switch (activeTab) {
      case 'Details':
        return <DetailsSection />;
      case 'Features':
        return <FeaturesSection />;
      case 'Exterior':
        return <ExteriorSection />;
      case 'Comments':
        return (
          <View style={styles.commentsSection}>
            <Image
              source={{uri: 'https://static.codia.ai/image/2025-10-21/mTKY0EEAEg.png'}}
              style={styles.commentsImage}
              resizeMode="cover"
            />
            <Text style={styles.commentsText}>comments & Terms Conditions</Text>
          </View>
        );
      default:
        return <DetailsSection />;
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.featureCardsContainer}>
        <View style={styles.featureCardsRow}>
          <FeatureCard
            icon="https://static.codia.ai/image/2025-10-21/z3hMsRwPmS.png"
            title="Transmission"
            subtitle="Auto"
          />
          <FeatureCard
            icon="https://static.codia.ai/image/2025-10-21/vPLk5thv19.png"
            title="Door & Seats"
            subtitle="4 Doors and 7 Seats"
          />
        </View>
        <View style={styles.featureCardsRow}>
          <FeatureCard
            icon="https://static.codia.ai/image/2025-10-21/2qRefBkKRv.png"
            title="Air Condition"
            subtitle="Climate Control"
          />
          <FeatureCard
            icon="https://static.codia.ai/image/2025-10-21/VEuX7fi4ys.png"
            title="Fuel Type"
            subtitle="Diesel"
          />
        </View>
      </View>

      <TabNavigation activeTab={activeTab} onTabPress={setActiveTab} />
      
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  featureCardsContainer: {
    paddingHorizontal: 12,
    marginTop: 20,
  },
  featureCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  commentsSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  commentsImage: {
    width: width - 18,
    height: 277,
    borderRadius: 10,
  },
  commentsText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
    lineHeight: 30.8,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CarDetailPage;
