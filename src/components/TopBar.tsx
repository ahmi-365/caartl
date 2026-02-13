import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { NotificationItem, RootStackParamList } from '../navigation/AppNavigator';

interface TopBarProps {
  onMenuPress?: () => void; // Optional prop
  onNotificationPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuPress, onNotificationPress }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: 'n-1001',
      title: 'Bid accepted',
      message: 'Your bid on the 2020 Tesla Model 3 was accepted.',
      time: '2m ago',
      isRead: false,
    },
    {
      id: 'n-1002',
      title: 'Price reduced',
      message: 'A vehicle on your watchlist just dropped in price.',
      time: '1h ago',
      isRead: false,
    },
    {
      id: 'n-1003',
      title: 'Auction reminder',
      message: 'Live auction starts in 30 minutes. Tap to view.',
      time: 'Today',
      isRead: true,
    }
  ]);

  const handleBellPress = () => {
    setShowDropdown(prev => !prev);
    if (onNotificationPress) {
      onNotificationPress();
    }
  };

  const handleNotificationItemPress = (item: NotificationItem) => {
    setNotifications(prev =>
      prev.map(entry => (entry.id === item.id ? { ...entry, isRead: true } : entry))
    );
  };

  const handleReadAll = () => {
    setNotifications(prev => prev.map(entry => ({ ...entry, isRead: true })));
  };

  const handleViewAll = () => {
    setShowDropdown(false);
    navigation.navigate('Notifications', { notifications });
  };

  const unreadNotifications = notifications.filter(item => !item.isRead);
  const readNotifications = notifications.filter(item => item.isRead);

  return (
    <>
      {showDropdown && (
        <Pressable style={styles.dropdownBackdrop} onPress={() => setShowDropdown(false)} />
      )}

      <View style={styles.header}>
        {/* Left Side: Menu Button (Only if handler exists) OR Spacer */}
        {onMenuPress ? (
          <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={styles.headerButton}>
            <Svg width="26" height="24" viewBox="0 0 26 24" fill="none">
              <Path d="M0 2C0 0.895431 0.895431 0 2 0H20C21.1046 0 22 0.895431 22 2C22 3.10457 21.1046 4 20 4H2C0.895431 4 0 3.10457 0 2Z" fill="white" />
              <Path d="M0 12C0 10.8954 0.895431 10 2 10H16C17.1046 10 18 10.8954 18 12C18 13.1046 17.1046 14 16 14H2C0.895431 14 0 13.1046 0 12Z" fill="white" />
              <Path d="M0 22C0 20.8954 0.895431 20 2 20H20C21.1046 20 22 20.895431 22 22C22 23.1046 21.1046 24 20 24H2C0.895431 24 0 23.1046 0 22Z" fill="white" />
            </Svg>
          </TouchableOpacity>
        ) : (
          // Render an empty view of same size to keep logo centered if needed
          <View style={{ width: 42 }} />
        )}

        <Text style={styles.logo}>caartI</Text>

        <TouchableOpacity onPress={handleBellPress} activeOpacity={0.7} style={styles.headerButton}>
          <Svg width="24" height="28" viewBox="0 0 24 28" fill="none">
            <Path d="M12 0C10.9 0 10 0.9 10 2C10 2.6 10.3 3.1 10.7 3.4C7.1 4.4 4.5 7.6 4.5 11.5V17L2 19.5V21H22V19.5L19.5 17V11.5C19.5 7.6 16.9 4.4 13.3 3.4C13.7 3.1 14 2.6 14 2C14 0.9 13.1 0 12 0ZM12 28C13.7 28 15 26.7 15 25H9C9 26.7 10.3 28 12 28Z" fill="white" />
          </Svg>
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Notifications</Text>
            {unreadNotifications.length > 0 && (
              <Text style={styles.sectionTitle}>Unread</Text>
            )}
            {unreadNotifications.map(item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={[styles.dropdownItem, styles.unreadItem]}
                onPress={() => handleNotificationItemPress(item)}
              >
                <View style={styles.dropdownItemRow}>
                  <View style={styles.dropdownItemTitleRow}>
                    <View style={styles.unreadDot} />
                    <Text style={styles.dropdownItemTitle} numberOfLines={1}>{item.title}</Text>
                  </View>
                  <Text style={styles.dropdownItemTime}>{item.time}</Text>
                </View>
                <Text style={styles.dropdownItemMessage} numberOfLines={2}>{item.message}</Text>
              </TouchableOpacity>
            ))}

            {readNotifications.length > 0 && (
              <Text style={styles.sectionTitle}>Read</Text>
            )}
            {readNotifications.map(item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={[styles.dropdownItem, styles.readItem]}
                onPress={() => handleNotificationItemPress(item)}
              >
                <View style={styles.dropdownItemRow}>
                  <Text style={styles.dropdownItemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.dropdownItemTime}>{item.time}</Text>
                </View>
                <Text style={styles.dropdownItemMessage} numberOfLines={2}>{item.message}</Text>
              </TouchableOpacity>
            ))}

            {notifications.length === 0 && (
              <Text style={styles.emptyText}>No notifications yet.</Text>
            )}

            <View style={styles.dropdownFooter}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.footerButton}
                onPress={handleReadAll}
              >
                <Text style={styles.footerButtonText}>Read All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.footerButton, styles.viewAllButton]}
                onPress={handleViewAll}
              >
                <Text style={styles.viewAllButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </>
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
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: 54,
    right: 16,
    width: 280,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 10,
    zIndex: 1001,
  },
  sectionTitle: {
    color: '#888',
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dropdownTitle: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: '#1d1d1d',
    marginBottom: 8,
  },
  unreadItem: {
    borderColor: '#2b2b2b',
  },
  readItem: {
    opacity: 0.6,
  },
  dropdownItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cadb2a',
    marginRight: 6,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dropdownItemTitle: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  dropdownItemTime: {
    color: '#888',
    fontFamily: 'Poppins',
    fontSize: 11,
  },
  dropdownItemMessage: {
    color: '#aaa',
    fontFamily: 'Poppins',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    fontFamily: 'Poppins',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
  },
  dropdownFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#ddd',
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: '#cadb2a',
    borderColor: '#cadb2a',
  },
  viewAllButtonText: {
    color: '#000',
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '700',
  },
  logo: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 24,
    color: '#cadb2a',
    letterSpacing: -0.41,
  },
});