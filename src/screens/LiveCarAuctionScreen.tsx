import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import apiService from '../services/ApiService';
import * as Models from '../data/modal';
import { useAlert } from '../context/AlertContext';

type LiveAuctionRouteProp = RouteProp<RootStackParamList, 'LiveAuction'>;
type LiveAuctionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveAuction'>;

const { width } = Dimensions.get('window');

// Helper for the feature grid items
const FeatureGridItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <View style={styles.featureGridItem}>
    <View style={styles.featureIconContainer}>
      {icon}
    </View>
    <Text style={styles.featureLabel}>{label}</Text>
    <Text style={styles.featureValue}>{value}</Text>
  </View>
);

// Image Preview Modal
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

export default function LiveCarAuctionScreen() {
  const navigation = useNavigation<LiveAuctionScreenNavigationProp>();
  const route = useRoute<LiveAuctionRouteProp>();
  const carId = route.params?.carId || 53;

  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1. Static Data
  const [staticData, setStaticData] = useState<Models.AuctionDetailsResponse['data'] | null>(null);
  // 2. Live Data
  const [biddingData, setBiddingData] = useState<Models.BiddingInfoResponse['data'] | null>(null);
  const biddingDataRef = useRef<Models.BiddingInfoResponse['data'] | null>(null);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [myBid, setMyBid] = useState<number>(0);
  const [isBidSheetVisible, setIsBidSheetVisible] = useState(false);

  // Image Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchStaticDetails = async () => {
      try {
        const result = await apiService.getAuctionDetails(carId);
        if (result.success && result.data.data) {
          setStaticData(result.data.data);
        } else {
          showAlert('Error', 'Failed to load vehicle details.');
          navigation.goBack();
        }
      } catch (error) {
        console.error("Static fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaticDetails();
  }, [carId]);

  const fetchLiveBidData = async () => {
    try {
      const result = await apiService.getBiddingInfo(carId);
      if (result.success && result.data.data) {
        const data = result.data.data;
        setBiddingData(data);
        biddingDataRef.current = data;

        if (!isBidSheetVisible) {
          if (data.minimum_next_bid) {
            setMyBid(data.minimum_next_bid);
          } else {
            const current = data.highest_bid || 0;
            const increment = Number(data.vehicle.bid_control || 100);
            setMyBid(current + increment);
          }
        }
      }
    } catch (error) {
      console.error("Live fetch error:", error);
    }
  };

  useEffect(() => {
    fetchLiveBidData();
    const interval = setInterval(fetchLiveBidData, 3000);
    return () => clearInterval(interval);
  }, [carId]);

  // --- Timers Logic ---
  useEffect(() => {
    const timer = setInterval(() => {
      const data = biddingDataRef.current;
      if (!data?.vehicle) return;

      const now = new Date();
      const endDate = new Date(data.vehicle.auction_end_date.replace(' ', 'T'));
      const difference = +endDate - +now;

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

      if (data.bids && data.bids.length > 0) {
        const lastBidTime = new Date(data.bids[0].updated_at);
        const elapsed = +now - +lastBidTime;
        if (elapsed >= 0) {
          const totalSeconds = Math.floor(elapsed / 1000);
          const m = Math.floor(totalSeconds / 60);
          const s = totalSeconds % 60;
          const h = Math.floor(totalSeconds / 3600);
          const mDisplay = m % 60;

          if (h > 0) setElapsedTime(`${String(h).padStart(2, '0')}:${String(mDisplay).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
          else setElapsedTime(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        } else {
          setElapsedTime("00:00");
        }
      } else {
        setElapsedTime("00:00");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleIncrement = () => {
    const increment = Number(biddingData?.vehicle.bid_control || 100);
    setMyBid(prev => prev + increment);
  };

  const handleDecrement = () => {
    const increment = Number(biddingData?.vehicle.bid_control || 100);
    const minNext = biddingData?.minimum_next_bid || 0;
    if (myBid - increment >= minNext) {
      setMyBid(prev => prev - increment);
    }
  };

  const handlePlaceBid = async () => {
    if (!biddingData?.vehicle) return;
    setSubmitting(true);
    try {
      const result = await apiService.placeBid(biddingData.vehicle.id, {
        current_bid: myBid,
        max_bid: myBid
      });
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

  const navigateToDetails = () => {
    navigation.navigate('CarDetailPage', { carId: carId });
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#cadb2a" /></View>;
  }

  if (!staticData?.vehicle) return null;

  const vehicleVisuals = staticData.vehicle;
  const vehicleLive = biddingData?.vehicle || staticData.vehicle;

  // ==========================================================
  // FIX: UPDATED IMAGE LOGIC
  // ==========================================================

  const rawImages = vehicleVisuals.images && Array.isArray(vehicleVisuals.images)
    ? vehicleVisuals.images
    : [];

  // 1. Determine Main Image
  let mainImage = '';

  // Priority A: Find the specific image object where is_cover == 1 inside the array
  const coverImageObject = rawImages.find((img: any) => img.is_cover === 1 || img.is_cover === true);

  if (coverImageObject) {
    mainImage = coverImageObject.path;
  }
  // Priority B: Check the direct 'cover_image' property (fallback)
  else if (vehicleVisuals.cover_image) {
    mainImage = typeof vehicleVisuals.cover_image === 'string'
      ? vehicleVisuals.cover_image
      : vehicleVisuals.cover_image.path;
  }
  // Priority C: Use the first image in the array
  else if (rawImages.length > 0) {
    mainImage = rawImages[0].path;
  }
  // Priority D: Placeholder
  else {
    mainImage = vehicleVisuals.brand?.image_source || 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png';
  }

  // 2. Prepare Thumbnails (Just show the first 3 from the list)
  const imageList: string[] = rawImages.map((img: any) => img.path);
  // Ensure we have something in the list for the thumbnails if rawImages was empty but mainImage exists
  if (imageList.length === 0 && mainImage) {
    imageList.push(mainImage);
  }

  const thumbImages = imageList.length > 1 ? imageList.slice(0, 3) : imageList;

  // ==========================================================

  // Live Values
  const highestBid = biddingData?.highest_bid;
  const currentBidDisplay = highestBid ? Number(highestBid).toLocaleString() : Number(vehicleLive.starting_bid_amount).toLocaleString();
  const expectedPrice = Number(vehicleLive.price).toLocaleString();

  const totalBids = biddingData?.total_bids || vehicleVisuals.bids_count || 0;
  const bidsArray = biddingData?.bids || [];
  const leadingUser = (bidsArray.length > 0) ? bidsArray[0].user.name : "No Bids Yet";

  // Map Features
  const transmission = vehicleVisuals.transmission_id === 1 ? 'Auto' : 'Manual';
  const fuel = vehicleVisuals.fuel_type_id === 1 ? 'Petrol' : 'Diesel';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a00', '#26270c']} style={styles.gradient}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Car Auction</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          <View style={styles.topInfoRow}>
            <Text style={styles.leadingText}>{leadingUser} is Leading</Text>
            <View style={styles.smallTimerBadge}>
              <Text style={styles.smallTimerText}>{elapsedTime}</Text>
            </View>
          </View>

          {/* Main Car Image Card */}
          <View style={styles.imageCard}>
            {/* FIX: Added style to TouchableOpacity so it fills the parent View */}
            <TouchableOpacity
              onPress={() => setPreviewImage(mainImage)}
              activeOpacity={0.9}
              style={{ width: '100%', height: '100%' }}
            >
              <Image
                source={{ uri: mainImage }}
                style={styles.carImage}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']} style={styles.imageOverlay} pointerEvents="none">
              <View style={styles.favoriteIcon}>
                <MaterialCommunityIcons name="heart" size={20} color="#fff" />
              </View>

              <View style={styles.overlayHeader}>
                <Text style={styles.carBrand}>{vehicleVisuals.brand?.name}</Text>
                <Text style={styles.carModel}>{vehicleVisuals.vehicle_model?.name}</Text>
              </View>

              <View style={styles.cardStatsRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.cardLabel}>Current Bid</Text>
                  <Text style={styles.cardValue}>AED {currentBidDisplay}</Text>
                </View>
                <View style={styles.verticalLine} />
                <View style={styles.priceBox}>
                  <Text style={styles.cardLabel}>Seller Expectation</Text>
                  <Text style={styles.cardValue}>AED {expectedPrice}</Text>
                </View>
              </View>

              <View style={styles.tagsRow}>
                <View style={styles.tag}><Text style={styles.tagText}>{totalBids} Bids</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>{vehicleVisuals.year}</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>{vehicleVisuals.condition}</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>{vehicleVisuals.mileage} Km</Text></View>
              </View>
            </LinearGradient>
          </View>

          {/* Thumbnails */}
          {thumbImages.length > 0 && (
            <View style={styles.thumbnailRow}>
              {thumbImages.map((imgUri, index) => (
                <TouchableOpacity key={index} onPress={() => setPreviewImage(imgUri)}>
                  <Image source={{ uri: imgUri }} style={styles.thumbnail} />
                </TouchableOpacity>
              ))}
              {/* Fill remaining space if less than 3 images */}
              {[...Array(Math.max(0, 3 - thumbImages.length))].map((_, i) => (
                <View key={`empty-${i}`} style={[styles.thumbnail, { borderWidth: 0, backgroundColor: 'transparent' }]} />
              ))}
            </View>
          )}

          <View style={styles.countdownGrid}>
            <View style={styles.countBox}><Text style={styles.countNum}>{countdown.days}</Text><Text style={styles.countLabel}>Days</Text></View>
            <View style={styles.countBox}><Text style={styles.countNum}>{String(countdown.hours).padStart(2, '0')}</Text><Text style={styles.countLabel}>Hour</Text></View>
            <View style={styles.countBox}><Text style={styles.countNum}>{String(countdown.minutes).padStart(2, '0')}</Text><Text style={styles.countLabel}>Min</Text></View>
            <View style={styles.countBox}><Text style={styles.countNum}>{String(countdown.seconds).padStart(2, '0')}</Text><Text style={styles.countLabel}>Sec</Text></View>
          </View>

          <TouchableOpacity style={styles.allFeaturesRow} onPress={navigateToDetails}>
            <Text style={styles.allFeaturesText}>All Features</Text>
            <Feather name="arrow-right" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.featuresGrid}>
            <FeatureGridItem
              icon={<MaterialCommunityIcons name="car-shift-pattern" size={24} color="#cadb2a" />}
              label="Transmission"
              value={transmission}
            />
            <FeatureGridItem
              icon={<MaterialCommunityIcons name="car-door" size={24} color="#cadb2a" />}
              label="Door & Seats"
              value={`${vehicleVisuals.doors || 4} Doors, ${vehicleVisuals.seats || 5} Seats`}
            />
            <FeatureGridItem
              icon={<MaterialCommunityIcons name="fan" size={24} color="#cadb2a" />}
              label="Air Condition"
              value="Climate Control"
            />
            <FeatureGridItem
              icon={<MaterialCommunityIcons name="gas-station" size={24} color="#cadb2a" />}
              label="Fuel Type"
              value={fuel}
            />
          </View>

          <View style={styles.spacer} />

          {!isBidSheetVisible ? (
            <View style={styles.bidNowContainer}>
              <View>
                <Text style={styles.totalPriceLabel}>Current Bid</Text>
                <Text style={styles.totalPriceValue}>{currentBidDisplay} AED</Text>
              </View>
              <TouchableOpacity style={styles.bidNowButton} onPress={() => setIsBidSheetVisible(true)}>
                <Text style={styles.bidNowButtonText}>Bid Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bottomSheet}>
              <TouchableOpacity style={styles.bottomArrowContainer} onPress={() => setIsBidSheetVisible(false)} >
                <Feather name="arrow-down" size={24} color="#cadb2a" />
              </TouchableOpacity>
              <Text style={styles.winningOfferTitle}>Put Forward Your Winning Offer</Text>
              <View style={styles.bidControlRow}>
                <TouchableOpacity style={styles.circleBtnRed} onPress={handleDecrement}>
                  <Feather name="minus" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.bidAmountText}>{myBid.toLocaleString()}<Text style={styles.currencyText}>AED</Text></Text>
                <TouchableOpacity style={styles.circleBtnGreen} onPress={handleIncrement}>
                  <Feather name="plus" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.placeBidBtn} onPress={handlePlaceBid} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#000" /> : (
                  <>
                    <Text style={styles.placeBidBtnText}>Place Bid</Text>
                    <MaterialCommunityIcons name="gavel" size={20} color="#000" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.minIncText}>Minimum increment: AED {vehicleLive.bid_control}</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        <ImagePreviewModal
          visible={!!previewImage}
          imageUrl={previewImage || ''}
          onClose={() => setPreviewImage(null)}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 10 },
  headerBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'Poppins' },
  topInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  leadingText: { color: '#ccc', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500' },
  smallTimerBadge: { backgroundColor: '#cadb2a', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  smallTimerText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  imageCard: { marginHorizontal: 16, height: 300, borderRadius: 16, overflow: 'hidden', marginBottom: 10, backgroundColor: '#000', borderColor: '#222', borderWidth: 1 },
  carImage: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, padding: 15, justifyContent: 'flex-end' },
  favoriteIcon: { position: 'absolute', top: 15, right: 15 },
  overlayHeader: { marginBottom: 10 },
  carBrand: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Poppins', marginBottom: 2 },
  carModel: { color: '#fff', fontSize: 24, fontWeight: 'bold', fontFamily: 'Poppins' },
  cardStatsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  priceBox: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  cardLabel: { color: '#aaa', fontSize: 10, fontFamily: 'Poppins' },
  cardValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins' },
  verticalLine: { width: 1, height: 25, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 10 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  tagText: { color: '#fff', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' },
  thumbnailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 20 },
  thumbnail: { width: (width - 52) / 3, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#cadb2a' },
  countdownGrid: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  countBox: { width: 65, height: 65, backgroundColor: '#111', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  countNum: { color: '#fff', fontSize: 22, fontWeight: 'bold', fontFamily: 'Lato' },
  countLabel: { color: '#888', fontSize: 12, fontFamily: 'Poppins' },
  allFeaturesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  allFeaturesText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Poppins' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, justifyContent: 'space-between' },
  featureGridItem: { width: '48%', backgroundColor: '#0f0f0f', padding: 15, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  featureIconContainer: { width: 40, height: 40, marginBottom: 10 },
  featureLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 4, fontFamily: 'Poppins' },
  featureValue: { color: '#888', fontSize: 12, fontFamily: 'Poppins' },
  spacer: { height: 20 },
  bidNowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 30 },
  totalPriceLabel: { fontSize: 13, color: '#FFFFFF', opacity: 0.8, marginBottom: 4, fontFamily: 'Poppins' },
  totalPriceValue: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'Lato' },
  bidNowButton: { backgroundColor: '#CADB2A', borderRadius: 14, paddingVertical: 15, paddingHorizontal: 35, justifyContent: 'center', elevation: 5 },
  bidNowButtonText: { fontWeight: '700', fontSize: 18, color: '#000000', fontFamily: 'Poppins' },
  bottomSheet: { backgroundColor: '#000', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, borderWidth: 1, borderColor: '#cadb2a', marginHorizontal: 0 },
  bottomArrowContainer: { alignItems: 'center', marginTop: -35, marginBottom: 10, backgroundColor: '#000', alignSelf: 'center', padding: 5, borderRadius: 20, borderWidth: 1, borderColor: '#cadb2a' },
  winningOfferTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, fontFamily: 'Poppins' },
  bidControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  circleBtnRed: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#ff4444', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  circleBtnGreen: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#cadb2a', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  bidAmountText: { color: '#fff', fontSize: 36, fontWeight: 'bold', fontFamily: 'Lato' },
  currencyText: { fontSize: 16, color: '#888', marginLeft: 5 },
  placeBidBtn: { backgroundColor: '#cadb2a', height: 60, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#cadb2a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  placeBidBtnText: { color: '#000', fontSize: 20, fontWeight: 'bold', fontFamily: 'Poppins' },
  minIncText: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 15, fontFamily: 'Poppins' },
  previewContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '80%' },
  previewCloseBtn: { position: 'absolute', top: 50, right: 30, zIndex: 20 },
});