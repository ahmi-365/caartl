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
  Modal,
  Linking, // Added for PDF
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import apiService from '../services/ApiService';
import * as Models from '../data/modal';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

type CarDetailRouteProp = RouteProp<RootStackParamList, 'CarDetailPage'>;

const { width, height } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 60;
const STORAGE_BASE_URL = 'https://api.caartl.com/storage/';

// Image Preview Modal Component
const ImagePreviewModal = ({ visible, imageUrl, onClose }: { visible: boolean, imageUrl: string, onClose: () => void }) => (
  <Modal visible={visible} transparent={true} onRequestClose={onClose}>
    <View style={styles.previewContainer}>
      <TouchableOpacity style={styles.previewCloseBtn} onPress={onClose}>
        <Feather name="x" size={30} color="#fff" />
      </TouchableOpacity>
      <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="contain" />
    </View>
  </Modal>
);

export const CarDetailPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CarDetailRouteProp>();
  const { carId } = route.params;

  const [loading, setLoading] = useState(true);
  const [auctionData, setAuctionData] = useState<Models.AuctionDetailsResponse['data'] | null>(null);

  // Stores the latest inspection found inside the vehicle object
  const [inspectionData, setInspectionData] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState('Details');
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionYCoords = useRef<{ [key: string]: number }>({});
  const isManualScroll = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tabs = ['Details', 'Features', 'Inspection', 'Exterior', 'Comments'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Auction Details (ONLY this API call)
        const result = await apiService.getAuctionDetails(carId);

        if (result.success && result.data.data) {
          const data = result.data.data;
          setAuctionData(data);

          // 2. Extract Inspection Data DIRECTLY from the response
          // We take the LAST item in the inspections array as the latest report
          if (data.vehicle.inspections && data.vehicle.inspections.length > 0) {
            const latest = data.vehicle.inspections[data.vehicle.inspections.length - 1];
            setInspectionData(latest);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [carId]);

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    isManualScroll.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const y = sectionYCoords.current[tabName];
    if (y !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: y - TAB_BAR_HEIGHT, animated: true });
    }
    timeoutRef.current = setTimeout(() => { isManualScroll.current = false; }, 1000);
  };

  const onLayoutSection = (event: LayoutChangeEvent, sectionName: string) => {
    sectionYCoords.current[sectionName] = event.nativeEvent.layout.y;
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualScroll.current) return;
    const scrollY = event.nativeEvent.contentOffset.y;
    const triggerPoint = scrollY + TAB_BAR_HEIGHT + 50;

    let newActiveTab = tabs[0];
    for (let i = tabs.length - 1; i >= 0; i--) {
      const tab = tabs[i];
      const sectionTop = sectionYCoords.current[tab];
      if (sectionTop !== undefined && triggerPoint >= sectionTop) {
        newActiveTab = tab;
        break;
      }
    }
    if (newActiveTab !== activeTab) setActiveTab(newActiveTab);
  };

  // Helper to open PDF
  const openPdfReport = () => {
    if (inspectionData?.file_path) {
      // Construct full URL. Ensure no double slashes if path has leading slash
      const path = inspectionData.file_path.startsWith('/') ? inspectionData.file_path.substring(1) : inspectionData.file_path;

      // If the path is already a full URL, use it, otherwise append base
      const url = path.startsWith('http') ? path : `${STORAGE_BASE_URL}${path}`;

      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Cannot open URL: " + url);
        }
      });
    }
  };

  if (loading) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#cadb2a" /></View>;
  if (!auctionData?.vehicle) return null;

  const { vehicle, all_interior_features, all_exterior_features } = auctionData;

  // --- Image Logic ---
  const getImageUrl = (img: string | Models.VehicleImage | null | undefined): string | null => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.path;
  };

  let imageList: string[] = [];
  if (vehicle.images && vehicle.images.length > 0) {
    imageList = vehicle.images.map(img => getImageUrl(img)).filter((url): url is string => !!url);
  } else if (vehicle.cover_image) {
    const cover = getImageUrl(vehicle.cover_image);
    if (cover) imageList.push(cover);
  } else if (vehicle.brand?.image_source) {
    imageList.push(vehicle.brand.image_source);
  } else {
    imageList.push('https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png');
  }

  const mainImageUri = imageList[0];
  const thumbImages = imageList.length > 1 ? imageList.slice(0, 3) : [];

  const allFeatures = [...(all_exterior_features || []), ...(all_interior_features || [])];
  const displayedFeatures = showAllFeatures ? allFeatures : allFeatures.slice(0, 8);

  // Specs
  const specCards = [
    { icon: 'car-shift-pattern', title: 'Transmission', sub: vehicle.transmission_id === 1 ? 'Auto' : 'Manual' },
    { icon: 'car-door', title: 'Door & Seats', sub: `${vehicle.doors || 4} Doors, ${vehicle.seats || 5} Seats` },
    { icon: 'fan', title: 'Air Condition', sub: 'Climate Control' },
    { icon: 'gas-station', title: 'Fuel Type', sub: vehicle.fuel_type_id === 1 ? 'Petrol' : 'Diesel' },
  ];

  const detailItems = [
    { label: 'Fuel Type', val: vehicle.fuel_type_id === 1 ? 'Petrol' : 'Diesel', icon: 'gas-station' },
    { label: 'Drivetrain', val: vehicle.drive_type || 'AWD', icon: 'car-cog' },
    { label: 'Engine', val: `${vehicle.engine_cc} cc`, icon: 'engine' },
    { label: 'Exterior Color', val: vehicle.color || 'N/A', icon: 'palette' },
    { label: 'Interior Color', val: vehicle.interior_color || 'N/A', icon: 'seat-recline-normal' },
    { label: 'Transmission', val: vehicle.transmission_id === 1 ? 'Automatic' : 'Manual', icon: 'car-shift-pattern' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Car Detail Page</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="bell" size={24} color="#cadb2a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Top Section --- */}
        <View>
          <View style={styles.mainImageContainer}>
            <TouchableOpacity onPress={() => setPreviewImage(mainImageUri)} activeOpacity={0.9}>
              <Image source={{ uri: mainImageUri }} style={styles.carImageMain} resizeMode="cover" />
            </TouchableOpacity>
            <View style={styles.priceOverlay}>
              <Text style={styles.priceLabel}>Starting Bid</Text>
              <Text style={styles.priceText}>AED {Number(vehicle.starting_bid_amount).toLocaleString()}</Text>
            </View>
          </View>

          {imageList.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, paddingLeft: 16 }}>
              {imageList.map((img, idx) => (
                <TouchableOpacity key={idx} onPress={() => setPreviewImage(img)} style={{ marginRight: 10, borderWidth: 1, borderColor: '#cadb2a', borderRadius: 8 }}>
                  <Image source={{ uri: img }} style={{ width: 80, height: 60, borderRadius: 8 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.specGrid}>
            {specCards.map((item, idx) => (
              <View key={idx} style={styles.specCard}>
                <MaterialCommunityIcons name={item.icon as any} size={28} color="#cadb2a" style={{ marginBottom: 8 }} />
                <Text style={styles.specTitle}>{item.title}</Text>
                <Text style={styles.specSub}>{item.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* --- Sticky Tabs --- */}
        <View style={styles.stickyTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                onPress={() => handleTabPress(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- Details Section --- */}
        <View onLayout={(e) => onLayoutSection(e, 'Details')} style={styles.section}>
          {detailItems.map((item, idx) => (
            <View key={idx} style={styles.detailRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color="#888" style={{ marginRight: 10 }} />
                <Text style={styles.detailLabel}>{item.label}</Text>
              </View>
              <Text style={styles.detailVal}>{item.val}</Text>
            </View>
          ))}
        </View>

        {/* --- Features Section --- */}
        <View onLayout={(e) => onLayoutSection(e, 'Features')} style={styles.section}>
          <View style={styles.featureHeader}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.badgeIcon}><Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>PRO</Text></View>
          </View>
          {displayedFeatures.map((f, idx) => (
            <View key={idx} style={styles.featureRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.bullet} />
                <Text style={styles.featureText}>{f.name}</Text>
              </View>
              <Feather name="check-circle" size={18} color="#cadb2a" />
            </View>
          ))}
          {allFeatures.length > 8 && (
            <TouchableOpacity style={styles.showMoreBtn} onPress={() => setShowAllFeatures(!showAllFeatures)}>
              <Text style={styles.showMoreText}>{showAllFeatures ? 'Show Less' : 'Show More ...'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- INSPECTION SECTION (Data from inspections array) --- */}
        <View onLayout={(e) => onLayoutSection(e, 'Inspection')} style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Report</Text>

          {inspectionData ? (
            <>
              {/* 1. PDF Report Button */}
              {inspectionData.file_path && (
                <TouchableOpacity style={styles.pdfButton} onPress={openPdfReport}>
                  <MaterialCommunityIcons name="file-pdf-box" size={24} color="#000" />
                  <Text style={styles.pdfButtonText}>View Full Report (PDF)</Text>
                </TouchableOpacity>
              )}

              {/* 2. Damage Map Image */}
              {inspectionData.damage_file_path && (
                <View style={styles.damageMapContainer}>
                  <Text style={[styles.detailLabel, { marginBottom: 10, color: '#000', fontWeight: 'bold' }]}>Damage Assessment Map</Text>
                  <TouchableOpacity onPress={() => setPreviewImage(inspectionData.damage_file_path || '')}>
                    <Image
                      source={{ uri: inspectionData.damage_file_path }}
                      style={styles.damageMapImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* 3. Paint Condition */}
              {inspectionData.paintCondition && inspectionData.paintCondition.length > 0 && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Paint Condition</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                    {inspectionData.paintCondition.map((pc: string, i: number) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{pc}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 4. Detailed Inspection Grid */}
              <View style={styles.inspectionGrid}>
                {[
                  { label: 'Engine', value: inspectionData.engineCondition },
                  { label: 'Gearbox', value: inspectionData.transmissionCondition },
                  { label: 'AC Cooling', value: inspectionData.acCooling },
                  { label: 'Suspension', value: inspectionData.suspension },
                  { label: 'Steering', value: inspectionData.steeringOperation },
                  { label: 'Oil Leak', value: inspectionData.engineOil },
                ].map((item, idx) => (
                  item.value ? (
                    <View key={idx} style={styles.inspectionItem}>
                      <Text style={styles.inspectionLabel}>{item.label}</Text>
                      <Text style={styles.inspectionValue} numberOfLines={1}>{item.value}</Text>
                    </View>
                  ) : null
                ))}
              </View>

              {/* 5. Reported Damages List (If available) */}
              {inspectionData.damages && inspectionData.damages.length > 0 ? (
                <View style={{ marginTop: 20 }}>
                  <Text style={[styles.sectionTitle, { fontSize: 14, color: '#fff' }]}>Reported Damages</Text>
                  {inspectionData.damages.map((dmg: any, idx: number) => (
                    <View key={idx} style={styles.damageRow}>
                      <Feather name="alert-triangle" size={16} color="#ff4444" />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.damageTitle}>{dmg.body_part} - {dmg.type}</Text>
                        <Text style={styles.damageSub}>Severity: {dmg.severity}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="check-circle" size={16} color="#cadb2a" />
                  <Text style={{ color: '#ccc', marginLeft: 8, fontFamily: 'Poppins' }}>No specific damages listed.</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noReportBox}>
              <Feather name="file-text" size={24} color="#555" />
              <Text style={styles.descriptionText}>No inspection report available yet.</Text>
            </View>
          )}
        </View>

        {/* --- Exterior Section --- */}
        <View onLayout={(e) => onLayoutSection(e, 'Exterior')} style={styles.section}>
          <Text style={styles.sectionTitle}>Exterior</Text>
          <Image
            source={{ uri: mainImageUri }}
            style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 10 }}
            resizeMode="contain"
          />
          <Text style={[styles.descriptionText, { marginTop: 10 }]}>{vehicle.description || "No additional description provided."}</Text>
        </View>

        {/* --- Comments Section --- */}
        <View onLayout={(e) => onLayoutSection(e, 'Comments')} style={styles.section}>
          <View style={styles.commentBox}>
            <Text style={styles.featureText}>Comments & Terms Conditions</Text>
            <Feather name="chevron-down" size={20} color="#cadb2a" />
          </View>
          {vehicle.remarks && <Text style={[styles.descriptionText, { marginTop: 10 }]}>Remarks: {vehicle.remarks}</Text>}
        </View>

      </ScrollView>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={!!previewImage}
        imageUrl={previewImage || ''}
        onClose={() => setPreviewImage(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingCenter: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', fontFamily: 'Poppins' },
  iconButton: { padding: 8 },

  mainImageContainer: { width: '100%', height: 220, position: 'relative' },
  carImageMain: { width: '100%', height: '100%' },
  priceOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 8 },
  priceLabel: { color: '#aaa', fontSize: 10, fontFamily: 'Poppins' },
  priceText: { color: '#cadb2a', fontSize: 16, fontFamily: 'Poppins', fontWeight: '700' },

  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  specCard: { width: '48%', backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 0, borderWidth: 1, borderColor: '#222' },
  specTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
  specSub: { color: '#888', fontSize: 12, marginTop: 4, fontFamily: 'Poppins' },

  stickyTabs: { backgroundColor: '#000', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  tabItem: { marginRight: 15, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, backgroundColor: '#111' },
  activeTabItem: { backgroundColor: '#cadb2a' },
  tabText: { color: '#fff', fontFamily: 'Poppins', fontSize: 14 },
  activeTabText: { color: '#000', fontWeight: 'bold' },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { color: '#cadb2a', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins', marginBottom: 10 },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  detailLabel: { color: '#fff', fontSize: 14, fontFamily: 'Poppins' },
  detailVal: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },

  featureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeIcon: { backgroundColor: '#cadb2a', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#cadb2a', marginRight: 10 },
  featureText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins' },
  showMoreBtn: { alignItems: 'center', marginTop: 15 },
  showMoreText: { color: '#888', fontSize: 14, fontFamily: 'Poppins' },

  descriptionText: { color: '#ccc', fontSize: 14, fontFamily: 'Poppins', lineHeight: 20 },
  commentBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#222' },

  // Inspection Styles
  pdfButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#cadb2a', borderRadius: 12, padding: 15, marginBottom: 20 },
  pdfButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 10, fontFamily: 'Poppins' },

  damageMapContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 15 },
  damageMapImage: { width: '100%', height: 200 },
  infoBlock: { marginBottom: 15 },
  infoLabel: { color: '#ccc', fontSize: 12, marginBottom: 5, fontFamily: 'Poppins' },
  tag: { backgroundColor: '#333', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, marginRight: 5, marginBottom: 5 },
  tagText: { color: '#fff', fontSize: 12, fontFamily: 'Poppins' },

  inspectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  inspectionItem: { width: '48%', backgroundColor: '#111', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#222' },
  inspectionLabel: { color: '#888', fontSize: 12, fontFamily: 'Poppins' },
  inspectionValue: { color: '#cadb2a', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins', marginTop: 2 },

  damageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#111', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  damageTitle: { color: '#fff', fontSize: 14, fontWeight: '600', fontFamily: 'Poppins' },
  damageSub: { color: '#888', fontSize: 12, fontFamily: 'Poppins' },

  noReportBox: { alignItems: 'center', padding: 20, backgroundColor: '#111', borderRadius: 12, borderWidth: 1, borderColor: '#222' },

  // Preview
  previewContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '80%' },
  previewCloseBtn: { position: 'absolute', top: 50, right: 30, zIndex: 20 },
});