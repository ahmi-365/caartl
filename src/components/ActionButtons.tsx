import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const ActionButtons: React.FC = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 43,
    paddingBottom: 40,
    alignItems: 'flex-end',
  },
  buyButton: {
    backgroundColor: '#CADB2A',
    borderRadius: 11,
    paddingVertical: 12.5,
    paddingHorizontal: 54,
  },
  buyButtonText: {
    fontFamily: 'Barlow',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 24,
    color: '#000000',
    textAlign: 'center',
  },
});

export default ActionButtons;
