import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './Sidebar.styles';

const Sidebar = ({ 
  activeRoute, 
  onNavigate, 
  currentUser, 
  isCollapsed, 
  onToggleCollapse,
  onShowProfile 
}) => {
  const renderNavItem = (route, label, icon) => {
    const isActive = activeRoute === route;
    return (
      <Pressable 
        style={[
          styles.tabletNavItem, 
          isActive && styles.tabletNavItemActive,
          isCollapsed && styles.tabletNavItemCollapsed
        ]} 
        onPress={() => onNavigate(route)}
      >
        <View style={styles.tabletNavIconWrap}>
          <Text style={styles.tabletNavIcon}>{icon}</Text>
        </View>
        {!isCollapsed && (
          <Text style={isActive ? styles.tabletNavLabelActive : styles.tabletNavLabel}>
            {label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.tabletSidebar, isCollapsed && styles.tabletSidebarCollapsed]}>
      {/* 1. Header Card */}
      <Pressable
        style={[styles.sidebarHeader, isCollapsed && styles.sidebarHeaderCollapsed]}
        onPress={onToggleCollapse}
      >
        <View style={styles.brandGroup}>
          <View style={styles.brandLogo}><Text style={styles.brandLogoText}>🍃</Text></View>
          {!isCollapsed && (
            <View style={styles.brandTitleGroup}>
              <Text style={styles.brandTitle}>MatchTea</Text>
              <Text style={styles.brandSubtitle}>App phục vụ</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* 2. Main Navigation Card - This one should expand */}
      <LinearGradient 
        colors={['#8CE082', '#41A338']} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }} 
        style={[styles.tabletNavContainer, isCollapsed && styles.tabletNavContainerCollapsed]}
      >
        {renderNavItem('TableMap', 'Trang chủ', '🏠')}
        {renderNavItem('OrderHistory', 'Lịch sử đơn hàng', '📋')}
        {renderNavItem('Settings', 'Cài đặt', '⚙️')}
      </LinearGradient>

      {/* 3. Footer Profile Card */}
      <View style={[styles.sidebarFooter, isCollapsed && styles.sidebarFooterCollapsed]}>
        <Pressable 
          style={styles.userProfileGroup}
          onPress={onShowProfile}
        >
          <View style={styles.avatarWrap}>
            {currentUser?.avatar || currentUser?.hinhAnh ? (
              <Image source={{ uri: currentUser.avatar || currentUser.hinhAnh }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>
                {currentUser?.hoTen ? currentUser.hoTen.split(' ').pop().substring(0, 2).toUpperCase() : '??'}
              </Text>
            )}
          </View>
          {!isCollapsed && (
            <View style={styles.userInfoText}>
              <Text style={styles.userName} numberOfLines={1}>{currentUser?.hoTen || 'Đang tải...'}</Text>
              <Text style={styles.userRole}>
                {currentUser?.vaiTro === 'PHUC_VU' ? 'Phục vụ' : 
                 currentUser?.vaiTro === 'THU_NGAN' ? 'Thu ngân' : 
                 currentUser?.vaiTro || 'Nhân viên'}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default Sidebar;
