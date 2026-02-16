

import React, { useContext, useState, useEffect, useRef } from 'react';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ApiService from './ApiService';

export const PushNotificationRequester: React.FC = () => {
  const receivedNotifications = useRef<any[]>([]);
  const { user: currentUser } = useAuth();


  // PUSH NOTIFICATION

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
      getFcmToken();
    }
    requestPostNotificationPermission()
  };

  const requestPostNotificationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version > 32) {
      try {
        PermissionsAndroid.check('android.permission.POST_NOTIFICATIONS').then(
          response => {
            if (!response) {
              PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS', {
                title: 'Notification',
                message:
                  'Caartl App needs access to your notification ' +
                  'so you can get Updates',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              })
            }
          }
        ).catch(
          err => {
            console.log("Notification Error=====>", err);
          }
        )
      } catch (err) {
        console.log(err);
      }
    }
  };

  const getFcmToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      // Save token to backend
      const result = await ApiService.saveNotificationToken(fcmToken);
    } catch (error) {
      console.log("Error", error);
    }
  }



  useEffect(() => {
    messaging().getInitialNotification()
      .then(async (remoteMessage) => {
        console.info('Notification caused app to open from killed state: ==>>', remoteMessage);

      });

    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      console.info('A new FCM message arrived!', JSON.stringify(remoteMessage));

      if (receivedNotifications.current.find(notification => notification.messageId === remoteMessage.messageId)) {
        return;
      }

      receivedNotifications.current = [...receivedNotifications.current, remoteMessage];

      PushNotification.createChannel({
        channelId: "channel-id", // (required)
        channelName: "My channel", // (required)
      }
      )

      PushNotification.configure({
        onNotification: function (notification) {
          console.info('Notification received:', remoteMessage);

          // Finish the notification (iOS only)
          Platform.OS == 'ios' && notification.finish(PushNotification.FetchResult.NoData);
        },

        requestPermissions: true, // Request permission for notifications automatically
      });

      PushNotification.localNotification({
        channelId: "channel-id",
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body, // (required)
        showWhen: true,
      })

      if (!remoteMessage?.data?.type || !remoteMessage?.data?.source_id) {
        return
      }

    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.info('Message handled in the background!', remoteMessage);

    });


    // This is called when app is running in the background and user interacts with the notification
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.info('Notification caused app to open from background  state but app is running: ==>>', remoteMessage);

    });


    // This is called when the app is killed and and not running in the background

    return unsubscribe;
  }, []);


  useEffect(() => {
    try {
      requestUserPermission();
    } catch (error) {

    }
  }, [currentUser?.id, currentUser?.phone_verified_at]);
  // END


  return (
    <>

    </>
  );
}
