import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TopBarProps {
  onMenuPress?: () => void; // Optional prop
  onNotificationPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuPress, onNotificationPress }) => {
  return (
    <View style={styles.header}>
      {/* Left Side: Menu Button (Only if handler exists) OR Spacer */}
      {onMenuPress ? (
        <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={styles.headerButton}>
          <Svg width="26" height="24" viewBox="0 0 26 24" fill="none">
            <Path d="M0 2C0 0.895431 0.895431 0 2 0H20C21.1046 0 22 0.895431 22 2C22 3.10457 21.1046 4 20 4H2C0.895431 4 0 3.10457 0 2Z" fill="white" />
            <Path d="M0 12C0 10.8954 0.895431 10 2 10H16C17.1046 10 18 10.8954 18 12C18 13.1046 17.1046 14 16 14H2C0.895431 14 0 13.1046 0 12Z" fill="white" />
            <Path d="M0 22C0 20.8954 0.895431 20 2 20H20C21.1046 20 22 20.8954 22 22C22 23.1046 21.1046 24 20 24H2C0.895431 24 0 23.1046 0 22Z" fill="white" />
          </Svg>
        </TouchableOpacity>
      ) : (
        // Render an empty view of same size to keep logo centered if needed
        <View style={{ width: 42 }} />
      )}

      <Text style={styles.logo}>caartI</Text>

      <TouchableOpacity onPress={onNotificationPress} activeOpacity={0.7} style={styles.headerButton}>
        <Svg width="24" height="28" viewBox="0 0 24 28" fill="none">
          <Path d="M12 0C10.9 0 10 0.9 10 2C10 2.6 10.3 3.1 10.7 3.4C7.1 4.4 4.5 7.6 4.5 11.5V17L2 19.5V21H22V19.5L19.5 17V11.5C19.5 7.6 16.9 4.4 13.3 3.4C13.7 3.1 14 2.6 14 2C14 0.9 13.1 0 12 0ZM12 28C13.7 28 15 26.7 15 25H9C9 26.7 10.3 28 12 28Z" fill="white" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25.5,
    // Reduced padding values to decrease height
    paddingTop: 10,    // Was 20
    paddingBottom: 10, // Was 16
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerButton: {
    padding: 8,
  },
  logo: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 24,
    color: '#cadb2a',
    letterSpacing: -0.41,
  },
});