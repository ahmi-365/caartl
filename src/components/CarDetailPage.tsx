import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    LayoutChangeEvent,
    Linking,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text, // 🟢 Used for WhatsApp
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// 🟢 Import FlatList from gesture-handler for better gesture support
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import {
    FlatList, Gesture,
    GestureDetector,
    GestureHandlerRootView,
    Pressable
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import * as Models from '../data/modal';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiService from '../services/ApiService';
import CustomAlert from './ui/CustomAlert';

type CarDetailRouteProp = RouteProp<RootStackParamList, 'CarDetailPage'>;
type CarDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CarDetailPage'>;

const { width, height } = Dimensions.get('window');
const STORAGE_BASE_URL = 'https://api.caartl.com/storage/';
const TAB_BAR_HEIGHT = 60;
const WHATSAPP_NUMBER = '923094174580'; // 🟢 Target Number

// ==========================================
// 1. UPDATED ZOOMABLE IMAGE (Sliding Compatible)
// ==========================================
const ZoomableImage = ({ uri, onRequestScrollToggle }: { uri: string, onRequestScrollToggle: (locked: boolean) => void }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    runOnJS(setIsZoomed)(false);
    runOnJS(onRequestScrollToggle)(false);
  };

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      runOnJS(setIsZoomed)(true);
      runOnJS(onRequestScrollToggle)(true);
    })
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
      if (scale.value < 1) scale.value = 1;
      if (scale.value > 5) scale.value = 5;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1.1) {
        resetZoom();
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1.1) {
        const maxTranslateX = (width * (scale.value - 1)) / 2;
        const maxTranslateY = (height * 0.8 * (scale.value - 1)) / 2;
        translateX.value = Math.min(Math.max(savedTranslateX.value + e.translationX, -maxTranslateX), maxTranslateX);
        translateY.value = Math.min(Math.max(savedTranslateY.value + e.translationY, -maxTranslateY), maxTranslateY);
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.1) {
        resetZoom();
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
        runOnJS(setIsZoomed)(true);
        runOnJS(onRequestScrollToggle)(true);
      }
    });

  const composed = isZoomed
    ? Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture)
    : Gesture.Simultaneous(pinchGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.Image
          source={{ uri }}
          style={[{ width: '100%', height: '80%', resizeMode: 'contain' }, animatedStyle]}
        />
      </Animated.View>
    </GestureDetector>
  );
};

