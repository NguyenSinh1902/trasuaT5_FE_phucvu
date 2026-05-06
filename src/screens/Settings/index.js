import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StatusBar, Alert, useWindowDimensions } from 'react-native';
import styles from './Settings.styles';
import Sidebar from '../../components/Sidebar';
import safeAsyncStorage from '../../utils/storage';
import staffApi from '../../api/staffApi';

const Settings = ({ onNavigate }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await safeAsyncStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        const latestProfile = await staffApi.getProfile(userObj.idNhanVien);
        setCurrentUser(latestProfile.data || latestProfile);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng xuất', 
        style: 'destructive', 
        onPress: async () => {
          await safeAsyncStorage.removeItem('token');
          await safeAsyncStorage.removeItem('user');
          onNavigate('Login', { reset: true });
        } 
      },
    ]);
  };

  const renderSettingItem = (icon, label, value, color, onPress, showSwitch = false, switchValue = false, onSwitchChange = null) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
      </View>
      {showSwitch ? (
        <Switch 
          value={switchValue} 
          onValueChange={onSwitchChange} 
          trackColor={{ false: '#CBD5E1', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {isTablet && (
        <Sidebar 
          activeRoute="Settings"
          onNavigate={onNavigate}
          currentUser={currentUser}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onShowProfile={() => {}}
        />
      )}

      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cài đặt</Text>
          <Text style={styles.headerSubtitle}>Quản lý tài khoản và tùy chỉnh ứng dụng</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.card}>
            {renderSettingItem('👤', 'Thông tin cá nhân', currentUser?.hoTen, '#3B82F6', () => {})}
            <View style={styles.divider} />
            {renderSettingItem('📧', 'Email', currentUser?.email, '#10B981', () => {})}
            <View style={styles.divider} />
            {renderSettingItem('📞', 'Số điện thoại', currentUser?.soDienThoai || 'Chưa cập nhật', '#F59E0B', () => {})}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ứng dụng</Text>
          <View style={styles.card}>
            {renderSettingItem('🔔', 'Thông báo đẩy', 'Nhận thông báo đơn hàng mới', '#8B5CF6', null, true, notifications, setNotifications)}
            <View style={styles.divider} />
            {renderSettingItem('🔐', 'Bảo mật sinh trắc học', 'Vân tay hoặc FaceID', '#EC4899', null, true, biometrics, setBiometrics)}
            <View style={styles.divider} />
            {renderSettingItem('🌐', 'Ngôn ngữ', 'Tiếng Việt', '#06B6D4', () => {})}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          <View style={styles.card}>
            {renderSettingItem('❓', 'Trung tâm trợ giúp', null, '#64748B', () => {})}
            <View style={styles.divider} />
            {renderSettingItem('📜', 'Điều khoản & Chính sách', null, '#64748B', () => {})}
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={{ fontSize: 20 }}>📤</Text>
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </Pressable>

        <Text style={styles.versionText}>Phiên bản 1.0.2 (Build 2026.05.07)</Text>
      </ScrollView>
    </View>
  );
};

export default Settings;
