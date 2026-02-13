import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FlatList, Gesture,
  GestureDetector,
  GestureHandlerRootView,
  Pressable
} from 'react-native-gesture-handler'; // 🟢 Added from gesture-handler
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import CustomAlert from '../components/ui/CustomAlert';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import * as Models from '../data/modal';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiService from '../services/ApiService';

type LiveAuctionRouteProp = RouteProp<RootStackParamList, 'LiveAuction'>;
type LiveAuctionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveAuction'>;

const { width, height } = Dimensions.get('window');
const STORAGE_BASE_URL = 'https://api.caartl.com/storage/';
const TAB_BAR_HEIGHT = 60;

// ==========================================
// 1. CUSTOM ZOOMABLE IMAGE COMPONENT (FIXED)
// ==========================================
const ZoomableImage = ({ uri, onRequestScrollToggle }: { uri: string, onRequestScrollToggle: (locked: boolean) => void }) => {
  const [isZoomed, setIsZoomed] = useState(false); // 🟢 Track zoom state locally
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
      // Clamp scale
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

  // 🟢 Conditional Composition: Only include Pan gesture when zoomed in.
  // This allows the FlatList to handle swipes when the image is fully zoomed out.
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
// 2. MODAL COMPONENTS
// ==========================================

const ImagePreviewModal = ({ visible, images = [], initialIndex = 0, onClose, isWhiteBackground = false }: any) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // State to control FlatList scrolling
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    if (visible && images.length > 0) {
      setCurrentIndex(initialIndex);
      setScrollEnabled(true);
      // Small timeout to ensure FlatList is rendered before scrolling
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
            // 🟢 Ensure FlatList gesture priority
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

const formatEndedDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr.replace(' ', 'T'));
  return `Auction Ended ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

// ==========================================
// MAIN SCREEN
// ==========================================
export default function LiveCarAuctionScreen() {
  const navigation = useNavigation<LiveAuctionScreenNavigationProp>();
  const route = useRoute<LiveAuctionRouteProp>();
  const carId = route.params?.carId;
  const viewType = route.params?.viewType || 'live';

  const { showAlert } = useAlert();
  const { isGuest, isUnapproved } = useAuth();
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showApprovalAlert, setShowApprovalAlert] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fullData, setFullData] = useState<Models.AuctionDetailsResponse['data'] | null>(null);
  const [biddingData, setBiddingData] = useState<Models.BiddingInfoResponse['data'] | null>(null);
  const [negotiationBid, setNegotiationBid] = useState<any | null>(null);

  const [bookingStatus, setBookingStatus] = useState<'none' | 'pending_payment' | 'intransfer' | 'delivered'>('none');
  const [bookingData, setBookingData] = useState<any>(null);
  
  // 🟢 State accessible inside component
  const [damageTypes, setDamageTypes] = useState<any[]>([]);

  const biddingDataRef = useRef<Models.BiddingInfoResponse['data'] | null>(null);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [myBid, setMyBid] = useState<number>(0);
  const [isBidSheetVisible, setIsBidSheetVisible] = useState(false);
  
  // 🟢 Auto Bid States
  const [isAutoBidSheetVisible, setIsAutoBidSheetVisible] = useState(false);
  const [maxBid, setMaxBid] = useState<number>(0);
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewMap, setIsPreviewMap] = useState(false);
  
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeInspectionIndex, setActiveInspectionIndex] = useState(0); 

  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [expandedDamageCategories, setExpandedDamageCategories] = useState<{ [key: string]: boolean }>({});
  const [activeAccordion, setActiveAccordion] = useState<string | null>('Engine');

  const [activeTab, setActiveTab] = useState('Overview');
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionYCoords = useRef<{ [key: string]: number }>({});
  const isManualScroll = useRef(false);
  
  // 🟢 Scroll-based sticky timer state
  const [showStickyTimer, setShowStickyTimer] = useState(false);
  
  // 🟢 Animation for sticky timer bar
  const timerBarHeight = useSharedValue(0);
  const timerBarOpacity = useSharedValue(0);
  
  const timerBarAnimatedStyle = useAnimatedStyle(() => ({
    height: timerBarHeight.value,
    opacity: timerBarOpacity.value,
  }));
  
  // 🟢 Animate timer bar when showStickyTimer changes
  useEffect(() => {
    if (showStickyTimer && viewType === 'live' && bookingStatus === 'none' && !isBidSheetVisible && !isAutoBidSheetVisible) {
      timerBarHeight.value = withTiming(145, { duration: 300 });
      timerBarOpacity.value = withTiming(1, { duration: 300 });
    } else {
      timerBarHeight.value = withTiming(0, { duration: 200 });
      timerBarOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [showStickyTimer, viewType, bookingStatus, isBidSheetVisible, isAutoBidSheetVisible]);

  // 🟢 Moved Inside Component so it can access damageTypes state
  const getDamageBadgeColor = (damageType: string) => {
    const found = damageTypes.find(d => d.name.toLowerCase() === damageType.toLowerCase());
    return found ? found.color : '#ff4444'; 
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const detailsRes = await apiService.getAuctionDetails(carId);
        if (detailsRes.success && detailsRes.data.data) {
          setFullData(detailsRes.data.data);
        }

        if (viewType === 'negotiation') {
          const negRes = await apiService.apiCall<{ data: any[] }>(`/user/biddings?vehicle_id=${carId}&status=accepted`);
          if (negRes.success && negRes.data.data && negRes.data.data.length > 0) {
            setNegotiationBid(negRes.data.data[0]);
          }
        }

        const bookRes = await apiService.getBookingByVehicle(carId);
        if (bookRes.success && bookRes.data.data && bookRes.data.data.data.length > 0) {
          const latestBooking = bookRes.data.data.data[0];
          setBookingData(latestBooking);
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
  }, [carId, viewType]);

  const toggleDamageCategory = (category: string) => {
    setExpandedDamageCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const fetchLiveBidData = useCallback(async () => {
    try {
      const result = await apiService.getBiddingInfo(carId);
      if (result.success && result.data.data) {
        const data = result.data.data;
        setBiddingData(data);
        biddingDataRef.current = data;
        if (!isBidSheetVisible && !isAutoBidSheetVisible) {
          if (data.minimum_next_bid) {
            setMyBid(data.minimum_next_bid);
            setMaxBid(data.minimum_next_bid);
          } else {
            const current = data.highest_bid || 0;
            const increment = Number(data.vehicle.bid_control || 100);
            setMyBid(current + increment);
            setMaxBid(current + increment);
          }
        }
      }
    } catch (error) {
      console.error("Live fetch error:", error);
    }
  }, [carId, isBidSheetVisible, isAutoBidSheetVisible]);

  useEffect(() => {
    if (viewType === 'live') {
      fetchLiveBidData();
      const interval = setInterval(fetchLiveBidData, 3000);
      return () => clearInterval(interval);
    }
  }, [carId, viewType, fetchLiveBidData]);

  useEffect(() => {
    if (viewType === 'negotiation') return;

    const timer = setInterval(() => {
      const vehicleData = biddingDataRef.current?.vehicle || fullData?.vehicle;
      if (!vehicleData) return;

      const now = new Date();
      const targetDateStr = viewType === 'upcoming' ? vehicleData.auction_start_date : vehicleData.auction_end_date;
      const targetDate = new Date(targetDateStr.replace(' ', 'T'));
      const difference = +targetDate - +now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }

      if (viewType === 'live' && biddingDataRef.current?.bids && biddingDataRef.current.bids.length > 0) {
        const lastBidTime = new Date(biddingDataRef.current.bids[0].updated_at);
        const elapsed = +now - +lastBidTime;
        if (elapsed >= 0) {
          const totalSeconds = Math.floor(elapsed / 1000);
          const m = Math.floor(totalSeconds / 60);
          const s = totalSeconds % 60;
          setElapsedTime(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [viewType, fullData, biddingData]);

  const handleLayout = (e: LayoutChangeEvent, section: string) => {
    sectionYCoords.current[section] = e.nativeEvent.layout.y;
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    isManualScroll.current = true;
    requestAnimationFrame(() => {
      const y = sectionYCoords.current[tab];
      if (y !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: y - TAB_BAR_HEIGHT + 10, animated: true });
      }
    });
    setTimeout(() => { isManualScroll.current = false; }, 400);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualScroll.current) return;
    const scrollY = event.nativeEvent.contentOffset.y;
    
    // 🟢 Show sticky timer when scrolled past banner (150px threshold - lowered for better UX)
    setShowStickyTimer(scrollY > 150);
    
    const triggerPoint = scrollY + TAB_BAR_HEIGHT + 150;
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

  const handleIncrement = () => setMyBid(prev => prev + Number(biddingData?.vehicle.bid_control || 100));
  const handleDecrement = () => {
    const minNext = biddingData?.minimum_next_bid || 0;
    if (myBid - Number(biddingData?.vehicle.bid_control || 100) >= minNext) setMyBid(prev => prev - Number(biddingData?.vehicle.bid_control || 100));
  };
  
  // 🟢 Auto Bid Increment/Decrement
  const handleAutoBidIncrement = () => setMaxBid(prev => prev + Number(biddingData?.vehicle.bid_control || 100));
  const handleAutoBidDecrement = () => {
    const minNext = biddingData?.minimum_next_bid || 0;
    if (maxBid - Number(biddingData?.vehicle.bid_control || 100) >= minNext) setMaxBid(prev => prev - Number(biddingData?.vehicle.bid_control || 100));
  };

  const handlePlaceBid = async () => {
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
    if (!biddingData?.vehicle) return;
    setSubmitting(true);
    try {
      const result = await apiService.placeBid(biddingData.vehicle.id, { current_bid: myBid, max_bid: myBid });
      if (result.success) {
        showAlert('Success', 'Bid placed successfully!');
        fetchLiveBidData();
        setIsBidSheetVisible(false);
      } else {
        showAlert('Error', result.data.message || 'Failed to place bid.');
      }
    } catch (error) {
      showAlert('Error', 'Network error while bidding.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 🟢 Handle Auto Bid
  const handleAutoBid = async () => {
    // Guest check
    if (isGuest) {
      setShowLoginAlert(true);
      return;
    }
    // Unapproved user check
    if (isUnapproved) {
      setShowApprovalAlert(true);
      return;
    }
    if (!biddingData?.vehicle) return;
    setSubmitting(true);
    try {
      const result = await apiService.placeBid(biddingData.vehicle.id, { 
        current_bid: biddingData.minimum_next_bid || biddingData.highest_bid || 0, 
        max_bid: maxBid,
        is_auto: true 
      });
      if (result.success) {
        showAlert('Success', 'Auto bid placed successfully!');
        fetchLiveBidData();
        setIsAutoBidSheetVisible(false);
      } else {
        showAlert('Error', result.data.message || 'Failed to place auto bid.');
      }
    } catch (error) {
      showAlert('Error', 'Network error while bidding.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookNow = () => {
    if (fullData?.vehicle) {
      navigation.navigate('BookCar', { vehicle: fullData.vehicle });
    } else {
      showAlert("Error", "Vehicle data not available for booking.");
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

  const getHeaderTitle = () => {
    if (viewType === 'negotiation') return 'Negotiation';
    if (viewType === 'upcoming') return 'Upcoming Auction';
    return 'Live Auction';
  };

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
      if (part.includes('door') || part.includes('fender') || part.includes('panel') || part.includes('pillar')) category = 'Doors & Panels';
      else if (part.includes('glass') || part.includes('shield') || part.includes('mirror') || part.includes('light') || part.includes('lamp')) category = 'Glass & Lights';
      else if (part.includes('bumper') || part.includes('hood') || part.includes('trunk') || part.includes('grille')) category = 'Bumpers & Hood';
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
      const val = inspection[key];
      if (!val) return null;
      usedKeys.add(key);
      let media = null;
      if (inspection.fields) {
        const fieldObj = inspection.fields.find((f: any) => f.name === key);
        if (fieldObj && fieldObj.files && fieldObj.files.length > 0) media = fieldObj.files[0];
      }
      return { label: label || formatKey(key), value: val, media };
    };

    const categories = {
      engine: [getField('engineCondition', 'Engine Condition'), getField('engineOil', 'Engine Oil'), getField('engineNoise', 'Engine Noise'), getField('engineSmoke', 'Engine Smoke'), getField('transmissionCondition', 'Transmission'), getField('gearOil', 'Gear Oil'), getField('gearshifting', 'Gear Shifting'), getField('fourWdSystemCondition', '4WD System'), getField('engine_cc', 'Engine CC'), getField('horsepower', 'Horsepower'), getField('noOfCylinders', 'No. of Cylinders'), getField('transmission', 'Transmission Type')].filter((item): item is { label: string, value: any, media: any } => !!item),
      steering: [getField('steeringOperation', 'Steering Operation'), getField('suspension', 'Suspension'), getField('shockAbsorberOperation', 'Shock Absorbers'), getField('brakePads', 'Brake Pads'), getField('brakeDiscs', 'Brake Discs'), getField('wheelAlignment', 'Wheel Alignment'), { label: 'Inspector Comment', value: inspection.comment_section1 || null, media: null }].filter((item): item is { label: string, value: any, media: any } => !!item && item.value !== null),
      interior: [getField('acCooling', 'AC Cooling'), getField('seatsCondition', 'Seats Condition'), getField('sunroofCondition', 'Sunroof'), getField('windowsControl', 'Windows'), getField('centralLockOperation', 'Central Lock'), getField('cruiseControl', 'Cruise Control'), getField('seatControls', 'Seat Controls'), getField('speedmeterCluster', 'Speedometer'), getField('headLining', 'Head Lining'), getField('obdError', 'OBD Error'), getField('seats', 'Seats Material'), getField('cooledSeats', 'Cooled Seats'), getField('heatedSeats', 'Heated Seats'), getField('powerSeats', 'Power Seats'), getField('premiumSound', 'Premium Sound'), getField('headsDisplay', 'Heads Up Display'), getField('viveCamera', 'Camera'), getField('blindSpot', 'Blind Spot'), getField('soft_door_closing', 'Soft Door Closing'), getField('pushStart', 'Push Start'), getField('keylessStart', 'Keyless Start'), { label: 'Inspector Comment', value: inspection.comment_section2 || null, media: null }].filter((item): item is { label: string, value: any, media: any } => !!item && item.value !== null),
      exterior: [getField('overallCondition', 'Overall Condition'), getField('body_type', 'Body Type'), getField('convertible', 'Convertible'), getField('sideSteps', 'Side Steps'), getField('sunroofType', 'Sunroof Type'), getField('parkingSensors', 'Parking Sensors'), getField('carbonFiber', 'Carbon Fiber')].filter((item): item is { label: string, value: any, media: any } => !!item),
      wheels: [getField('wheelsType', 'Wheels Type'), getField('tiresSize', 'Tires Size'), getField('rimsSizeFront', 'Front Rims'), getField('rimsSizeRear', 'Rear Rims'), getField('spareTire', 'Spare Tire'), getField('frontLeftTire', 'Front Left Tire'), getField('frontRightTire', 'Front Right Tire'), getField('rearLeftTire', 'Rear Left Tire'), getField('rearRightTire', 'Rear Right Tire'), { label: 'Tire Comment', value: inspection.commentTire || null, media: null }].filter((item): item is { label: string, value: any, media: any } => !!item && item.value !== null),
    };
    const ignoredKeys = ['id', 'vehicle_id', 'inspector_id', 'inspection_enquiry_id', 'created_at', 'updated_at', 'file_path', 'damage_file_path', 'shared_link', 'shared_link_expires_at', 'images', 'damages', 'fields', 'brand', 'vehicle_model', 'inspector', 'paintCondition', 'comment_section1', 'comment_section2', 'final_conclusion', 'commentTire', 'remarks', 'make', 'model', 'vehicle', 'pivot'];
    const otherItems = Object.keys(inspection).filter(key => !usedKeys.has(key) && !ignoredKeys.includes(key) && inspection[key] !== null && inspection[key] !== '').map(key => getField(key));
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
              else handleImageOpen([path], 0, false); 
            }}
            style={styles.mediaBtnRight}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome5
              name={item.media.file_type === 'video' ? 'eye' : 'eye'}
              size={16}
              color="#cadb2a"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  let currentPrice = 0;
  let sellerExpectation = 0;
  let leadingUser = "No Bids Yet";

  if (viewType === 'negotiation' && negotiationBid) {
    currentPrice = negotiationBid.bid_amount;
    sellerExpectation = Number(negotiationBid.vehicle.price || 0);
  } else {
    currentPrice = biddingData?.highest_bid ? Number(biddingData.highest_bid) : Number(vehicle.starting_bid_amount);
    sellerExpectation = Number(vehicle.price || 0);
    if (biddingData?.bids && biddingData.bids.length > 0) {
      leadingUser = biddingData.bids[0].user.name;
    }
  }
  const currentBidDisplay = currentPrice.toLocaleString();

  const imageList = vehicle.images?.map((img: any) => img.path) || [];
  if (vehicle.cover_image && typeof vehicle.cover_image !== 'string') {
    if (!imageList.includes(vehicle.cover_image.path)) imageList.unshift(vehicle.cover_image.path);
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
    { label: '0-60 mph', val: vehicle.zero_to_sixty },
    { label: 'Quarter Mile', val: vehicle.quater_mile },
    { label: 'Top Speed', val: vehicle.top_speed },
    { label: 'Drive Type', val: vehicle.drive_type },
    { label: 'Fuel Type', val: vehicle.fuel_type_id === 1 ? 'Petrol' : (vehicle.fuel_type_id === 2 ? 'Diesel' : null) },
    { label: 'Transmission', val: vehicle.transmission_id === 1 ? 'Automatic' : (vehicle.transmission_id === 2 ? 'Manual' : null) },
    { label: 'Body Type', val: vehicle.body_type_id },
    { label: 'Color', val: vehicle.color },
    { label: 'Interior', val: vehicle.interior_color },
    { label: 'Mileage', val: vehicle.mileage ? `${vehicle.mileage} km` : null },
    { label: 'Registration', val: vehicle.register_emirates },
    { label: 'Condition', val: vehicle.condition },
  ].filter(item => item.val !== null && item.val !== undefined && item.val !== '');

  const renderStatusCard = () => {
    if (bookingStatus !== 'none') {
        if (bookingStatus === 'pending_payment') {
          return (
            <View style={styles.statusCard}>
              <View style={styles.offerRow}>
                <View style={styles.offerItem}>
                  <Text style={styles.offerLabel}>Seller Expectation</Text>
                  <Text style={styles.offerValue}>AED {sellerExpectation.toLocaleString()}</Text>
                </View>
                <View style={styles.offerItem}>
                  <Text style={styles.offerLabel}>My Bid (Highest)</Text>
                  <Text style={[styles.offerValue, { color: '#cadb2a' }]}>AED {currentPrice.toLocaleString()}</Text>
                </View>
              </View>
              <Feather name="clock" size={40} color="#ffaa00" style={{ marginBottom: 10 }} />
              <Text style={styles.statusTitle}>Booking Confirmation Pending</Text>
              <Text style={styles.statusSubText}>You have successfully booked this vehicle. Waiting for admin confirmation.</Text>
            </View>
          );
        }
        if (bookingStatus === 'intransfer') {
          return (
            <View style={styles.statusCard}>
              <View style={styles.offerRow}>
                <View style={styles.offerItem}>
                  <Text style={styles.offerLabel}>Seller Expectation</Text>
                  <Text style={styles.offerValue}>AED {sellerExpectation.toLocaleString()}</Text>
                </View>
                <View style={styles.offerItem}>
                  <Text style={styles.offerLabel}>My Bid (Highest)</Text>
                  <Text style={[styles.offerValue, { color: '#cadb2a' }]}>AED {currentPrice.toLocaleString()}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="truck-delivery" size={40} color="#00a8ff" style={{ marginBottom: 10 }} />
              <Text style={styles.statusTitle}>Vehicle In-Transfer</Text>
              <Text style={styles.statusSubText}>Your vehicle is currently being transferred. Tracking info will be updated soon.</Text>
            </View>
          );
        }
        if (bookingStatus === 'delivered') {
          return (
            <View style={styles.statusCard}>
              <View style={styles.offerRow}>
                <View style={styles.offerItem}>
                  <Text style={styles.offerLabel}>Seller Expectation</Text>
                  <Text style={styles.offerValue}>AED {sellerExpectation.toLocaleString()}</Text>
                </View>
                <View style={styles.offerItem}>
                  <Text style={styles.offerLabel}>My Bid</Text>
                  <Text style={[styles.offerValue, { color: '#cadb2a' }]}>AED {currentPrice.toLocaleString()}</Text>
                </View>
              </View>
              <Feather name="check-circle" size={40} color="#cadb2a" style={{ marginBottom: 10 }} />
              <Text style={styles.statusTitle}>Vehicle Delivered</Text>
              <Text style={styles.statusSubText}>Your vehicle has been successfully delivered. Enjoy your ride!</Text>
            </View>
          );
        }
      }
      if (viewType === 'upcoming') {
        return (
          <View style={styles.countdownGrid}>
            <View style={styles.countBox}><Text style={styles.countNum}>{countdown.days}</Text><Text style={styles.countLabel}>Days</Text></View>
            <View style={styles.countBox}><Text style={styles.countNum}>{String(countdown.hours).padStart(2, '0')}</Text><Text style={styles.countLabel}>Hrs</Text></View>
            <View style={styles.countBox}><Text style={styles.countNum}>{String(countdown.minutes).padStart(2, '0')}</Text><Text style={styles.countLabel}>Min</Text></View>
            <View style={styles.countBox}><Text style={styles.countNum}>{String(countdown.seconds).padStart(2, '0')}</Text><Text style={styles.countLabel}>Sec</Text></View>
          </View>
        );
      }
      if (viewType === 'live') {
        return (
          <View style={styles.countdownGrid}>
            <View style={styles.countBox}><Text style={styles.countNum}>{countdown.days}</Text><Text style={styles.countLabel}>Days</Text></View>
            <View style={styles.countBox}><Text style={styles.countNum}>{String(countdown.hours).padStart(2, '0')}</Text><Text style={styles.countLabel}>Hrs</Text></View>
            <View style={styles.countBox}><Text style={styles.countNum}>{String(countdown.minutes).padStart(2, '0')}</Text><Text style={styles.countLabel}>Min</Text></View>
            <View style={styles.countBox}><Text style={styles.countNum}>{String(countdown.seconds).padStart(2, '0')}</Text><Text style={styles.countLabel}>Sec</Text></View>
          </View>
        );
      } else {
        return (
          <View style={styles.offerCard}>
            <Text style={styles.offerTitle}>Your Offer has been Accepted</Text>
            <View style={styles.offerRow}>
              <View style={styles.offerItem}>
                <Text style={styles.offerLabel}>Seller Expectation</Text>
                <Text style={styles.offerValue}>AED {sellerExpectation.toLocaleString()}</Text>
              </View>
              <View style={styles.offerItem}>
                <Text style={styles.offerLabel}>My Bid (Highest)</Text>
                <Text style={[styles.offerValue, { color: '#cadb2a' }]}>AED {currentPrice.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.finalPriceText}>AED {currentPrice.toLocaleString()}</Text>
            <Text style={styles.offerSubText}>You may continue to book your car now</Text>
          </View>
        );
      }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a00', '#26270c']} style={styles.gradient}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          stickyHeaderIndices={[2]}
          showsVerticalScrollIndicator={false}
        >

          {/* Index 0: Top Wrapper */}
          <View>
            <View style={styles.topInfoRow}>
              {viewType === 'upcoming' ? (
                <Text style={styles.leadingText}>Auction Starts In</Text>
              ) : viewType === 'live' && bookingStatus === 'none' ? (
                <>
                  <Text style={styles.leadingText}><Feather name="user" size={14} color="#cadb2a" /> {leadingUser} is Leading</Text>
                  <View style={styles.smallTimerBadge}><Text style={styles.smallTimerText}>{elapsedTime}</Text></View>
                </>
              ) : (
                <Text style={styles.leadingText}>{formatEndedDate(vehicle.auction_end_date)}</Text>
              )}
            </View>

            {/* Banner Slider */}
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
                        <Text style={[styles.bannerPriceLabel, { textAlign: 'right' }]}>Highest / Current</Text>
                        <Text style={styles.bannerPriceValue}>AED {currentPrice.toLocaleString()}</Text>
                      </View>
                      <View style={[styles.bannerDivider, { marginHorizontal: 10, height: 25 }]} />
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.bannerPriceLabel, { textAlign: 'right' }]}>Seller Exp.</Text>
                        <Text style={styles.bannerPriceValue}>AED {sellerExpectation.toLocaleString()}</Text>
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
          </View>

          {/* Index 1: Dynamic Status Card */}
          {renderStatusCard()}

          {/* Index 2: Sticky Tabs */}
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

          {/* Index 3+: Sections */}
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
              <InspectionAccordion title="Steering, Suspension & Brakes" isOpen={activeAccordion === 'Steering'} onPress={() => setActiveAccordion(activeAccordion === 'Steering' ? null : 'Steering')}>
                {categorizedData.steering.length > 0 ? categorizedData.steering.map(renderInspectionRow) : <Text style={{ color: '#666' }}>No data.</Text>}
              </InspectionAccordion>
              <InspectionAccordion title="Interior, Electricals & A/C" isOpen={activeAccordion === 'Interior'} onPress={() => setActiveAccordion(activeAccordion === 'Interior' ? null : 'Interior')}>
                {categorizedData.interior.length > 0 ? categorizedData.interior.map(renderInspectionRow) : <Text style={{ color: '#666' }}>No data.</Text>}
              </InspectionAccordion>
              <InspectionAccordion title="Exterior & Body" isOpen={activeAccordion === 'Exterior'} onPress={() => setActiveAccordion(activeAccordion === 'Exterior' ? null : 'Exterior')}>
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

              {/* Inspection Slider */}
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
                            <Image
                              source={{ uri }}
                              style={{ width: width, height: 250, resizeMode: 'cover' }}
                            />
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

        {/* 🟢 Sticky Bid Section (shows on scroll for live auctions - above the footer) */}
        <Animated.View style={[styles.stickyTimerBarWrapper, timerBarAnimatedStyle]}>
          <View style={styles.stickyBidSection}>
            {/* Seller Expectation & Current Bid Row */}
            <View style={styles.stickyPriceRow}>
              <View style={styles.stickyPriceBox}>
                <Text style={styles.stickyPriceLabel}>Seller Expectation</Text>
                <Text style={styles.stickyPriceValue}>AED {sellerExpectation.toLocaleString()}</Text>
              </View>
              <View style={[styles.stickyPriceBox, styles.stickyPriceBoxHighlight]}>
                <Text style={styles.stickyPriceLabel}>Current Bid</Text>
                <Text style={[styles.stickyPriceValue, { color: '#cadb2a' }]}>AED {currentPrice.toLocaleString()}</Text>
              </View>
            </View>
            
            {/* Timer Row */}
            <View style={styles.stickyTimerRow}>
              <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{String(countdown.days).padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Days</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{String(countdown.hours).padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Hours</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{String(countdown.minutes).padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Mins</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{String(countdown.seconds).padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Secs</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        {bookingStatus !== 'none' ? (
          <View style={styles.negotiationFooter}>
            <View style={styles.footerBtnRow}>
              <TouchableOpacity style={styles.footerBtnOutline} onPress={() => navigation.navigate('BiddingDetail', { vehicleId: carId })}>
                <Text style={styles.footerBtnTextOutline}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerBtnFilled} onPress={handleViewBooking}>
                <Text style={styles.footerBtnTextFilled}>View Booking</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.footerDateText}>{formatEndedDate(vehicle.auction_end_date)}</Text>
          </View>
        ) : viewType === 'live' ? (
          !isBidSheetVisible && !isAutoBidSheetVisible ? (
            <View style={styles.bidNowContainer}>
              <View style={styles.bidFooterButtonRow}>
                <TouchableOpacity style={styles.autoBidBtn} onPress={() => setIsAutoBidSheetVisible(true)}>
                  <Text style={styles.autoBidText}>Auto Bid</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.placeBidBtn} onPress={() => setIsBidSheetVisible(true)}>
                  <MaterialCommunityIcons name="gavel" size={18} color="#000" style={{ marginRight: 6 }} />
                  <Text style={styles.placeBidText}>Place Bid</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : isBidSheetVisible ? (
            <View style={styles.bottomSheet}>
              <TouchableOpacity style={styles.bottomArrowContainer} onPress={() => setIsBidSheetVisible(false)} >
                <Feather name="arrow-down" size={24} color="#cadb2a" />
              </TouchableOpacity>
              <Text style={styles.winningOfferTitle}>Place Your Winning Bid</Text>
              <View style={styles.bidControlRow}>
                <TouchableOpacity style={styles.circleBtnRed} onPress={handleDecrement}><Feather name="minus" size={24} color="#fff" /></TouchableOpacity>
                <View><Text style={styles.bidAmountText}>{myBid.toLocaleString()}</Text><Text style={styles.currencyText}>AED</Text></View>
                <TouchableOpacity style={styles.circleBtnGreen} onPress={handleIncrement}><Feather name="plus" size={24} color="#fff" /></TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.sheetPlaceBidBtn} onPress={handlePlaceBid} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#000" /> : <><Text style={styles.sheetPlaceBidBtnText}>Place Bid</Text><MaterialCommunityIcons name="gavel" size={20} color="#000" style={{ marginLeft: 8 }} /></>}
              </TouchableOpacity>
              <Text style={styles.minIncText}>Min increment: AED {vehicle.bid_control || 100}</Text>
            </View>
          ) : isAutoBidSheetVisible ? (
            <View style={styles.bottomSheet}>
              <TouchableOpacity style={styles.bottomArrowContainer} onPress={() => setIsAutoBidSheetVisible(false)} >
                <Feather name="arrow-down" size={24} color="#cadb2a" />
              </TouchableOpacity>
              <Text style={styles.winningOfferTitle}>Set Your Maximum Bid</Text>
              <View style={styles.bidControlRow}>
                <TouchableOpacity style={styles.circleBtnRed} onPress={handleAutoBidDecrement}><Feather name="minus" size={24} color="#fff" /></TouchableOpacity>
                <View><Text style={styles.bidAmountText}>{maxBid.toLocaleString()}</Text><Text style={styles.currencyText}>AED</Text></View>
                <TouchableOpacity style={styles.circleBtnGreen} onPress={handleAutoBidIncrement}><Feather name="plus" size={24} color="#fff" /></TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.sheetPlaceBidBtn} onPress={handleAutoBid} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#000" /> : <><Text style={styles.sheetPlaceBidBtnText}>Set Auto Bid</Text><MaterialCommunityIcons name="auto-fix" size={20} color="#000" style={{ marginLeft: 8 }} /></>}
              </TouchableOpacity>
              <Text style={styles.minIncText}>System will auto-bid up to your max amount</Text>
            </View>
          ) : null
        ) : viewType === 'upcoming' ? (
          <View style={styles.negotiationFooter}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="bell" size={20} color="#cadb2a" style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontFamily: 'Poppins', fontSize: 13 }}>
                Auction starts on {new Date(vehicle.auction_start_date).toDateString()}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.negotiationFooter}>
            <View style={styles.footerBtnRow}>
              <TouchableOpacity style={styles.footerBtnOutline} onPress={() => navigation.navigate('BiddingDetail', { vehicleId: carId })}>
                <Text style={styles.footerBtnTextOutline}>View Detail</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerBtnFilled} onPress={handleBookNow}>
                <Text style={styles.footerBtnTextFilled}>Book Now</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.adminFeeText}>*Admin fee <Text style={styles.adminFeeBold}>AED 1,499</Text> will be charged</Text>
            <View style={styles.lateInfoRow}>
              <Feather name="info" size={12} color="#ff6b6b" style={{ marginRight: 4 }} />
              <Text style={styles.lateInfoText}>Late Payment & Storage Charges may apply</Text>
            </View>
            <Text style={styles.footerDateText}>{formatEndedDate(vehicle.auction_end_date)}</Text>
          </View>
        )}

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

        {/* 🟢 ADD: Login Alert for guests */}
        <CustomAlert
          visible={showLoginAlert}
          title="Please Login"
          message="Create an account or login to Caartl to place bids."
          onClose={() => setShowLoginAlert(false)}
        />

        {/* 🟢 ADD: Approval Alert for unapproved users */}
        <CustomAlert
          visible={showApprovalAlert}
          title="Account Pending Approval"
          message="Your account is pending approval. Please complete your payment to activate your account and place bids."
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
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  headerBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'Poppins' },

  topInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  leadingText: { color: '#ccc', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500' },
  smallTimerBadge: { backgroundColor: '#cadb2a', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  smallTimerText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, paddingTop: 60, justifyContent: 'flex-end' },
  bannerContent: { flexDirection: 'column', gap: 4, marginBottom: 12 },
  carBrand: { color: '#cadb2a', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
  carModel: { color: '#fff', fontSize: 22, fontWeight: 'bold', fontFamily: 'Poppins' },
  bannerPriceLabel: { color: '#aaa', fontSize: 10, fontFamily: 'Poppins', marginBottom: 2 },
  bannerPriceValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'Lato' },
  bannerDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 15 },

  countdownGrid: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 25 },
  countBox: { width: 65, height: 65, backgroundColor: '#111', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  countNum: { color: '#fff', fontSize: 20, fontWeight: 'bold', fontFamily: 'Lato' },
  countLabel: { color: '#888', fontSize: 11, fontFamily: 'Poppins' },

  stickyTabContainer: { backgroundColor: '#111', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222', zIndex: 100 },
  tabContent: { paddingHorizontal: 16 },
  tabItem: { paddingVertical: 8, paddingHorizontal: 16, marginRight: 10, borderRadius: 20, backgroundColor: '#000' },
  activeTabItem: { backgroundColor: '#cadb2a', borderWidth: 2, borderColor: '#000' },
  tabText: { color: '#fff', fontSize: 13, fontFamily: 'Poppins' },
  activeTabText: { color: '#111', fontWeight: 'bold' },

  sectionContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },
  sectionTitle: { color: '#cadb2a', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins', marginBottom: 10 },
  subSectionTitle: { color: '#aaa', fontSize: 13, fontWeight: '600', fontFamily: 'Poppins', marginBottom: 8, marginTop: 5 },
  specCardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specCard: { width: '48%', backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 0, borderWidth: 1, borderColor: '#222' },
  specTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
  specSub: { color: '#888', fontSize: 12, marginTop: 4, fontFamily: 'Poppins' },

  detailsListContainer: { backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#222' },
  detailListRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#222', alignItems: 'center' },
  detailListLabel: { color: '#888', fontFamily: 'Poppins', fontSize: 14 },
  detailListValue: { color: '#fff', fontFamily: 'Poppins', fontWeight: '600', fontSize: 14, textAlign: 'right', flex: 1, marginLeft: 20 },

  featureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeIcon: { backgroundColor: '#cadb2a', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#cadb2a', marginRight: 15 },
  featureText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins', flex: 1 },
  showMoreBtn: { alignItems: 'center', marginTop: 15 },
  showMoreText: { color: '#888', fontSize: 14, fontFamily: 'Poppins' },
  damageMapContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 15 },
  damageMapImage: { width: '100%', height: 200 },
  infoBlock: { marginBottom: 15, marginTop: 15 },

  tag: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, marginRight: 5, marginBottom: 5 },
  tagText: { fontSize: 12, fontFamily: 'Poppins' },

  inspectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 8 },
  inspLabel: { color: '#888', fontSize: 12, fontFamily: 'Poppins', flex: 1, marginRight: 10 },
  inspValueContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  inspValue: { color: '#cadb2a', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins', textAlign: 'right' },
  mediaBtnRight: { marginLeft: 12, padding: 4 },

  damagesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  damageGridItem: { width: '48%', backgroundColor: '#181818', borderRadius: 8, padding: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  damageBadge: { borderRadius: 4, paddingVertical: 3, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', marginBottom: 6, width: '100%', justifyContent: 'center' },
  damageText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4, textAlign: 'center' },
  damageBodyPart: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 2 },
  damageSubText: { color: '#ccc', fontSize: 10, textAlign: 'center', marginTop: 2 },

  descriptionText: { color: '#ccc', fontSize: 14, fontFamily: 'Poppins', lineHeight: 20 },
  commentBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  bidNowContainer: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 12, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#222' },
  bidFooterButtonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  autoBidBtn: { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#cadb2a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  autoBidText: { color: '#cadb2a', fontSize: 15, fontWeight: 'bold', fontFamily: 'Poppins' },
  placeBidBtn: { flex: 1, backgroundColor: '#cadb2a', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  placeBidText: { color: '#000', fontSize: 15, fontWeight: 'bold', fontFamily: 'Poppins' },
  totalPriceLabel: { fontSize: 12, color: '#aaa', fontFamily: 'Poppins' },
  totalPriceValue: { fontSize: 20, color: '#fff', fontWeight: 'bold', fontFamily: 'Lato' },
  bidNowButton: { backgroundColor: '#CADB2A', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 },
  bidNowButtonText: { fontWeight: '700', fontSize: 16, color: '#000' },
  bottomSheet: { backgroundColor: '#111', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, borderWidth: 1, borderColor: '#cadb2a', position: 'absolute', bottom: 0, width: '100%' },
  bottomArrowContainer: { alignItems: 'center', marginTop: -40, marginBottom: 15, alignSelf: 'center', backgroundColor: '#000', padding: 8, borderRadius: 50, borderWidth: 1, borderColor: '#cadb2a' },
  winningOfferTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  bidControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  circleBtnRed: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#ff4444', justifyContent: 'center', alignItems: 'center' },
  circleBtnGreen: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#cadb2a', justifyContent: 'center', alignItems: 'center' },
  bidAmountText: { color: '#fff', fontSize: 32, fontWeight: 'bold', fontFamily: 'Lato', textAlign: 'center' },
  currencyText: { fontSize: 12, color: '#888', textAlign: 'center' },
  sheetPlaceBidBtn: { backgroundColor: '#cadb2a', height: 55, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  sheetPlaceBidBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  minIncText: { color: '#666', fontSize: 11, textAlign: 'center', marginTop: 15 },
  
  previewContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  previewContainerWhite: { backgroundColor: '#fff' },
  videoModalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  videoCloseBtn: { position: 'absolute', top: 50, right: 30, zIndex: 20, padding: 10 },
  fullscreenVideo: { width: width, height: height * 0.8 },
  
  previewPagination: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 40, width: '100%' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 10, width: '100%' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#cadb2a', width: 20 },
  
  previewCloseBtn: { position: 'absolute', top: 50, right: 30, zIndex: 20, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  footerDateText: { color: '#666', fontSize: 12, marginTop: 10, fontFamily: 'Poppins', fontStyle: 'italic' },
  
  offerCard: { marginHorizontal: 16, marginBottom: 20, padding: 16, backgroundColor: '#111', borderRadius: 12, borderWidth: 1, borderColor: '#cadb2a' },
  offerTitle: { color: '#cadb2a', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, fontFamily: 'Poppins' },
  offerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  offerItem: { width: '48%', backgroundColor: '#000', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  offerLabel: { color: '#888', fontSize: 10, marginBottom: 4, fontFamily: 'Poppins' },
  
  // 🟢 Sticky Bid Section Styles (shows above footer on scroll)
  stickyTimerBarWrapper: {
    overflow: 'hidden',
  },
  stickyBidSection: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#cadb2a',
  },
  stickyPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  stickyPriceBox: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  stickyPriceBoxHighlight: {
    borderColor: '#cadb2a',
  },
  stickyPriceLabel: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  stickyPriceValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Lato',
  },
  stickyTimerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerBox: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 55,
    borderWidth: 1,
    borderColor: '#333',
  },
  timerNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Lato',
  },
  timerLabel: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'Poppins',
    marginTop: 2,
  },
  timerColon: {
    color: '#cadb2a',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  offerValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  finalPriceText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, fontFamily: 'Lato' },
  offerSubText: { color: '#888', fontSize: 12, textAlign: 'center', fontFamily: 'Poppins' },
  
  negotiationFooter: { flexDirection: 'column', alignItems: 'center', padding: 16, paddingBottom: 12, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#222' },
  footerBtnRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  footerBtnOutline: { flex: 1, borderWidth: 1, borderColor: '#fff', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginRight: 10 },
  footerBtnTextOutline: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
  footerBtnFilled: { flex: 1, backgroundColor: '#ff4444', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  footerBtnTextFilled: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
  adminFeeText: { color: '#888', fontSize: 10, marginTop: 12, fontFamily: 'Poppins' },
  adminFeeBold: { color: '#fff', fontWeight: 'bold' },
  lateInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  lateInfoText: { color: '#ff6b6b', fontSize: 10, textDecorationLine: 'underline', fontFamily: 'Poppins' },
  accordionContainer: { marginBottom: 10, borderWidth: 1, borderColor: '#222', borderRadius: 8, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#111' },
  accordionTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
  accordionContent: { padding: 15, backgroundColor: '#000' },
  statusCard: { backgroundColor: '#111', marginHorizontal: 16, marginBottom: 20, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statusTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Poppins', marginBottom: 8, textAlign: 'center' },
  statusSubText: { color: '#aaa', fontSize: 13, fontFamily: 'Poppins', textAlign: 'center', lineHeight: 20 },
});