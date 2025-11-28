import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import apiService from '../services/ApiService';
import * as Models from '../data/modal';
import { RootStackParamList } from '../navigation/AppNavigator';

type CarDetailRouteProp = RouteProp<RootStackParamList, 'CarDetailPage'>;

const { width, height } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 60;

export const CarDetailPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CarDetailRouteProp>();
  const { carId } = route.params;

  const [loading, setLoading] = useState(true);
  const [auctionData, setAuctionData] = useState<Models.AuctionDetailsResponse['data'] | null>(null);

  const [activeTab, setActiveTab] = useState('Details');
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionYCoords = useRef<{ [key: string]: number }>({});

  // 🔒 Lock for manual clicks
  const isManualScroll = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tabs = ['Details', 'Features', 'Exterior', 'Comments'];

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const result = await apiService.getAuctionDetails(carId);
        if (result.success) {
          setAuctionData(result.data.data);
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [carId]);

  // --- Handlers ---

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    isManualScroll.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const y = sectionYCoords.current[tabName];

    if (y !== undefined && scrollViewRef.current) {
      // Scroll exactly to where the section starts, accounting for the sticky header
      scrollViewRef.current.scrollTo({
        y: y - TAB_BAR_HEIGHT,
        animated: true
      });
    }

    // Longer timeout to ensure momentum scrolling doesn't override us
    timeoutRef.current = setTimeout(() => {
      isManualScroll.current = false;
    }, 1000);
  };

  const onLayoutSection = (event: LayoutChangeEvent, sectionName: string) => {
    sectionYCoords.current[sectionName] = event.nativeEvent.layout.y;
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // If we clicked a tab, we ignore scroll updates to prevent "flickering" state
    if (isManualScroll.current) return;

    const scrollY = event.nativeEvent.contentOffset.y;

    // 🎯 THE FIX: Strict "Cross the Line" Logic
    // We define a "Trigger Line" at the bottom of the sticky tab bar.
    // A section only becomes active if its top edge has crossed this line.
    // We add +10 padding so it changes just *after* the title slides under.
    const triggerLine = scrollY + TAB_BAR_HEIGHT + 50;

    let newActiveTab = tabs[0];

    // Iterate backwards (Comments -> Exterior -> Features -> Details)
    // This finds the *last* section that has crossed the trigger line.
    for (let i = tabs.length - 1; i >= 0; i--) {
      const tab = tabs[i];
      const sectionTop = sectionYCoords.current[tab];

      // Only activate if the trigger line is BELOW the top of the section
      if (sectionTop !== undefined && triggerLine >= sectionTop) {
        newActiveTab = tab;
        break; // Stop at the deepest visible section
      }
    }

    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#cadb2a" />
      </View>
    );
  }

  if (!auctionData || !auctionData.vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'white' }}>Vehicle not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#cadb2a' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { vehicle, all_interior_features, all_exterior_features } = auctionData;

  // --- Data Mapping ---
  const featureCards = [
    {
      icon: <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="none" stroke="#cadb2a" strokeWidth="2" /><Circle cx="12" cy="12" r="3" fill="#cadb2a" /></Svg>,
      title: 'Transmission',
      subtitle: vehicle.transmission_id === 1 ? 'Automatic' : 'Manual'
    },
    {
      icon: <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="#cadb2a" /></Svg>,
      title: 'Details',
      subtitle: `${vehicle.doors || 4} Doors, ${vehicle.seats || 5} Seats`
    },
    {
      icon: <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#cadb2a" /><Path d="M12 6v6l5 3" stroke="#cadb2a" strokeWidth="2" strokeLinecap="round" /></Svg>,
      title: 'Mileage',
      subtitle: `${vehicle.mileage} km`
    },
    {
      icon: <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z" fill="#cadb2a" /></Svg>,
      title: 'Fuel Type',
      subtitle: vehicle.fuel_type_id === 1 ? 'Petrol' : 'Diesel'
    },
  ];

  const detailsData = [
    { label: 'Year', value: vehicle.year.toString(), icon: <Svg width="16" height="16" viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" fill="none" stroke="#888" strokeWidth="2" /><Path d="M12 6v6l4 2" stroke="#888" strokeWidth="2" /></Svg> },
    { label: 'Engine', value: `${vehicle.engine_cc} cc`, icon: <Svg width="16" height="16" viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="none" stroke="#888" strokeWidth="2" /></Svg> },
    { label: 'Horsepower', value: `${vehicle.horsepower} hp`, icon: <Svg width="16" height="16" viewBox="0 0 24 24" fill="none"><Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#888" /></Svg> },
    { label: 'Exterior Color', value: vehicle.color || 'N/A', icon: <Svg width="16" height="16" viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" fill="none" stroke="#888" strokeWidth="2" /><Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#888" /></Svg> },
    { label: 'Interior Color', value: vehicle.interior_color || 'N/A', icon: <Svg width="16" height="16" viewBox="0 0 24 24" fill="none"><Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#888" /></Svg> },
    { label: 'Drive Type', value: vehicle.drive_type || 'N/A', icon: <Svg width="16" height="16" viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="3" fill="none" stroke="#888" strokeWidth="2" /><Path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="#888" strokeWidth="2" /></Svg> },
    { label: 'VIN', value: vehicle.vin || 'Hidden', icon: <Svg width="16" height="16" viewBox="0 0 24 24" fill="none"><Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2z" fill="#888" /></Svg> },
  ];

  const allFeatures = [...(all_exterior_features || []), ...(all_interior_features || [])];
  const displayedFeatures = showAllFeatures ? allFeatures : allFeatures.slice(0, 12);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <LinearGradient colors={['rgba(202, 219, 42, 0)', 'rgba(202, 219, 42, 0.46)']} style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M15 18L9 12L15 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{vehicle.brand?.name} {vehicle.vehicle_model?.name}</Text>
          <View style={styles.notificationButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="#cadb2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <View style={styles.notificationDot} />
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          onScroll={onScroll}
          scrollEventThrottle={16}
          // 🔑 Bottom padding allows the last section to scroll all the way to the top
          contentContainerStyle={{ paddingBottom: height * 0.8 }}
        >

          {/* --- CHILD 0: Top Content --- */}
          <View>
            <View style={styles.mainImageContainer}>
              <Image
                source={{ uri: vehicle.cover_image || vehicle.brand?.image_source || 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png' }}
                style={styles.carImageMain}
                resizeMode="cover"
              />
              <View style={styles.priceOverlay}>
                <Text style={styles.priceLabel}>Starting Bid</Text>
                <Text style={styles.priceText}>AED {Number(vehicle.starting_bid_amount).toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.cardsContainer}>
              <View style={styles.cardRow}>
                {featureCards.slice(0, 2).map((card, index) => (
                  <View key={index} style={styles.featureCard}>
                    <View style={styles.iconContainer}>{card.icon}</View>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.cardRow}>
                {featureCards.slice(2, 4).map((card, index) => (
                  <View key={index} style={styles.featureCard}>
                    <View style={styles.iconContainer}>{card.icon}</View>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* --- CHILD 1: Sticky Tab Bar --- */}
          <View style={styles.stickyTabContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContentContainer}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => handleTabPress(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* --- CHILD 2: Details Section --- */}
          <View onLayout={(e) => onLayoutSection(e, 'Details')} style={styles.sectionContainer}>
            <View style={styles.contentBox}>
              <Text style={styles.sectionTitle}>Vehicle Specifications</Text>
              {detailsData.map((item, index) => (
                <View key={index} style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    {item.icon}
                    <Text style={styles.detailLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* --- CHILD 3: Features Section --- */}
          <View onLayout={(e) => onLayoutSection(e, 'Features')} style={styles.sectionContainer}>
            <View style={styles.contentBox}>
              <Text style={styles.sectionTitle}>Features</Text>
              {displayedFeatures.length > 0 ? (
                <>
                  {displayedFeatures.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <View style={styles.bulletContainer}>
                        <View style={styles.bullet} />
                        <Text style={styles.featureText}>{feature.name}</Text>
                      </View>
                      <TouchableOpacity style={styles.checkButton}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Circle cx="12" cy="12" r="10" stroke="#cadb2a" strokeWidth="2" />
                          <Path d="M9 12l2 2 4-4" stroke="#cadb2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {allFeatures.length > 12 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => setShowAllFeatures(!showAllFeatures)}
                    >
                      <Text style={styles.showMoreText}>
                        {showAllFeatures ? "Show Less" : `Show ${allFeatures.length - 12} More ...`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 10 }}>No features listed.</Text>
              )}
            </View>
          </View>

          {/* --- CHILD 4: Exterior / Description Section --- */}
          <View onLayout={(e) => onLayoutSection(e, 'Exterior')} style={styles.sectionContainer}>
            <View style={styles.contentBox}>
              <Text style={styles.sectionTitle}>Description & Remarks</Text>
              <Text style={styles.descriptionText}>
                {vehicle.description || "No description available."}
              </Text>
              {vehicle.remarks && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Remarks</Text>
                  <Text style={styles.descriptionText}>{vehicle.remarks}</Text>
                </>
              )}
            </View>
          </View>

          {/* --- CHILD 5: Comments Section --- */}
          <View onLayout={(e) => onLayoutSection(e, 'Comments')} style={styles.sectionContainer}>
            <View style={styles.commentsWrapper}>
              <TouchableOpacity style={styles.commentsButton}>
                <Text style={styles.commentsButtonText}>View Terms & Conditions</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins', fontSize: 18, fontWeight: '600', color: '#ffffff' },
  notificationButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#cadb2a' },
  scrollView: { flex: 1 },
  mainImageContainer: { width: '100%', height: 220, marginBottom: 10, position: 'relative' },
  carImageMain: { width: '100%', height: '100%' },
  priceOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 8 },
  priceLabel: { color: '#aaa', fontSize: 10, fontFamily: 'Poppins' },
  priceText: { color: '#cadb2a', fontSize: 16, fontFamily: 'Poppins', fontWeight: '700' },
  cardsContainer: { paddingHorizontal: 16, paddingTop: 16 },
  cardRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  featureCard: { flex: 1, backgroundColor: '#000000', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#1a1a1a' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#cadb2a' },
  cardTitle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 2 },
  cardSubtitle: { fontFamily: 'Poppins', fontSize: 12, color: '#888888' },
  stickyTabContainer: { backgroundColor: '#000000', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  tabsContentContainer: { paddingHorizontal: 16 },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, backgroundColor: 'transparent', marginRight: 8, borderWidth: 1, borderColor: '#333' },
  activeTab: { backgroundColor: '#cadb2a', borderColor: '#cadb2a' },
  tabText: { fontFamily: 'Poppins', fontSize: 14, fontWeight: '500', color: '#ffffff' },
  activeTabText: { color: '#000000', fontWeight: '600' },
  sectionContainer: { paddingTop: 20, paddingHorizontal: 16 },
  contentBox: { backgroundColor: '#0a0a0a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1a1a1a' },
  sectionTitle: { fontFamily: 'Poppins', fontSize: 16, fontWeight: '700', color: '#cadb2a', marginBottom: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  detailLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontFamily: 'Poppins', fontSize: 14, color: '#ccc' },
  detailValue: { fontFamily: 'Poppins', fontSize: 14, fontWeight: '600', color: '#ffffff' },
  featureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111' },
  bulletContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#cadb2a', marginRight: 12 },
  featureText: { fontFamily: 'Poppins', fontSize: 14, color: '#ffffff' },
  checkButton: { padding: 4 },
  showMoreButton: { alignItems: 'center', paddingTop: 16 },
  showMoreText: { fontFamily: 'Poppins', fontSize: 14, color: '#888888' },
  descriptionText: { fontFamily: 'Poppins', fontSize: 14, color: '#ccc', lineHeight: 22 },
  commentsWrapper: {},
  commentsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0a0a0a', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#1a1a1a' },
  commentsButtonText: { fontFamily: 'Poppins', fontSize: 16, fontWeight: '500', color: '#ffffff' },
  dropdownArrow: { color: '#cadb2a', fontSize: 14 },
});


// import { LinearGradient } from 'expo-linear-gradient';
// import React, { useState } from 'react';
// import {
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Svg, { Path, Circle } from 'react-native-svg';

// interface CarDetailScreenProps {
//   onBack?: () => void;
// }

// export const CarDetailPage: React.FC<CarDetailScreenProps> = ({ onBack }) => {
//   const [activeTab, setActiveTab] = useState('Details');

//   const featureCards = [
//     {
//       icon: (
//         <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//           <Path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="none" stroke="#cadb2a" strokeWidth="2"/>
//           <Circle cx="12" cy="12" r="3" fill="#cadb2a"/>
//         </Svg>
//       ),
//       title: 'Transmission',
//       subtitle: 'Auto'
//     },
//     {
//       icon: (
//         <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//           <Path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="#cadb2a"/>
//         </Svg>
//       ),
//       title: 'Door & Seats',
//       subtitle: '4 Doors and 7 Seats'
//     },
//     {
//       icon: (
//         <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//           <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#cadb2a"/>
//           <Path d="M12 6v6l5 3" stroke="#cadb2a" strokeWidth="2" strokeLinecap="round"/>
//         </Svg>
//       ),
//       title: 'Air Condition',
//       subtitle: 'Climate Control'
//     },
//     {
//       icon: (
//         <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//           <Path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z" fill="#cadb2a"/>
//         </Svg>
//       ),
//       title: 'Fuel Type',
//       subtitle: 'Diesel'
//     },
//   ];

//   const detailsData = [
//     {
//       label: 'Fuel Type',
//       value: 'Gasoline',
//       icon: (
//         <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//           <Path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77z" fill="#888"/>
//         </Svg>
//       )
//     },
//     {
//       label: 'City Mpg',
//       value: '23',
//       icon: (
//         <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//           <Path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#888"/>
//         </Svg>
//       )
//     },
//     {
//       label: 'Drivetrain',
//       value: 'AWD',
//       icon: (
//         <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//           <Circle cx="12" cy="12" r="3" fill="none" stroke="#888" strokeWidth="2"/>
//           <Path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="#888" strokeWidth="2"/>
//         </Svg>
//       )
//     },
//     {
//       label: 'Engine',
//       value: '2.0L I4 16v GDI',
//       icon: (
//         <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//           <Path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="none" stroke="#888" strokeWidth="2"/>
//         </Svg>
//       )
//     },
//     {
//       label: 'Exterior Color',
//       value: 'Jet Black',
//       icon: (
//         <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//           <Circle cx="12" cy="12" r="10" fill="none" stroke="#888" strokeWidth="2"/>
//           <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#888"/>
//         </Svg>
//       )
//     },
//     {
//       label: 'Interior Color',
//       value: 'Black',
//       icon: (
//         <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//           <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#888"/>
//         </Svg>
//       )
//     },
//     {
//       label: 'Transmission',
//       value: '8-Speed Automatic',
//       icon: (
//         <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//           <Path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="none" stroke="#888" strokeWidth="2"/>
//           <Circle cx="12" cy="12" r="3" fill="#888"/>
//         </Svg>
//       )
//     },
//   ];

//   const features = [
//     'Alarm System',
//     'Premium sound system',
//     'Heads up display',
//     'Bluetooth system',
//     'Climate Control',
//     'Keyless Entry',
//     'Cruise Control',
//     'Park assist system',
//   ];

//   const tabs = ['Details', 'Features', 'Exterior', 'Comments'];

//   return (
//     <View style={{ flex: 1, backgroundColor: '#000000' }}>
//   <LinearGradient
//     colors={['rgba(202, 219, 42, 0)', 'rgba(202, 219, 42, 0.46)']}
//     style={styles.container}
//   >
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={onBack} style={styles.backButton}>
//           <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//             <Path
//               d="M15 18L9 12L15 6"
//               stroke="#ffffff"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </Svg>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Car Detail Page</Text>
//         <View style={styles.notificationButton}>
//           <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//             <Path
//               d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
//               stroke="#cadb2a"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </Svg>
//           <View style={styles.notificationDot} />
//         </View>
//       </View>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Feature Cards */}
//         <View style={styles.cardsContainer}>
//           <View style={styles.cardRow}>
//             {featureCards.slice(0, 2).map((card, index) => (
//               <View key={index} style={styles.featureCard}>
//                 <View style={styles.iconContainer}>
//                   {card.icon}
//                 </View>
//                 <Text style={styles.cardTitle}>{card.title}</Text>
//                 <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
//               </View>
//             ))}
//           </View>
//           <View style={styles.cardRow}>
//             {featureCards.slice(2, 4).map((card, index) => (
//               <View key={index} style={styles.featureCard}>
//                 <View style={styles.iconContainer}>
//                   {card.icon}
//                 </View>
//                 <Text style={styles.cardTitle}>{card.title}</Text>
//                 <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* Tabs */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.tabsScrollView}
//           contentContainerStyle={styles.tabsContainer}
//         >
//           {tabs.map((tab) => (
//             <TouchableOpacity
//               key={tab}
//               style={[styles.tab, activeTab === tab && styles.activeTab]}
//               onPress={() => setActiveTab(tab)}
//             >
//               <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
//                 {tab}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Details Section */}
//         {activeTab === 'Details' && (
//           <View style={styles.contentContainer}>
//             {detailsData.map((item, index) => (
//               <View key={index} style={styles.detailRow}>
//                 <View style={styles.detailLabelContainer}>
//                   {item.icon}
//                   <Text style={styles.detailLabel}>{item.label}</Text>
//                 </View>
//                 <Text style={styles.detailValue}>{item.value}</Text>
//               </View>
//             ))}
//             <TouchableOpacity style={styles.showMoreButton}>
//               <Text style={styles.showMoreText}>Show More ...</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Features Section */}
//         {activeTab === 'Features' && (
//           <View style={styles.contentContainer}>
//             {features.map((feature, index) => (
//               <View key={index} style={styles.featureRow}>
//                 <View style={styles.bulletContainer}>
//                   <View style={styles.bullet} />
//                   <Text style={styles.featureText}>{feature}</Text>
//                 </View>
//                 {index === features.length - 1 && (
//                   <TouchableOpacity style={styles.checkButton}>
//                     <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//                       <Circle cx="12" cy="12" r="10" stroke="#cadb2a" strokeWidth="2" />
//                       <Path d="M9 12l2 2 4-4" stroke="#cadb2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                     </Svg>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             ))}
//             <TouchableOpacity style={styles.showMoreButton}>
//               <Text style={styles.showMoreText}>Show More ...</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Exterior Section */}
//         {activeTab === 'Exterior' && (
//           <View style={styles.exteriorContainer}>
//             <Image
//               source={{ uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80' }}
//               style={styles.carImage}
//               resizeMode="contain"
//             />
//           </View>
//         )}

//         {/* Comments Section */}
//         {activeTab === 'Comments' && (
//           <View style={styles.commentsContainer}>
//             <TouchableOpacity style={styles.commentsButton}>
//               <Text style={styles.commentsButtonText}>Comments & Terms Conditions</Text>
//               <Text style={styles.dropdownArrow}>▼</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </LinearGradient>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingTop: 50,
//     paddingBottom: 16,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontFamily: 'Poppins',
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   notificationButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   notificationDot: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#cadb2a',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   cardsContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   cardRow: {
//     flexDirection: 'row',
//     gap: 16,
//     marginBottom: 16,
//   },
//   featureCard: {
//     flex: 1,
//     backgroundColor: '#000000',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 2,
//     borderColor: '#1a1a1a',
//   },
//   iconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 12,
//     backgroundColor: '#1a1a1a',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//     borderWidth: 2,
//     borderColor: '#cadb2a',
//   },
//   cardTitle: {
//     fontFamily: 'Poppins',
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#ffffff',
//     marginBottom: 4,
//   },
//   cardSubtitle: {
//     fontFamily: 'Poppins',
//     fontSize: 12,
//     color: '#888888',
//   },
//   tabsScrollView: {
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   tabsContainer: {
//     paddingHorizontal: 16,
//     gap: 8,
//   },
//   tab: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//     backgroundColor: 'transparent',
//     marginRight: 8,
//   },
//   activeTab: {
//     backgroundColor: '#cadb2a',
//   },
//   tabText: {
//     fontFamily: 'Poppins',
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#ffffff',
//   },
//   activeTabText: {
//     color: '#000000',
//     fontWeight: '600',
//   },
//   contentContainer: {
//     marginHorizontal: 16,
//     backgroundColor: '#0a0a0a',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#1a1a1a',
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#1a1a1a',
//   },
//   detailLabelContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   detailLabel: {
//     fontFamily: 'Poppins',
//     fontSize: 14,
//     color: '#ffffff',
//   },
//   detailValue: {
//     fontFamily: 'Poppins',
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   showMoreButton: {
//     alignItems: 'center',
//     paddingTop: 16,
//   },
//   showMoreText: {
//     fontFamily: 'Poppins',
//     fontSize: 14,
//     color: '#888888',
//   },
//   featureRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//   },
//   bulletContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   bullet: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#cadb2a',
//     marginRight: 12,
//   },
//   featureText: {
//     fontFamily: 'Poppins',
//     fontSize: 14,
//     color: '#ffffff',
//   },
//   checkButton: {
//     padding: 4,
//   },
//   exteriorContainer: {
//     marginHorizontal: 16,
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     padding: 20,
//     height: 300,
//   },
//   carImage: {
//     width: '100%',
//     height: '100%',
//   },
//   commentsContainer: {
//     marginHorizontal: 16,
//   },
//   commentsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#0a0a0a',
//     borderRadius: 12,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#1a1a1a',
//   },
//   commentsButtonText: {
//     fontFamily: 'Poppins',
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#ffffff',
//   },
//   dropdownArrow: {
//     color: '#cadb2a',
//     fontSize: 14,
//   },
// });