// ==========================================
// 2. UPDATED GALLERY MODAL (FlatList)
// ==========================================
const ImagePreviewModal = ({ visible, images = [], initialIndex = 0, onClose, isWhiteBackground = false }: any) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    if (visible && images.length > 0) {
      setCurrentIndex(initialIndex);
      setScrollEnabled(true);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);
    }
  }, [visible, initialIndex, images]);

  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const handleScrollToggle = (locked: boolean) => {
    setScrollEnabled(!locked);
  };

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose} animationType="fade">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.previewContainer, isWhiteBackground && styles.previewContainerWhite]}>
          <TouchableOpacity 
            style={styles.previewCloseBtn} 
            onPress={onClose} 
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            zIndex={20}
          >
            <Feather name="x" size={30} color={isWhiteBackground ? "#000" : "#fff"} />
          </TouchableOpacity>

          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={scrollEnabled} 
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={onScroll}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            initialScrollIndex={initialIndex}
            waitFor={scrollEnabled ? undefined : undefined} 
            renderItem={({ item }) => (
              <View style={{ width: width, height: height, justifyContent: 'center' }}>
                <ZoomableImage 
                  uri={item} 
                  onRequestScrollToggle={handleScrollToggle}
                />
              </View>
            )}
          />

          {images.length > 1 && (
            <View style={styles.previewPagination}>
              {images.map((_: any, i: number) => (
                <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
              ))}
            </View>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const VideoPlayerModal = ({ visible, videoUrl, onClose }: any) => (
  <Modal visible={visible} transparent={true} onRequestClose={onClose} animationType="slide">
    <View style={styles.videoModalContainer}>
      <TouchableOpacity style={styles.videoCloseBtn} onPress={onClose}><Feather name="x" size={30} color="#fff" /></TouchableOpacity>
      {videoUrl ? (
        <Video
          source={{ uri: videoUrl }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          useNativeControls
          style={styles.fullscreenVideo}
          onError={(e) => console.log("Video Error:", e)}
        />
      ) : (
        <ActivityIndicator size="large" color="#cadb2a" />
      )}
    </View>
  </Modal>
);

const SpecCard = ({ icon, title, sub }: { icon: any, title: string, sub: string | number }) => (
  <View style={styles.specCard}>
    <MaterialCommunityIcons name={icon} size={28} color="#cadb2a" style={{ marginBottom: 8 }} />
    <Text style={styles.specTitle}>{title}</Text>
    <Text style={styles.specSub}>{sub}</Text>
  </View>
);

const formatKey = (key: string) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const InspectionAccordion = ({ title, children, isOpen, onPress }: any) => (
  <View style={styles.accordionContainer}>
    <TouchableOpacity style={styles.accordionHeader} onPress={onPress}>
      <Text style={styles.accordionTitle}>{title}</Text>
      <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#cadb2a" />
    </TouchableOpacity>
    {isOpen && <View style={styles.accordionContent}>{children}</View>}
  </View>
);

const getPaintBadgeColor = (condition: string) => {
  const parts = condition.split(':');
  let colorName = '#333';
  let label = condition;

  if (parts.length > 1) {
    const colorKey = parts[0].trim().toLowerCase();
    label = parts[1].trim();
    switch (colorKey) {
      case 'red': colorName = '#ff4444'; break;
      case 'blue': colorName = '#4488ff'; break;
      case 'green': colorName = '#2ecc71'; break;
      case 'orange': colorName = '#e67e22'; break;
      case 'yellow': colorName = '#f1c40f'; break;
      case 'pink': colorName = '#e91e63'; break;
      case 'purple': colorName = '#9b59b6'; break;
      default: colorName = '#555';
    }
  } else if (condition.toLowerCase().includes('original')) {
    colorName = '#27ae60';
  }
  return { backgroundColor: colorName, label };
};

const getSeverityBorderColor = (severity: string) => {
  const s = (severity || "").toLowerCase();
  if (s.includes('minor')) return '#4488ff';
  if (s.includes('moderate')) return '#e67e22';
  if (s.includes('major') || s.includes('severe')) return '#ff4444';
  return '#333';
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export const CarDetailPage = () => {
  const navigation = useNavigation<CarDetailNavigationProp>();
  const route = useRoute<CarDetailRouteProp>();
  const { carId } = route.params;

  const { user, isGuest, isUnapproved } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showApprovalAlert, setShowApprovalAlert] = useState(false);

  const [fullData, setFullData] = useState<Models.AuctionDetailsResponse['data'] | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'none' | 'pending_payment' | 'intransfer' | 'delivered'>('none');
  const [damageTypes, setDamageTypes] = useState<any[]>([]);

  // UI States
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeInspectionIndex, setActiveInspectionIndex] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [expandedDamageCategories, setExpandedDamageCategories] = useState<{ [key: string]: boolean }>({});
  const [activeAccordion, setActiveAccordion] = useState<string | null>('Engine');
  const [activeTab, setActiveTab] = useState('Overview');

  // Media States
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewMap, setIsPreviewMap] = useState(false);
  
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  // Inquire Modal
  const [inquireVisible, setInquireVisible] = useState(false);
  const [inqName, setInqName] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqAddress, setInqAddress] = useState('');
  // 🟢 New Comment State
  const [inqComment, setInqComment] = useState('');
  
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Scroll
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionYCoords = useRef<{ [key: string]: number }>({});
  const isManualScroll = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const detailsRes = await apiService.getAuctionDetails(carId);
        if (detailsRes.success && detailsRes.data.data) {
          setFullData(detailsRes.data.data);
        }

        const bookRes = await apiService.getBookingByVehicle(carId);
        if (bookRes.success && bookRes.data.data && bookRes.data.data.data.length > 0) {
          const latestBooking = bookRes.data.data.data[0];
          setBookingStatus(latestBooking.status);
        }

        const dmgRes = await apiService.apiCall<any>('/admin/inspection-reports/damage-types');
        if (dmgRes.success && Array.isArray(dmgRes.data.data)) {
          setDamageTypes(dmgRes.data.data);
        }

      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [carId]);

  useEffect(() => {
    if (user) {
      setInqName(user.name);
      setInqEmail(user.email);
      setInqPhone(user.phone || '');
    }
  }, [user]);

  const getDamageBadgeColor = (damageType: string) => {
    const found = damageTypes.find(d => d.name.toLowerCase() === damageType.toLowerCase());
    return found ? found.color : '#ff4444';
  };

  const toggleDamageCategory = (category: string) => {
    setExpandedDamageCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleLayout = (e: LayoutChangeEvent, section: string) => {
    sectionYCoords.current[section] = e.nativeEvent.layout.y;
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    isManualScroll.current = true;
    requestAnimationFrame(() => {
      const y = sectionYCoords.current[tab];
      if (y !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: y - TAB_BAR_HEIGHT - 10, animated: true });
      }
    });
    setTimeout(() => { isManualScroll.current = false; }, 400);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualScroll.current) return;
    const scrollY = event.nativeEvent.contentOffset.y;
    const triggerPoint = scrollY + TAB_BAR_HEIGHT + 100;
    let currentTab = dynamicTabs[0];
    for (const tab of dynamicTabs) {
      const sectionY = sectionYCoords.current[tab];
      if (sectionY !== undefined && triggerPoint >= sectionY) {
        currentTab = tab;
      }
    }
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  };

  const handleBookNow = () => {
    // 🟢 Guest check
    if (isGuest) {
      setShowLoginAlert(true);
      return;
    }
    // 🟢 Unapproved user check
    if (isUnapproved) {
      setShowApprovalAlert(true);
      return;
    }
    if (fullData?.vehicle) {
      navigation.navigate('BookCar', { vehicle: fullData.vehicle });
    } else {
      showAlert("Error", "Vehicle data not available.");
    }
  };

  const handleViewBooking = () => {
    navigation.navigate('ViewBooking', { vehicleId: carId });
  };

  const handleImageOpen = (imagesList: string[], index: number, isMap: boolean = false) => {
    setPreviewImages(imagesList);
    setPreviewIndex(index);
    setIsPreviewMap(isMap);
  };

  const handleVideoOpen = (uri: string) => {
    setCurrentVideoUrl(uri);
    setVideoModalVisible(true);
  };

  // 🟢 UPDATED: Send Inquiry via WhatsApp
  const handleSubmitInquiry = async () => {
    if (!inqName) {
      showAlert("Required", "Please enter your Name.");
      return;
    }

    setSubmittingInquiry(true);

    const carName = `${vehicle.brand?.name || ''} ${vehicle.vehicle_model?.name || ''} ${vehicle.year || ''}`;
    
    // Construct Message
    const message = `Hello, I am interested in this car:
*${carName}* (ID: ${carId})

*My Details:*
Name: ${inqName}
Email: ${inqEmail || 'N/A'}
Phone: ${inqPhone || 'N/A'}
Address: ${inqAddress || 'N/A'}

*Comment:*
${inqComment}`;

    // Create WhatsApp Link
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

    try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
            setInquireVisible(false); // Close modal on success
        } else {
            showAlert("Error", "WhatsApp is not installed on this device.");
        }
    } catch (error) {
        console.error("WhatsApp Error", error);
        showAlert("Error", "Could not open WhatsApp.");
    } finally {
        setSubmittingInquiry(false);
    }
  };

  // --- Data Parsing ---
  const latestInspection = useMemo(() => {
    if (!fullData?.inspections && !fullData?.vehicle?.inspections) return null;
    const list = fullData.inspections || fullData.vehicle.inspections || [];
    return list.length > 0 ? list[list.length - 1] : null;
  }, [fullData]);

  const groupedDamages = useMemo(() => {
    if (!latestInspection?.damages) return {};
    const groups: { [key: string]: any[] } = {};
    latestInspection.damages.forEach((dmg: any) => {
      let category = 'Other';
      const part = (dmg.body_part || '').toLowerCase();
      if (part.includes('door') || part.includes('fender') || part.includes('panel')) category = 'Doors & Panels';
      else if (part.includes('glass') || part.includes('shield') || part.includes('light')) category = 'Glass & Lights';
      else if (part.includes('bumper') || part.includes('hood') || part.includes('trunk')) category = 'Bumpers & Hood';
      else if (part.includes('wheel') || part.includes('tire') || part.includes('rim')) category = 'Wheels & Tires';
      else if (part.includes('roof')) category = 'Roof';
      if (!groups[category]) groups[category] = [];
      groups[category].push(dmg);
    });
    return groups;
  }, [latestInspection]);

  if (loading || !fullData?.vehicle) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#cadb2a" /></View>;
  }

  const vehicle = fullData.vehicle;

  const getCategorizedInspection = (inspection: any) => {
    if (!inspection) return null;
    const usedKeys = new Set<string>();
    const getField = (key: string, label?: string) => {
      let val = inspection[key];
      if (val === null || val === undefined) return null;
      if (typeof val === 'object') {
        if (val.name) val = val.name;
        else if (val.value) val = val.value;
        else return null;
      }
      usedKeys.add(key);
      let media = null;
      if (inspection.fields) {
        const fieldObj = inspection.fields.find((f: any) => f.name === key);
        if (fieldObj && fieldObj.files && fieldObj.files.length > 0) media = fieldObj.files[0];
      }
      return { label: label || formatKey(key), value: String(val), media };
    };

    const categories = {
      engine: [getField('engineCondition', 'Engine Condition'), getField('engineOil', 'Engine Oil'), getField('transmissionCondition', 'Transmission'), getField('gearOil', 'Gear Oil'), getField('fourWdSystemCondition', '4WD System')].filter((item): item is { label: string, value: any, media: any } => !!item),
      steering: [getField('steeringOperation', 'Steering'), getField('suspension', 'Suspension'), getField('shockAbsorberOperation', 'Shock Absorbers'), getField('brakePads', 'Brake Pads')].filter((item): item is { label: string, value: any, media: any } => !!item),
      interior: [getField('acCooling', 'AC Cooling'), getField('seatsCondition', 'Seats'), getField('sunroofCondition', 'Sunroof'), getField('windowsControl', 'Windows'), getField('centralLockOperation', 'Central Lock')].filter((item): item is { label: string, value: any, media: any } => !!item),
      exterior: [getField('overallCondition', 'Overall'), getField('body_type', 'Body Type'), getField('parkingSensors', 'Parking Sensors')].filter((item): item is { label: string, value: any, media: any } => !!item),
      wheels: [getField('wheelsType', 'Wheels Type'), getField('tiresSize', 'Tires Size'), getField('rimsSizeFront', 'Front Rims')].filter((item): item is { label: string, value: any, media: any } => !!item),
    };
    const ignoredKeys = ['id', 'vehicle_id', 'created_at', 'updated_at', 'file_path', 'damage_file_path', 'images', 'damages', 'fields', 'paintCondition', 'final_conclusion', 'remarks', 'make', 'model', 'vehicle', 'pivot', 'inspector', 'inspector_id', 'inspection_enquiry_id', 'brand', 'vehicle_model'];
    const otherItems = Object.keys(inspection)
      .filter(key => !usedKeys.has(key) && !ignoredKeys.includes(key) && inspection[key] !== null && inspection[key] !== '')
      .map(key => getField(key));

    // @ts-ignore
    categories.other = otherItems.filter(item => !!item);
    return categories;
  };
  const categorizedData = getCategorizedInspection(latestInspection);

  const renderInspectionRow = (item: any, idx: number) => (
    <View key={idx} style={styles.inspectionRow}>
      <Text style={styles.inspLabel}>{item.label}</Text>
      <View style={styles.inspValueContainer}>
        <Text style={styles.inspValue}>{item.value}</Text>
        {item.media && (
          <TouchableOpacity
            onPress={() => {
              const path = item.media.path.startsWith('http') ? item.media.path : `${STORAGE_BASE_URL}${item.media.path}`;
              if (item.media.file_type === 'video') handleVideoOpen(path);
              else handleImageOpen([path], 0, false); // Handle single image
            }}
            style={styles.mediaBtnRight}
          >
            <FontAwesome5 name="eye" size={16} color="#cadb2a" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const offerPrice = Number(vehicle.price || vehicle.starting_bid_amount || 0);

  const imageList = vehicle.images?.map((img: any) => img.path) || [];
  if (vehicle.cover_image && typeof vehicle.cover_image !== 'string') {
    if (!imageList.includes(vehicle.cover_image.path)) imageList.unshift(vehicle.cover_image.path);
  } else if (vehicle.brand?.image_source && imageList.length === 0) {
    imageList.push(vehicle.brand.image_source);
  }

  const exteriorFeatures = fullData?.exterior_features || [];
  const interiorFeatures = fullData?.interior_features || [];
  const allFeaturesCombined = [...exteriorFeatures, ...interiorFeatures];
  const displayedFeatures = showAllFeatures ? allFeaturesCombined : allFeaturesCombined.slice(0, 10);
  const dynamicTabs = ['Overview', 'Details'];
  if (allFeaturesCombined.length > 0) dynamicTabs.push('Features');
  if (latestInspection) dynamicTabs.push('Inspection');
  dynamicTabs.push('Remarks');

  const detailItems = [
    { label: 'VIN', val: vehicle.vin },
    { label: 'Engine Type', val: vehicle.engine_type },
    { label: 'Engine CC', val: vehicle.engine_cc ? `${vehicle.engine_cc} cc` : null },
    { label: 'Horsepower', val: vehicle.horsepower },
    { label: 'Torque', val: vehicle.torque },
    { label: 'Cylinders', val: vehicle.no_of_cylinder },
    { label: 'Drive Type', val: vehicle.drive_type },
    { label: 'Fuel Type', val: vehicle.fuel_type_id === 1 ? 'Petrol' : (vehicle.fuel_type_id === 2 ? 'Diesel' : null) },
    { label: 'Transmission', val: vehicle.transmission_id === 1 ? 'Automatic' : (vehicle.transmission_id === 2 ? 'Manual' : null) },
    { label: 'Body Type', val: vehicle.body_type_id },
    { label: 'Color', val: vehicle.color },
    { label: 'Interior', val: vehicle.interior_color },
    { label: 'Mileage', val: vehicle.mileage ? `${vehicle.mileage} km` : null },
    { label: 'Condition', val: vehicle.condition },
  ].filter(item => item.val !== null && item.val !== undefined && item.val !== '');

  const renderStatusCard = () => {
    if (bookingStatus !== 'none') {
      const statusColor = bookingStatus === 'pending_payment' ? '#ffaa00' : (bookingStatus === 'intransfer' ? '#00a8ff' : '#cadb2a');
      const statusIcon = bookingStatus === 'pending_payment' ? 'clock' : (bookingStatus === 'intransfer' ? 'truck' : 'check-circle');
      const statusIconComponent = <Feather name={statusIcon} size={40} color={statusColor} style={{ marginBottom: 10 }} />;

      if (bookingStatus === 'pending_payment') {
        return (
          <View style={styles.statusCard}>
            {statusIconComponent}
            <Text style={styles.statusTitle}>Payment Pending</Text>
            <Text style={styles.statusSubText}>Complete payment to confirm your booking.</Text>
          </View>
        );
      }
      if (bookingStatus === 'intransfer') {
        return (
          <View style={styles.statusCard}>
            {statusIconComponent}
            <Text style={styles.statusTitle}>Vehicle In-Transfer</Text>
            <Text style={styles.statusSubText}>Your vehicle is currently being transferred. Tracking info will be updated soon.</Text>
          </View>
        );
      }
      if (bookingStatus === 'delivered') {
        return (
          <View style={styles.statusCard}>
            {statusIconComponent}
            <Text style={styles.statusTitle}>Vehicle Delivered</Text>
            <Text style={styles.statusSubText}>Your vehicle has been successfully delivered. Enjoy your ride!</Text>
          </View>
        );
      }
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a00', '#26270c']} style={styles.gradient}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          stickyHeaderIndices={[1]}
          showsVerticalScrollIndicator={false}
        >

          {/* Index 0: Top Wrapper (Banner, Desc, Status Card) */}
          <View>
            {/* BANNER SLIDER WITH OVERLAY */}
            <View style={{ height: 250, marginBottom: 15 }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveBannerIndex(idx);
                }}
              >
                {imageList.map((img, index) => (
                  <TouchableOpacity key={index} onPress={() => handleImageOpen(imageList, index, false)}>
                    <Image source={{ uri: img }} style={{ width: width, height: 250, resizeMode: 'cover' }} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']} style={styles.imageOverlay}>
                <View style={styles.bannerContent}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', }}>
                    <View style={{ flex: 1, paddingRight: 5 }}>
                      <Text style={styles.carBrand}>{vehicle.brand?.name}</Text>
                      <Text style={styles.carModel} numberOfLines={2} adjustsFontSizeToFit>
                        {vehicle.vehicle_model?.name} {vehicle.year}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.bannerPriceLabel, { textAlign: 'right' }]}>Offer Price</Text>
                        <Text style={styles.bannerPriceValue}>AED {offerPrice.toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
              <View style={styles.paginationContainer}>
                {imageList.map((_, i) => (
                  <View key={i} style={[styles.dot, i === activeBannerIndex && styles.activeDot]} />
                ))}
              </View>
            </View>

            {vehicle.description && (
              <View style={[styles.sectionContainer, { paddingTop: 0 }]}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{vehicle.description}</Text>
              </View>
            )}

            {renderStatusCard()}
          </View>

          {/* Index 1: Sticky Tabs */}
          <View style={styles.stickyTabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
              {dynamicTabs.map((tab) => (
                <Pressable
                  key={tab}
                  style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                  onPress={() => handleTabPress(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Index 2+: Sections */}
          <View onLayout={(e) => handleLayout(e, 'Overview')} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.specCardsGrid}>
              <SpecCard icon="car-shift-pattern" title="Trans." sub={vehicle.transmission_id === 1 ? 'Auto' : 'Manual'} />
              <SpecCard icon="car-door" title="Seats" sub={`${vehicle.doors || 'N/A'} Dr, ${vehicle.seats || 'N/A'} St`} />
              <SpecCard icon="fan" title="A/C" sub="Climate Ctrl" />
              <SpecCard icon="gas-station" title="Fuel" sub={vehicle.fuel_type_id === 1 ? 'Petrol' : (vehicle.fuel_type_id === 2 ? 'Diesel' : 'N/A')} />
            </View>
          </View>

          <View onLayout={(e) => handleLayout(e, 'Details')} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            <View style={styles.detailsListContainer}>
              {detailItems.slice(0, showAllDetails ? undefined : 8).map((item, idx) => {
                const isLast = idx === (showAllDetails ? detailItems.length : 8) - 1;
                return (
                  <View key={idx} style={[styles.detailListRow, isLast && { borderBottomWidth: 0 }]}>
                    <Text style={styles.detailListLabel}>{item.label}</Text>
                    <Text style={styles.detailListValue}>{item.val}</Text>
                  </View>
                );
              })}
            </View>
            {detailItems.length > 8 && (
              <TouchableOpacity style={styles.showMoreBtn} onPress={() => setShowAllDetails(!showAllDetails)}>
                <Text style={styles.showMoreText}>{showAllDetails ? 'Show Less' : 'Show More ...'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {allFeaturesCombined.length > 0 && (
            <View onLayout={(e) => handleLayout(e, 'Features')} style={styles.sectionContainer}>
              <View style={styles.featureHeader}>
                <Text style={styles.sectionTitle}>Features</Text>
                <View style={styles.badgeIcon}><Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>PRO</Text></View>
              </View>
              {displayedFeatures.map((f: any, idx: number) => (
                <View key={idx} style={styles.featureRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={styles.bullet} />
                    <Text style={styles.featureText}>{f.name}</Text>
                  </View>
                  <Feather name="check-circle" size={18} color="#cadb2a" />
                </View>
              ))}
              {allFeaturesCombined.length > 10 && (
                <TouchableOpacity style={styles.showMoreBtn} onPress={() => setShowAllFeatures(!showAllFeatures)}>
                  <Text style={styles.showMoreText}>{showAllFeatures ? 'Show Less' : 'Show More ...'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {latestInspection && (
            <View onLayout={(e) => handleLayout(e, 'Inspection')} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Inspection Report</Text>

              <InspectionAccordion title="Engine & Transmission" isOpen={activeAccordion === 'Engine'} onPress={() => setActiveAccordion(activeAccordion === 'Engine' ? null : 'Engine')}>
                {categorizedData.engine.length > 0 ? categorizedData.engine.map(renderInspectionRow) : <Text style={{ color: '#666' }}>No data.</Text>}
              </InspectionAccordion>
              <InspectionAccordion title="Steering & Suspension" isOpen={activeAccordion === 'Steering'} onPress={() => setActiveAccordion(activeAccordion === 'Steering' ? null : 'Steering')}>
                {categorizedData.steering.length > 0 ? categorizedData.steering.map(renderInspectionRow) : <Text style={{ color: '#666' }}>No data.</Text>}
              </InspectionAccordion>
              <InspectionAccordion title="Interior & Electrical" isOpen={activeAccordion === 'Interior'} onPress={() => setActiveAccordion(activeAccordion === 'Interior' ? null : 'Interior')}>
                {categorizedData.interior.length > 0 ? categorizedData.interior.map(renderInspectionRow) : <Text style={{ color: '#666' }}>No data.</Text>}
              </InspectionAccordion>
              <InspectionAccordion title="Exterior" isOpen={activeAccordion === 'Exterior'} onPress={() => setActiveAccordion(activeAccordion === 'Exterior' ? null : 'Exterior')}>
                {categorizedData.exterior.length > 0 ? categorizedData.exterior.map(renderInspectionRow) : <Text style={{ color: '#666' }}>No data.</Text>}
              </InspectionAccordion>
              <InspectionAccordion title="Wheels & Tires" isOpen={activeAccordion === 'Wheels'} onPress={() => setActiveAccordion(activeAccordion === 'Wheels' ? null : 'Wheels')}>
                {categorizedData.wheels.length > 0 ? categorizedData.wheels.map(renderInspectionRow) : <Text style={{ color: '#666' }}>No data.</Text>}
              </InspectionAccordion>

              {/* @ts-ignore */}
              {categorizedData.other && categorizedData.other.length > 0 && (
                <InspectionAccordion title="Other Information" isOpen={activeAccordion === 'Other'} onPress={() => setActiveAccordion(activeAccordion === 'Other' ? null : 'Other')}>
                  {/* @ts-ignore */}
                  {categorizedData.other.map(renderInspectionRow)}
                </InspectionAccordion>
              )}

              {latestInspection.final_conclusion ? (
                <View style={[styles.commentContainer, { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 }]}>
                  <Text style={[styles.subSectionTitle, { color: '#cadb2a' }]}>Final Conclusion</Text>
                  <Text style={[styles.descriptionText, { fontWeight: 'bold' }]}>{latestInspection.final_conclusion}</Text>
                </View>
              ) : null}

              {latestInspection.damage_file_path && (
                <View style={{ marginTop: 20 }}>
                  <TouchableOpacity onPress={() => handleImageOpen([latestInspection.damage_file_path], 0, true)} style={styles.damageMapContainer}>
                    <Image source={{ uri: latestInspection.damage_file_path }} style={styles.damageMapImage} resizeMode="cover" />
                  </TouchableOpacity>
                </View>
              )}

              {latestInspection.paintCondition && latestInspection.paintCondition.length > 0 && (
                <View style={styles.infoBlock}>
                  <Text style={styles.subSectionTitle}>Paint Condition</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                    {latestInspection.paintCondition.map((pc: string, i: number) => {
                      const { backgroundColor, label } = getPaintBadgeColor(pc);
                      return <View key={i} style={[styles.tag, { backgroundColor }]}><Text style={[styles.tagText, { color: '#fff', fontWeight: 'bold' }]}>{label}</Text></View>;
                    })}
                  </View>
                </View>
              )}

              {latestInspection.damages && latestInspection.damages.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={[styles.sectionTitle, { fontSize: 14, color: '#ff5555', marginBottom: 10 }]}>Reported Damages</Text>
                  {Object.entries(groupedDamages).map(([cat, items]) => {
                    const isExpanded = expandedDamageCategories[cat];
                    const displayedItems = isExpanded ? items : items.slice(0, 4);
                    return (
                      <View key={cat} style={{ marginBottom: 25 }}>
                        <Text style={[styles.subSectionTitle, { color: '#cadb2a', marginBottom: 12 }]}>{cat}</Text>
                        <View style={styles.damagesGrid}>
                          {displayedItems.map((dmg: any, idx: number) => {
                            const borderColor = getSeverityBorderColor(dmg.severity);
                            const severityColor = getDamageBadgeColor(dmg.type);
                            return (
                              <View key={idx} style={[styles.damageGridItem, { borderColor: borderColor, borderWidth: 0.1 }]}>
                                <View style={[styles.damageBadge, { backgroundColor: severityColor }]}>
                                  <Feather name="alert-circle" size={12} color="#fff" />
                                  <Text style={styles.damageText} numberOfLines={1}>{dmg.type}</Text>
                                </View>
                                <Text style={styles.damageBodyPart} numberOfLines={2}>{dmg.body_part}</Text>
                                <Text style={[styles.damageSubText, { color: '#aaa' }]}>{dmg.severity}</Text>
                              </View>
                            );
                          })}
                        </View>
                        {items.length > 4 && (
                          <TouchableOpacity style={styles.showMoreBtn} onPress={() => toggleDamageCategory(cat)}>
                            <Text style={styles.showMoreText}>{isExpanded ? `Show Less` : `Show More (${items.length - 4})`}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* INSPECTION SLIDER */}
              {latestInspection.images && latestInspection.images.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Inspection Gallery</Text>
                  <View style={{ height: 250, width: width, marginLeft: -16 }}>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                        setActiveInspectionIndex(idx);
                      }}
                    >
                      {latestInspection.images.map((img: any, idx: number) => {
                        const uri = img.path.startsWith('http') ? img.path : `${STORAGE_BASE_URL}${img.path}`;
                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => {
                                const inspectionUrls = latestInspection.images.map((im: any) => 
                                    im.path.startsWith('http') ? im.path : `${STORAGE_BASE_URL}${im.path}`
                                );
                                handleImageOpen(inspectionUrls, idx, false);
                            }}
                            activeOpacity={0.9}
                          >
                            <Image source={{ uri }} style={{ width: width, height: 250, resizeMode: 'cover' }} />
                          </TouchableOpacity>
                        )
                      })}
                    </ScrollView>
                    <View style={styles.paginationContainer}>
                      {latestInspection.images.map((_: any, i: number) => (
                        <View key={i} style={[styles.dot, i === activeInspectionIndex && styles.activeDot]} />
                      ))}
                    </View>
                  </View>
                </View>
              )}

            </View>
          )}

          <View onLayout={(e) => handleLayout(e, 'Remarks')} style={styles.sectionContainer}>
            <View style={styles.commentBox}>
              <Text style={styles.featureText}>Comments & Remarks</Text>
              <Feather name="message-square" size={20} color="#cadb2a" />
            </View>
            <Text style={[styles.descriptionText, { marginTop: 10 }]}>{vehicle.remarks || "No remarks."}</Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer: Action Buttons */}
        {bookingStatus === 'none' ? (
          <View style={styles.negotiationFooter}>
            {user?.id !== 0 && user?.name !== 'Guest' ? (
              <TouchableOpacity style={styles.footerBtnFilled} onPress={handleBookNow}>
                <Text style={styles.footerBtnTextFilled}>Buy Now</Text>
              </TouchableOpacity>
            ) : null}

            {/* Inquire Now Button */}
            <TouchableOpacity
              style={styles.footerBtnOutline}
              onPress={() => setInquireVisible(true)}
            >
              <Text style={styles.footerBtnTextOutline}>Inquire Now</Text>
            </TouchableOpacity>

            <Text style={styles.adminFeeText}>*Admin fee <Text style={styles.adminFeeBold}>AED 1,499</Text> will be charged</Text>
          </View>
        ) : (
          <View style={styles.negotiationFooter}>
            <TouchableOpacity style={styles.footerBtnOutline} onPress={handleViewBooking}>
              <Text style={styles.footerBtnTextOutline}>View Booking</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 🟢 UPDATED: Gallery Modal (Sliding) */}
        <ImagePreviewModal
          visible={!!previewImages.length}
          images={previewImages}
          initialIndex={previewIndex}
          onClose={() => setPreviewImages([])}
          isWhiteBackground={isPreviewMap}
        />

        <VideoPlayerModal
          visible={videoModalVisible}
          videoUrl={currentVideoUrl}
          onClose={() => setVideoModalVisible(false)}
        />

        {/* Inquiry Modal */}
        <Modal visible={inquireVisible} transparent animationType="slide" onRequestClose={() => setInquireVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Inquire about {vehicle.brand?.name} {vehicle.vehicle_model?.name}</Text>
                <TouchableOpacity onPress={() => setInquireVisible(false)}>
                  <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 10 }}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} value={inqName} onChangeText={setInqName} placeholderTextColor="#666" placeholder="Your Name" />

                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} value={inqEmail} onChangeText={setInqEmail} keyboardType="email-address" placeholderTextColor="#666" placeholder="Your Email" />

                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={inqPhone} onChangeText={setInqPhone} keyboardType="phone-pad" placeholderTextColor="#666" placeholder="Your Phone" />

                <Text style={styles.label}>Address (Optional)</Text>
                <TextInput style={styles.input} value={inqAddress} onChangeText={setInqAddress} placeholderTextColor="#666" placeholder="Your Address" />

                <Text style={styles.label}>Comment (Optional)</Text>
                <TextInput 
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                  value={inqComment} 
                  onChangeText={setInqComment} 
                  placeholderTextColor="#666" 
                  placeholder="Any questions?" 
                  multiline
                />

                <TouchableOpacity
                  style={[styles.submitBtn, { flexDirection: 'row', justifyContent: 'center' }]}
                  onPress={handleSubmitInquiry}
                  disabled={submittingInquiry}
                >
                  {submittingInquiry ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <>
                      <FontAwesome5 name="whatsapp" size={18} color="#000" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>Send via WhatsApp</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* 🟢 ADD: Login Alert for guests */}
        <CustomAlert
          visible={showLoginAlert}
          title="Please Login"
          message="Create an account or login to Caartl to book this vehicle."
          onClose={() => setShowLoginAlert(false)}
        />

        {/* 🟢 ADD: Approval Alert for unapproved users */}
        <CustomAlert
          visible={showApprovalAlert}
          title="Account Pending Approval"
          message="Your account is pending approval. Please complete your payment to activate your account and book vehicles."
          onClose={() => setShowApprovalAlert(false)}
        />

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  gradient: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  headerBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'Poppins' },

  // Banner
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, paddingTop: 60, justifyContent: 'flex-end' },
  bannerContent: { flexDirection: 'column', gap: 4, marginBottom: 12 },
  carBrand: { color: '#cadb2a', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
  carModel: { color: '#fff', fontSize: 22, fontWeight: 'bold', fontFamily: 'Poppins' },
  bannerPriceLabel: { color: '#aaa', fontSize: 10, fontFamily: 'Poppins', marginBottom: 2 },
  bannerPriceValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'Lato' },
  bannerDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 15 },
  
  // 🟢 Preview Styles (Copied from Auction Screen)
  previewContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  previewContainerWhite: { backgroundColor: '#fff' },
  previewCloseBtn: { position: 'absolute', top: 50, right: 30, zIndex: 20, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  previewPagination: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 40, width: '100%' },
  
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 10, width: '100%' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#cadb2a', width: 20 },

  // Tabs
  stickyTabContainer: { backgroundColor: '#111', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222', zIndex: 100 },
  tabContent: { paddingHorizontal: 16 },
  tabItem: { paddingVertical: 8, paddingHorizontal: 16, marginRight: 10, borderRadius: 20, backgroundColor: '#000' },
  activeTabItem: { backgroundColor: '#cadb2a', borderWidth: 2, borderColor: '#000' },
  tabText: { color: '#fff', fontSize: 13, fontFamily: 'Poppins' },
  activeTabText: { color: '#111', fontWeight: 'bold' },

  // Sections
  sectionContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },
  sectionTitle: { color: '#cadb2a', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins', marginBottom: 10 },
  subSectionTitle: { color: '#aaa', fontSize: 13, fontWeight: '600', fontFamily: 'Poppins', marginBottom: 8, marginTop: 5 },
  descriptionText: { color: '#ccc', fontSize: 14, fontFamily: 'Poppins', lineHeight: 20 },

  // Specs & Details
  specCardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specCard: { width: '48%', backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 0, borderWidth: 1, borderColor: '#222' },
  specTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
  specSub: { color: '#888', fontSize: 12, marginTop: 4, fontFamily: 'Poppins' },
  detailsListContainer: { backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#222' },
  detailListRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#222', alignItems: 'center' },
  detailListLabel: { color: '#888', fontFamily: 'Poppins', fontSize: 14 },
  detailListValue: { color: '#fff', fontFamily: 'Poppins', fontWeight: '600', fontSize: 14, textAlign: 'right', flex: 1, marginLeft: 20 },
  showMoreBtn: { alignItems: 'center', marginTop: 15 },
  showMoreText: { color: '#888', fontSize: 14, fontFamily: 'Poppins' },

  // Features
  featureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeIcon: { backgroundColor: '#cadb2a', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#cadb2a', marginRight: 15 },
  featureText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins', flex: 1 },

  // Inspection
  inspectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 8 },
  inspLabel: { color: '#888', fontSize: 12, fontFamily: 'Poppins', flex: 1, marginRight: 10 },
  inspValueContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  inspValue: { color: '#cadb2a', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins', textAlign: 'right' },
  mediaBtnRight: { marginLeft: 12, padding: 4 },
  accordionContainer: { marginBottom: 10, backgroundColor: '#111', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', backgroundColor: '#1a1a1a' },
  accordionTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
  accordionContent: { padding: 15, backgroundColor: '#000' },
  commentContainer: { marginBottom: 15, paddingHorizontal: 5, marginTop: 20 },
  damageMapContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 15 },
  damageMapImage: { width: '100%', height: 200 },
  infoBlock: { marginBottom: 15, marginTop: 15 },
  tag: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, marginRight: 5, marginBottom: 5 },
  tagText: { fontSize: 12, fontFamily: 'Poppins' },
  damagesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  damageGridItem: { width: '48%', backgroundColor: '#181818', borderRadius: 8, padding: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  damageBadge: { borderRadius: 4, paddingVertical: 3, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', marginBottom: 6, width: '100%', justifyContent: 'center' },
  damageText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4, textAlign: 'center' },
  damageBodyPart: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 2 },
  damageSubText: { color: '#ccc', fontSize: 10, textAlign: 'center', marginTop: 2 },

  // Status & Footer
  statusCard: { backgroundColor: '#111', marginHorizontal: 16, marginBottom: 20, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statusTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Poppins', marginBottom: 8, textAlign: 'center' },
  statusSubText: { color: '#aaa', fontSize: 13, fontFamily: 'Poppins', textAlign: 'center', lineHeight: 20 },
  negotiationFooter: { flexDirection: 'column', alignItems: 'center', padding: 16, paddingBottom: 12, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#222' },
  footerBtnFilled: { width: '100%', backgroundColor: '#cadb2a', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
  footerBtnTextFilled: { color: '#000', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins' },
  footerBtnOutline: { width: '100%', borderWidth: 1, borderColor: '#cadb2a', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, marginTop: 10 },
  footerBtnTextOutline: { color: '#cadb2a', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins' },
  adminFeeText: { color: '#888', fontSize: 10, marginTop: 12, fontFamily: 'Poppins' },
  adminFeeBold: { color: '#fff', fontWeight: 'bold' },
  commentBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#222' },

  // Modal
  videoModalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  videoCloseBtn: { position: 'absolute', top: 50, right: 30, zIndex: 20, padding: 10 },
  fullscreenVideo: { width: width, height: height * 0.8 },

  // Inquiry Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#111', borderRadius: 16, padding: 20, maxHeight: '80%', borderWidth: 1, borderColor: '#cadb2a' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', fontFamily: 'Poppins', flex: 1 },
  label: { color: '#cadb2a', fontSize: 14, fontFamily: 'Poppins', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, color: '#fff', borderWidth: 1, borderColor: '#333' },
  submitBtn: { backgroundColor: '#cadb2a', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins' },
});