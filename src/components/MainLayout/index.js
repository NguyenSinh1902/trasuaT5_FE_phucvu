import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Sidebar from '../Sidebar';
import TableMap from '../../screens/TableMap';
import OrderHistory from '../../screens/OrderHistory';
import Settings from '../../screens/Settings';
import UserProfileModal from '../../screens/TableMap/components/UserProfileModal';
import safeAsyncStorage from '../../utils/storage';
import staffApi from '../../api/staffApi';

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
        setCurrentUser(latestProfile.data || latestProfile);
      }
    } catch (error) {
      console.error('Error loading user data in MainLayout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (route, params) => {
    if (['TableMap', 'OrderHistory', 'Settings'].includes(route)) {
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
