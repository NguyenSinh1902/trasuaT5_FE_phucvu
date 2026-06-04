import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, Modal, ScrollView, RefreshControl } from 'react-native';
import styles from './OnlineBookings.styles';
import staffApi from '../../api/staffApi';
import tableApi from '../../api/tableApi';
import { useFocusEffect } from '@react-navigation/native';

const OnlineBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showTableModal, setShowTableModal] = useState(false);
  const [emptyTables, setEmptyTables] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await staffApi.getPendingBookings();
      setBookings(res?.data || res || []);
    } catch (e) {
      console.log('Error fetching pending bookings', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
      // Auto refresh every 10 seconds
      const interval = setInterval(fetchBookings, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const openTableSelect = async (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowTableModal(true);
    try {
      const res = await tableApi.getAll();
      const allTables = res?.data || res || [];
      setEmptyTables(allTables.filter(t => t.tinhTrangBan === 'TRONG'));
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải danh sách bàn');
    }
  };

  const handleAssignTable = async (tableId) => {
    try {
      setShowTableModal(false);
      setLoading(true);
      await staffApi.assignTableForBooking(selectedBookingId, tableId);
      Alert.alert('Thành công', 'Đã xếp bàn thành công!');
      fetchBookings();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể xếp bàn');
      setLoading(false);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.getDate()}/${d.getMonth()+1}`;
  };

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.customerName}>{item.tenKhachHang || 'Khách hàng'}</Text>
        <Text style={styles.timeText}>🕒 {formatDate(item.thoiGianDat)}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailItem}>📞 {item.sdtKhachHang || 'Không có SĐT'}</Text>
        <Text style={styles.detailItem}>👥 {item.soLuongNguoi} người</Text>
      </View>
      {item.ghiChu ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>Ghi chú: {item.ghiChu}</Text>
        </View>
      ) : null}
      <Pressable style={styles.actionBtn} onPress={() => openTableSelect(item.idPhieuDat || item.id)}>
        <Text style={styles.actionBtnText}>Xếp Bàn</Text>
      </Pressable>
    </View>
  );

  if (loading && !refreshing && bookings.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#34A853" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đặt Bàn Online</Text>
        {bookings.length > 0 && (
          <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.badgeText}>{bookings.length} phiếu chờ</Text>
          </View>
        )}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={item => item.idPhieuDat?.toString() || item.id?.toString()}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 50 }}>📭</Text>
            <Text style={styles.emptyText}>Không có yêu cầu đặt bàn nào</Text>
          </View>
        }
      />

      <Modal visible={showTableModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn Bàn Trống</Text>
            {emptyTables.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 20, color: '#EF4444' }}>Hiện tại không có bàn trống nào!</Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {emptyTables.map(t => (
                  <Pressable key={t.idBan} style={styles.tableBtn} onPress={() => handleAssignTable(t.idBan)}>
                    <Text style={styles.tableBtnText}>{t.tenBan} - Sức chứa: {t.soGhe || '?'} người</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <Pressable style={styles.closeBtn} onPress={() => setShowTableModal(false)}>
              <Text style={styles.closeBtnText}>Hủy Bỏ</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OnlineBookings;
