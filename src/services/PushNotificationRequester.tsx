import React, { useState, useEffect, useRef } from 'react';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ApiService from './ApiService';
import * as NavigationService from '../navigation/NavigationService'; // 🟢 Import Navigation Service

export const PushNotificationRequester: React.FC = () => {
  const receivedNotifications = useRef<any[]>([]);
  const { user: currentUser } = useAuth();

  // 🟢 Navigation Helper Function
  const handleNotificationNavigation = (data: any) => {
    if (!data) return;
    
    console.log("Processing Notification Data:", data);

    // Parse IDs (they usually come as strings in notification payloads)
    const vehicleId = data.vehicle_id ? Number(data.vehicle_id) : null;
    const bidId = data.bid_id ? Number(data.bid_id) : null;
    const type = data.type;

    if (vehicleId) {
      // 🟢 UPDATED LOGIC: If bid_approved, open in negotiation view
      if (type === 'bid_approved') {
        console.log("Navigating to LiveAuction (Negotiation)", vehicleId);
        NavigationService.navigate('LiveAuction', { carId: vehicleId, viewType: 'negotiation' });
      } 
      // If other bid related -> LiveAuction
      else if (bidId || type === 'outbid' || type === 'bid_placed') {
        console.log("Navigating to LiveAuction", vehicleId);
        NavigationService.navigate('LiveAuction', { carId: vehicleId });
      } 
      // Default -> Car Details
      else {
        console.log("Navigating to CarDetailPage", vehicleId);
        NavigationService.navigate('CarDetailPage', { carId: vehicleId });
      }
    }
  };

  // PUSH NOTIFICATION PERMISSIONS
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
      getFcmToken();
    }
    
    if (Platform.OS === 'android') {
      requestPostNotificationPermission();
    }
  };

  const requestPostNotificationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Android Notification Permission Granted");
        }
      } catch (err) {
        console.log("Notification Error=====>", err);
      }
    }
  };

  // Get Token and Save to Backend
  const getFcmToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      // console.log("FCM Token:", fcmToken);

      if (currentUser && currentUser.id) {
        await ApiService.saveNotificationToken(fcmToken, currentUser.id);
      }
    } catch (error) {
      console.log("Error getting FCM token:", error);
    }
  };

  // LISTEN FOR TOKEN REFRESH
  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
      if (currentUser && currentUser.id) {
        console.log("Token refreshed, updating backend...");
        await ApiService.saveNotificationToken(newToken, currentUser.id);
      }
    });

    return unsubscribe;
  }, [currentUser?.id]);

  // INITIAL SETUP & LISTENERS
  useEffect(() => {
    
    // 1. App Opened from KILLED state
    messaging().getInitialNotification().then(async (remoteMessage) => {
      if (remoteMessage) {
        console.info('Notification caused app to open from killed state:', remoteMessage);
        // Add a small delay to ensure NavigationContainer is ready
        setTimeout(() => handleNotificationNavigation(remoteMessage.data), 1500);
      }
    });

    // 2. App Opened from BACKGROUND state
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.info('Notification caused app to open from background state:', remoteMessage);
      handleNotificationNavigation(remoteMessage.data);
    });

    // 3. App is in FOREGROUND
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage: any) => {
      console.info('A new FCM message arrived!', JSON.stringify(remoteMessage));

      if (receivedNotifications.current.find(n => n.messageId === remoteMessage.messageId)) {
        return;
      }
      receivedNotifications.current =[...receivedNotifications.current, remoteMessage];

      // Create Channel (Android)
      PushNotification.createChannel(
        {
          channelId: "channel-id", 
          channelName: "My channel", 
        },
        (created) => {}
      );

      // Show Local Notification
      PushNotification.localNotification({
        channelId: "channel-id",
        title: remoteMessage.notification?.title || "New Notification",
        message: remoteMessage.notification?.body || "",
        showWhen: true,
        // Pass data to local notification so we can handle click if needed via PushNotification library
        userInfo: remoteMessage.data 
      });
    });

    // Optional: Configure local notification tap handling
    PushNotification.configure({
      onNotification: function (notification) {
        // console.log("LOCAL NOTIFICATION OPENED:", notification);
        
        // If user tapped the local notification while app was in foreground/background
        if (notification.userInteraction) {
           handleNotificationNavigation(notification.data || notification.userInfo);
        }

        // Finish (iOS only)
        if (Platform.OS === 'ios') {
          notification.finish(PushNotification.FetchResult.NoData);
        }
      },
      popInitialNotification: true,
      requestPermissions: false,
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.info('Message handled in the background!', remoteMessage);
    });

    return unsubscribeOnMessage;
  },[]);

  // TRIGGER PERMISSION & TOKEN SAVE ON LOGIN
  useEffect(() => {
    if (currentUser?.id) {
      requestUserPermission();
    }
  }, [currentUser?.id]); 

  return null;
};