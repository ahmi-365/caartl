import { Feather } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NotificationItem, RootStackParamList } from '../navigation/AppNavigator';
import ApiService from '../services/ApiService';

const NotificationsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Notifications'>>();
  const[notifications, setNotifications] = React.useState<NotificationItem[]>(route.params?.notifications ??[]);

  const handleNotificationPress = async (item: NotificationItem) => {
    // 1. Mark as read visually & API call
    if (!item.isRead) {
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
        try {
            await ApiService.markNotificationAsRead(item.id);
        } catch (error) {
            console.log("Error marking read", error);
        }
    }

    // 2. Navigation Logic based on payload
    if (item.data) {
        const { vehicle_id, bid_id, invoice_id, type } = item.data;

        // Navigate to Auction/Vehicle Detail
        if (vehicle_id) {
            // 🟢 UPDATED LOGIC: If bid_approved, open in negotiation view
            if (type === 'bid_approved') {
                 console.log("Navigating to LiveAuction (Negotiation)", vehicle_id);
                 navigation.navigate('LiveAuction', { carId: Number(vehicle_id), viewType: 'negotiation' });
            } 
            // If other bid related -> LiveAuction
            else if (bid_id || type === 'outbid' || type === 'bid_placed') {
                 console.log("Navigating to LiveAuction", vehicle_id);
                 navigation.navigate('LiveAuction', { carId: Number(vehicle_id) });
            } 
            // Default -> CarDetailPage
            else {
                 console.log("Navigating to CarDetailPage", vehicle_id);
                 navigation.navigate('CarDetailPage', { carId: Number(vehicle_id) });
            }
        } 
        else if (invoice_id) {
             console.log("Navigate to Invoice", invoice_id);
             // navigation.navigate('InvoiceDetail', { invoiceId: invoice_id }); 
        }
    }
  };

  const unreadNotifications = notifications.filter(item => !item.isRead);
  const readNotifications = notifications.filter(item => item.isRead);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {unreadNotifications.length > 0 && (
          <Text style={styles.sectionTitle}>Unread</Text>
        )}
        {unreadNotifications.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.card, styles.unreadCard]}
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <View style={styles.unreadDot} />
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </TouchableOpacity>
        ))}

        {readNotifications.length > 0 && (
          <Text style={styles.sectionTitle}>Read</Text>
        )}
        {readNotifications.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.card, styles.readCard]}
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </TouchableOpacity>
        ))}

        {notifications.length === 0 && (
          <Text style={styles.emptyText}>No notifications yet.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 30,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    color: '#888',
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    padding: 16,
    marginBottom: 12,
  },
  unreadCard: {
    borderColor: '#2b2b2b',
  },
  readCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
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
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    color: '#888',
    fontFamily: 'Poppins',
    fontSize: 11,
  },
  message: {
    color: '#ddd',
    fontFamily: 'Poppins',
    fontSize: 13,
    lineHeight: 19,
  },
  emptyText: {
    color: '#666',
    fontFamily: 'Poppins',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default NotificationsScreen;