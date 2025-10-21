import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/Header';
import CarImage from '../components/CarImage';
import CountdownTimer from '../components/CountdownTimer';
import BidSection from '../components/BidSection';
import FeaturesList from '../components/FeaturesList';
import PriceSection from '../components/PriceSection';
import ActionButtons from '../components/ActionButtons';

const { width, height } = Dimensions.get('window');

const LiveCarAuctionScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(202, 219, 42, 0)', 'rgba(202, 219, 42, 0.46)']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Header />
          <CarImage />
          <CountdownTimer />
          <BidSection />
          <Text style={styles.allFeaturesTitle}>All Features</Text>
          <FeaturesList />
          <PriceSection />
          <ActionButtons />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    width: width,
    height: height,
  },
  scrollView: {
    flex: 1,
  },
  allFeaturesTitle: {
    fontSize: 24,
    lineHeight: 33.6,
    color: '#FFFFFF',
    fontWeight: '400',
    marginLeft: 43,
    marginTop: 20,
    marginBottom: 20,
  },
});

export default LiveCarAuctionScreen;
