import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ArrowDown } from 'lucide-react-native';
import BidModal from './PlaceBidModel';

const CountdownTimer = ({ timeLeft }) => {
  const [time, setTime] = useState(timeLeft);
  const [bidAmount, setBidAmount] = useState(71000);
const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(1000))[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (v) => v.toString().padStart(2, '0');

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const adjustBid = (inc) => setBidAmount((prev) => Math.max(1000, prev + inc));

  return (
    <>
      {/* Timer Row */}
      <View style={styles.container}>
        <View style={styles.singleRow}>
          <View style={styles.timerRow}>
            {['Days', 'Hr', 'Min', 'Sec'].map((label, i) => {
              const val = [time.days, time.hours, time.minutes, time.seconds][i];
              return (
                <View key={label} style={styles.timeBox}>
                  <Text style={styles.timeValue}>
                    {i === 0 ? val : formatTime(val)}
                  </Text>
                  <Text style={styles.timeLabel}>{label}</Text>
                </View>
              );
            })}
          </View>
         <TouchableOpacity style={styles.bidButton} onPress={() => setModalVisible(true)}>
  <Text style={styles.bidButtonText}>Bid Now</Text>
</TouchableOpacity>
        </View>
        <BidModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      </View>

     
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  singleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  timerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeBox: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.46)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  timeLabel: {
    fontSize: 9,
    color: '#FFF',
    marginTop: 2,
  },
  bidButton: {
    backgroundColor: '#CADB2A',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 24,
    height: 40,
    justifyContent: 'center',
  },
  bidButtonText: {
    fontFamily: 'Barlow',
    fontWeight: '700',
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  safeAreaContainer: {
    width: '100%',
  },

  // Bottom Sheet - 33dp radius, 2dp border, #0F1003 bg
  bottomSheet: {
    backgroundColor: '#0F1003',
    borderTopLeftRadius: 33,
    borderTopRightRadius: 33,
    borderTopWidth: 2,
    borderTopColor: '#CADB2A',
    paddingHorizontal: 24,
    paddingTop: 36, // Space for 49dp button (24.5 outside)
    paddingBottom: 20,
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
    // Shadow (elevation: 4dp)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  // Close Button Wrapper - Half Outside
  closeButtonWrapper: {
    position: 'absolute',
    top: -24.5, // 49 / 2 = 24.5 → half outside
    alignSelf: 'center',
    zIndex: 10,
  },

  // Close Button - 49×49 dp, rounded, lime border, shadow
  closeButton: {
    width: 49,
    height: 49,
    borderRadius: 24.5,
    backgroundColor: '#0F1003',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CADB2A',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 56,
    marginBottom: 32,
  },

  bidAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusButton: {
    backgroundColor: '#FF3B30',
  },
  plusButton: {
    backgroundColor: '#34C759',
  },
  bidAmountText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },

  placeBidButton: {
    backgroundColor: '#CADB2A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginTop: 8,
  },
  placeBidText: {
    fontFamily: 'Barlow',
    fontWeight: '700',
    fontSize: 18,
    color: '#000',
  },
});

export default CountdownTimer;