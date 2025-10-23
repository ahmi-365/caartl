import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ArrowDown } from 'lucide-react-native';

export default function BidModal({ visible, onClose }) {
  const [bidAmount, setBidAmount] = useState(71000);
  const [slideAnim] = useState(new Animated.Value(1000));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const adjustBid = (increment) => {
    setBidAmount((prev) => Math.max(1000, prev + increment));
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheet,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Close Button - Half Outside */}
              <View style={styles.closeButtonWrapper}>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <ArrowDown color="#CADB2A" size={32} />
                </TouchableOpacity>
              </View>

              <Text style={styles.sheetTitle}>Put Forward Your Winning Offer</Text>

              <View style={styles.bidAmountRow}>
                <TouchableOpacity
                  style={[styles.circleButton, styles.minusButton]}
                  onPress={() => adjustBid(-1000)}
                >
                  <Ionicons name="remove" size={28} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.bidAmountContainer}>
                  <Text style={styles.bidAmountText}>{bidAmount.toLocaleString()}</Text>
                  <Text style={styles.bidCurrencyText}>AED</Text>
                </View>

                <TouchableOpacity
                  style={[styles.circleButton, styles.plusButton]}
                  onPress={() => adjustBid(1000)}
                >
                  <Ionicons name="add" size={28} color="#FFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.placeBidButton}>
                <Text style={styles.placeBidText}>Place Bid</Text>
                <Ionicons name="arrow-up-circle" size={22} color="#000" />
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#0F1003',
    borderTopLeftRadius: 33,
    borderTopRightRadius: 33,
    borderTopWidth: 2,
    borderTopColor: '#CADB2A',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonWrapper: {
    position: 'absolute',
    top: -24.5,
    alignSelf: 'center',
    zIndex: 10,
  },
  closeButton: {
    width: 49,
    height: 49,
    borderRadius: 24.5,
    backgroundColor: '#0F1003',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CADB2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  bidAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusButton: {
    backgroundColor: '#FF3B30',
  },
  plusButton: {
    backgroundColor: '#34C759',
  },
  bidAmountContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bidAmountText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  bidCurrencyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  placeBidButton: {
    backgroundColor: '#CADB2A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  placeBidText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});