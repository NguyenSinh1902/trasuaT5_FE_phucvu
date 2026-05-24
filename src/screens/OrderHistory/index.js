import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, Pressable, Modal,
  ActivityIndicator, useWindowDimensions, StatusBar,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './OrderHistory.styles';
import orderApi from '../../api/orderApi';
import staffApi from '../../api/staffApi';
import safeAsyncStorage from '../../utils/storage';
import UserProfileModal from '../TableMap/components/UserProfileModal';
import DatePicker from 'react-native-date-picker';
import InvoiceHistoryModal from './components/InvoiceHistoryModal';
import NotificationModal from '../TableMap/components/NotificationModal';
import Sidebar from '../../components/Sidebar';
import { listenToFirebase } from '../../utils/firebaseListener';

const OrderHistory = ({ onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedTime, setSelectedTime] = useState('ALL');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  const [showNotiModal, setShowNotiModal] = useState(false);
  const [unreadNotiCount, setUnreadNotiCount] = useState(0);

  const loadNotiCount = useCallback(async () => {
    try {
      const raw = await safeAsyncStorage.getItem('app_notifications');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUnreadNotiCount(parsed.filter(n => n.isUnread).length);
      } else {
        setUnreadNotiCount(0);
      }
    } catch (e) { }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotiCount();
    }, [loadNotiCount])
  );

  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  useEffect(() => {
    loadUserData();
    fetchOrders();

    const orderListener = listenToFirebase('orders', firebaseOrders => {
      if (!firebaseOrders || typeof firebaseOrders !== 'object') return;
      const orderUpdates = Object.values(firebaseOrders).filter(o => o !== null && o !== undefined && o.idHoaDon != null);

      // Thứ tự vòng đời — chỉ cập nhật nếu Firebase tiến về phía trước, không được lùi
      const STATUS_RANK = {
        CHO_XAC_NHAN: 0, DANG_PHA_CHE: 1, CHO_LAY_MON: 2,
        DANG_PHUC_VU: 3, CHO_THANH_TOAN: 4, DA_THANH_TOAN: 5,
        HOAN_TAT: 6, DA_HUY: 6,
      };
      const shouldUpdate = (localStatus, fbStatus) => {
        const localRank = STATUS_RANK[localStatus] ?? -1;
        const fbRank = STATUS_RANK[fbStatus] ?? -1;
        return fbRank >= localRank;
      };

      setOrders(prevOrders => {
        if (prevOrders.length === 0) return prevOrders;

        // Cập nhật in-place với bảo vệ không downgrade
        const nextOrders = prevOrders.map(o => {
          const fbOrder = orderUpdates.find(u => u.idHoaDon == o.idHoaDon);
          if (fbOrder && shouldUpdate(o.trangThai, fbOrder.trangThai) &&
            (fbOrder.trangThai !== o.trangThai || fbOrder.tongThanhToan !== o.tongThanhToan)) {
            return { ...o, trangThai: fbOrder.trangThai, tongThanhToan: fbOrder.tongThanhToan };
          }
          return o;
        });

        // Nếu Firebase có đơn mới chưa có trong danh sách → fetch lại
        // Delay 2.5s để MySQL kịp cập nhật HOAN_TAT trước khi gọi API
        const hasNewOrder = orderUpdates.some(fb => !prevOrders.some(o => o.idHoaDon == fb.idHoaDon));
        if (hasNewOrder) {
          setTimeout(() => fetchOrders(), 2500);
        }

        return nextOrders;
      });
    });

    return () => {
      orderListener.stop();
    };
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.idHoaDon.toString().includes(searchQuery) ||
      (order.tenKhachHang && order.tenKhachHang.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || order.trangThai === selectedStatus;

    const orderDate = new Date(order.thoiGianTao);
    const today = new Date();
    const isToday = orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear();

    let matchesTime = false;
    if (selectedTime === 'ALL') {
      matchesTime = true;
    } else if (selectedTime === 'TODAY') {
      matchesTime = isToday;
    } else if (selectedTime === 'RANGE') {
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesTime = orderDate >= start && orderDate <= end;
      } else {
        matchesTime = true;
      }
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  const renderOrderRow = ({ item }) => {
    const status = getStatusStyle(item.trangThai);
    const date = new Date(item.thoiGianTao);
    const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;

    return (
      <Pressable style={styles.orderRow} onPress={() => { }}>
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
            <Pressable style={[styles.filterBtn, { width: 48, paddingHorizontal: 0, justifyContent: 'center' }]} onPress={() => setShowFilterModal(true)}>
              <View style={{ gap: 3, alignItems: 'center' }}>
                <View style={{ width: 16, height: 2, backgroundColor: '#475569', borderRadius: 1 }} />
                <View style={{ width: 10, height: 2, backgroundColor: '#475569', borderRadius: 1, alignSelf: 'center' }} />
                <View style={{ width: 4, height: 2, backgroundColor: '#475569', borderRadius: 1, alignSelf: 'center' }} />
              </View>
            </Pressable>
            <Pressable style={[styles.filterBtn, { width: 48, paddingHorizontal: 0, justifyContent: 'center' }]} onPress={() => setShowNotiModal(true)}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
              {unreadNotiCount > 0 && (
                <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>{unreadNotiCount > 9 ? '9+' : unreadNotiCount}</Text>
                </View>
              )}
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

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent={true} animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setShowFilterModal(false)}>
          <Pressable style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }} onPress={e => e.stopPropagation()}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 20 }}>Lọc hóa đơn</Text>

            {/* Time Filter */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 10 }}>Thời gian</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <Pressable
                style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: selectedTime === 'ALL' ? '#10B981' : '#E2E8F0', backgroundColor: selectedTime === 'ALL' ? '#F0FDF4' : '#FFFFFF', alignItems: 'center' }}
                onPress={() => setSelectedTime('ALL')}
              >
                <Text style={{ color: selectedTime === 'ALL' ? '#047857' : '#475569', fontWeight: '600' }}>Tất cả</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: selectedTime === 'TODAY' ? '#10B981' : '#E2E8F0', backgroundColor: selectedTime === 'TODAY' ? '#F0FDF4' : '#FFFFFF', alignItems: 'center' }}
                onPress={() => setSelectedTime('TODAY')}
              >
                <Text style={{ color: selectedTime === 'TODAY' ? '#047857' : '#475569', fontWeight: '600' }}>Hôm nay</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1.5, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: selectedTime === 'RANGE' ? '#10B981' : '#E2E8F0', backgroundColor: selectedTime === 'RANGE' ? '#F0FDF4' : '#FFFFFF', alignItems: 'center' }}
                onPress={() => {
                  setSelectedTime('RANGE');
                  setOpenStartDatePicker(true);
                }}
              >
                <Text style={{ color: selectedTime === 'RANGE' ? '#047857' : '#475569', fontWeight: '600' }}>Khoảng ngày</Text>
              </Pressable>
            </View>

            {selectedTime === 'RANGE' && startDate && endDate && (
              <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8 }}>
                <Text style={{ fontSize: 13, color: '#475569' }}>
                  Từ: <Text style={{ fontWeight: '600', color: '#1E293B' }}>{startDate.toLocaleDateString('vi-VN')}</Text>
                </Text>
                <Text style={{ fontSize: 13, color: '#475569' }}>
                  Đến: <Text style={{ fontWeight: '600', color: '#1E293B' }}>{endDate.toLocaleDateString('vi-VN')}</Text>
                </Text>
                <Pressable onPress={() => setOpenStartDatePicker(true)}>
                  <Text style={{ fontSize: 13, color: '#10B981', fontWeight: '600' }}>Sửa</Text>
                </Pressable>
              </View>
            )}

            {/* Status Filter */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 10 }}>Trạng thái</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              <Pressable
                style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: selectedStatus === 'ALL' ? '#10B981' : '#E2E8F0', backgroundColor: selectedStatus === 'ALL' ? '#F0FDF4' : '#FFFFFF' }}
                onPress={() => setSelectedStatus('ALL')}
              >
                <Text style={{ color: selectedStatus === 'ALL' ? '#047857' : '#475569', fontSize: 13, fontWeight: '500' }}>Tất cả</Text>
              </Pressable>
              {['CHO_XAC_NHAN', 'DANG_PHA_CHE', 'CHO_LAY_MON', 'DANG_PHUC_VU', 'CHO_THANH_TOAN', 'DA_THANH_TOAN', 'HOAN_TAT', 'DA_HUY'].map(status => {
                const style = getStatusStyle(status);
                const isSelected = selectedStatus === status;
                return (
                  <Pressable
                    key={status}
                    style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: isSelected ? '#10B981' : '#E2E8F0', backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF' }}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text style={{ color: isSelected ? '#047857' : '#475569', fontSize: 13, fontWeight: '500' }}>{style.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={{ width: '100%', padding: 14, backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center' }}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Áp dụng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>


      <InvoiceHistoryModal
        isVisible={!!selectedInvoiceId}
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
      <DatePicker
        modal
        open={openStartDatePicker}
        date={startDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setOpenStartDatePicker(false);
          setStartDate(date);
          setOpenEndDatePicker(true); // Tự động mở tiếp cái thứ 2
        }}
        onCancel={() => {
          setOpenStartDatePicker(false);
        }}
      />
      <DatePicker
        modal
        open={openEndDatePicker}
        date={endDate || startDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setOpenEndDatePicker(false);
          setEndDate(date);
        }}
        onCancel={() => {
          setOpenEndDatePicker(false);
        }}
      />
      <NotificationModal
        isVisible={showNotiModal}
        onClose={() => {
          setShowNotiModal(false);
          loadNotiCount();
        }}
      />
    </View>
  );
};

export default OrderHistory;
