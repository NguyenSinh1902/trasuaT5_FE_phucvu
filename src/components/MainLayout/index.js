import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Sidebar from '../Sidebar';
import TableMap from '../../screens/TableMap';
import OrderHistory from '../../screens/OrderHistory';
import Settings from '../../screens/Settings';
import OnlineBookings from '../../screens/OnlineBookings';
import messaging from '@react-native-firebase/messaging';
import UserProfileModal from '../../screens/TableMap/components/UserProfileModal';
import safeAsyncStorage from '../../utils/storage';
import staffApi from '../../api/staffApi';
import ReadyToServeToast from '../ReadyToServeToast';

const MainLayout = ({ navigation, route }) => {
  const [activeRoute, setActiveRoute] = useState(route.params?.screen || 'TableMap');

  useEffect(() => {
    if (route.params?.screen) {
      setActiveRoute(route.params.screen);
    }
  }, [route.params?.screen]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fcmBookingData, setFcmBookingData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const storedUser = await safeAsyncStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        const latestProfile = await staffApi.getProfile(userObj.idNhanVien);
        const usr = latestProfile.data || latestProfile;
        setCurrentUser(usr);

        // Đăng ký nhận thông báo FCM
        const authStatus = await messaging().requestPermission();
        if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
          await messaging().subscribeToTopic('PHUC_VU');
          console.log('Subscribed to PHUC_VU topic');
        }
      }
    } catch (error) {
      console.error('Error loading user data in MainLayout:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Lắng nghe khi bấm vào Push Notification lúc app đang mở ngầm (Background)
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
      setActiveRoute('OnlineBookings');
    });

    // Lắng nghe khi bấm vào Push Notification lúc app đã bị tắt hoàn toàn (Quit state)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage.notification);
          setTimeout(() => setActiveRoute('OnlineBookings'), 1000);
        }
      });

    // Lắng nghe khi app đang MỞ (Foreground) - Dùng chung Toast hệ thống cho đồng bộ!
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      const title = remoteMessage.notification?.title || '';
      const isBooking = title.toLowerCase().includes('đặt bàn');

      // Nếu không phải là luồng Đặt Bàn, BỎ QUA Push Notification này!
      // Bởi vì TableMap đã có bộ lắng nghe Realtime (RTDB) tự động xử lý các sự kiện 
      // thanh toán, món đã xong, hủy đơn... và sẽ tự hiển thị Toast tương ứng rồi.
      if (!isBooking) return;

      setFcmBookingData({
        id: Date.now().toString(),
        type: 'booking',
        message: remoteMessage.notification?.body || 'Có khách hàng vừa đặt bàn, vui lòng kiểm tra ngay.',
        duration: 8000,
        isBooking: true
      });
    });

    return () => {
      unsubscribe();
      unsubscribeForeground();
    };
  }, []);

  const handleNavigate = (route, params) => {
    if (['TableMap', 'OrderHistory', 'Settings', 'OnlineBookings'].includes(route)) {
      setActiveRoute(route);
    } else {
      // For other screens like OrderMenu, use native navigation
      if (params?.reset) {
        navigation.reset({ index: 0, routes: [{ name: route, params }] });
      } else {
        navigation.navigate(route, params);
      }
    }
  };

  const renderContent = () => {
    switch (activeRoute) {
      case 'TableMap':
        return <TableMap onNavigate={handleNavigate} />;
      case 'OrderHistory':
        return <OrderHistory onNavigate={handleNavigate} />;
      case 'OnlineBookings':
        return <OnlineBookings onNavigate={handleNavigate} />;
      case 'Settings':
        return <Settings onNavigate={handleNavigate} />;
      default:
        return <TableMap onNavigate={handleNavigate} />;
    }
  };

  if (loading && !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34A853" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onShowProfile={() => setShowProfile(true)}
      />
      <View style={styles.content}>
        {renderContent()}
      </View>

      <UserProfileModal
        isVisible={showProfile}
        onClose={() => setShowProfile(false)}
        onLogout={async () => {
          setShowProfile(false);
          await safeAsyncStorage.removeItem('token');
          await safeAsyncStorage.removeItem('user');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
        onUpdate={(updatedUser) => setCurrentUser(updatedUser)}
      />

      <ReadyToServeToast 
        toast={fcmBookingData} 
        onDismiss={() => setFcmBookingData(null)}
        onPress={(toastData) => {
          setFcmBookingData(null);
          if (toastData.isBooking) {
            setActiveRoute('OnlineBookings');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EEF5F0',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF5F0',
  },
});

export default MainLayout;
