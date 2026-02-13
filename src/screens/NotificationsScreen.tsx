import { Feather } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NotificationItem, RootStackParamList } from '../navigation/AppNavigator';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Notifications'>>();
  const notifications: NotificationItem[] = route.params?.notifications ?? [];

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
          <View key={item.id} style={[styles.card, styles.unreadCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <View style={styles.unreadDot} />
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        ))}

        {readNotifications.length > 0 && (
          <Text style={styles.sectionTitle}>Read</Text>
        )}
        {readNotifications.map(item => (
          <View key={item.id} style={[styles.card, styles.readCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </View>
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
