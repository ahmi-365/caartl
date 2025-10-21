import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <Image
          source={{uri: 'https://static.codia.ai/image/2025-10-21/OefYboHoE1.png'}}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      
      <Text style={styles.title}>Car Detail Page</Text>
      
      <TouchableOpacity style={styles.notificationButton}>
        <Image
          source={{uri: 'https://static.codia.ai/image/2025-10-21/JJR6SrxLMK.png'}}
          style={styles.notificationIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 23,
    paddingVertical: 15,
    height: 110,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 21,
    height: 21,
    tintColor: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Baloo Thambi 2',
    lineHeight: 30.8,
    textAlign: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 25.51,
    height: 24,
  },
});

export default Header;
