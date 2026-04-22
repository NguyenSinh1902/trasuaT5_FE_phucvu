import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TextInput, Pressable, 
  ActivityIndicator, useWindowDimensions, StatusBar,
  RefreshControl 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './OrderHistory.styles';
import orderApi from '../../api/orderApi';
import staffApi from '../../api/staffApi';
import safeAsyncStorage from '../../utils/storage';
import UserProfileModal from '../TableMap/components/UserProfileModal';
import InvoiceHistoryModal from './components/InvoiceHistoryModal';
import Sidebar from '../../components/Sidebar';

const OrderHistory = ({ onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  useEffect(() => {
    loadUserData();
    fetchOrders();
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

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getAll();
      // response đã là mảng dữ liệu do axiosClient interceptor xử lý
      if (response && Array.isArray(response)) {
        const sorted = response.sort((a, b) => new Date(b.thoiGianTao) - new Date(a.thoiGianTao));
        setOrders(sorted);
      } else if (response && response.data) {
        // Phòng trường hợp cấu trúc API thay đổi
        const sorted = response.data.sort((a, b) => new Date(b.thoiGianTao) - new Date(a.thoiGianTao));
        setOrders(sorted);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN': return { bg: '#FEF3C7', color: '#B45309', label: 'Chờ xác nhận' };
      case 'DANG_PHA_CHE': return { bg: '#DBEAFE', color: '#1E40AF', label: 'Đang pha chế' };
      case 'CHO_LAY_MON': return { bg: '#CCFBF1', color: '#0F766E', label: 'Chờ lấy món' };
      case 'DANG_PHUC_VU': return { bg: '#DCFCE7', color: '#166534', label: 'Đang phục vụ' };
      case 'CHO_THANH_TOAN': return { bg: '#FFEDD5', color: '#9A3412', label: 'Chờ thanh toán' };
      case 'DA_THANH_TOAN': return { bg: '#F3E8FF', color: '#6B21A8', label: 'Đã thanh toán' };
      case 'HOAN_TAT': return { bg: '#D1FAE5', color: '#065F46', label: 'Hoàn tất' };
      case 'DA_HUY': return { bg: '#FEE2E2', color: '#991B1B', label: 'Đã hủy' };
      default: return { bg: '#F1F5F9', color: '#475569', label: status };
    }
  };

  const filteredOrders = orders.filter(order => 
    order.idHoaDon.toString().includes(searchQuery) || 
    (order.tenKhachHang && order.tenKhachHang.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderOrderRow = ({ item }) => {
    const status = getStatusStyle(item.trangThai);
    const date = new Date(item.thoiGianTao);
    const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;

    return (
      <Pressable style={styles.orderRow} onPress={() => {}}>
        <View style={{ width: 80 }}><Text style={[styles.cellText, styles.orderIdText]}>#{item.idHoaDon}</Text></View>
        <View style={{ width: 120 }}><Text style={styles.cellText}>{timeStr}</Text></View>
        <View style={{ flex: 1 }}><Text style={styles.cellText} numberOfLines={1}>{item.loaiDonHang === 'MANG_VE' ? 'Mang về' : 'Tại bàn'}</Text></View>
        <View style={{ flex: 1.5 }}><Text style={styles.cellText} numberOfLines={1}>{item.tenKhachHang || '---'}</Text></View>
        <View style={{ flex: 1.2 }}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={{ width: 100, alignItems: 'flex-end' }}>
          <Text style={[styles.cellText, styles.priceText]}>{item.tongThanhToan?.toLocaleString()}đ</Text>
        </View>
        <View style={{ width: 50, alignItems: 'center' }}>
          <Pressable 
            style={({ pressed }) => [
              { 
                width: 36, 
                height: 36, 
                borderRadius: 12, 
                backgroundColor: '#EFF6FF', 
                justifyContent: 'center', 
                alignItems: 'center', 
                borderWidth: 1,
                borderColor: '#DBEAFE',
                opacity: pressed ? 0.6 : 1 
              }
            ]}
            onPress={() => setSelectedInvoiceId(item.idHoaDon)}
          >
            <Text style={{ fontSize: 18, color: '#3B82F6', fontWeight: '900' }}>→</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Common Sidebar Component */}
      <Sidebar 
        activeRoute="OrderHistory"
        onNavigate={onNavigate}
        currentUser={currentUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onShowProfile={() => setShowProfile(true)}
      />

      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>Lịch sử đơn hàng</Text>
            <Text style={styles.subtitle}>Quản lý và tra cứu thông tin hóa đơn</Text>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.searchBox}>
              <Text>🔍</Text>
              <TextInput 
                style={styles.searchInput} 
                placeholder="Tìm mã đơn, khách hàng..." 
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable style={styles.filterBtn}>
              <Text>📅</Text>
              <Text style={styles.filterBtnText}>Hôm nay</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <View style={{ width: 80 }}><Text style={styles.headerCell}>Mã đơn</Text></View>
            <View style={{ width: 120 }}><Text style={styles.headerCell}>Thời gian</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.headerCell}>Loại đơn</Text></View>
            <View style={{ flex: 1.5 }}><Text style={styles.headerCell}>Khách hàng</Text></View>
            <View style={{ flex: 1.2 }}><Text style={styles.headerCell}>Trạng thái</Text></View>
            <View style={{ width: 100, alignItems: 'flex-end' }}><Text style={styles.headerCell}>Tổng tiền</Text></View>
            <View style={{ width: 50 }}><Text style={styles.headerCell}></Text></View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#34A853" style={{ marginTop: 100 }} />
          ) : (
            <FlatList 
              data={filteredOrders}
              keyExtractor={item => item.idHoaDon.toString()}
              renderItem={renderOrderRow}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 60 }}>📂</Text>
                  <Text style={styles.emptyTitle}>Không tìm thấy hóa đơn nào</Text>
                  <Text style={styles.emptySubtitle}>Thử thay đổi từ khóa tìm kiếm hoặc lọc lại ngày</Text>
                </View>
              }
            />
          )}
        </View>
      </View>

      <UserProfileModal 
        isVisible={showProfile} 
        onClose={() => setShowProfile(false)} 
        onLogout={() => { setShowProfile(false); onNavigate('Login'); }} 
        user={currentUser}
      />
      <InvoiceHistoryModal 
        isVisible={!!selectedInvoiceId} 
        invoiceId={selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)} 
      />
    </View>
  );
};

export default OrderHistory;
