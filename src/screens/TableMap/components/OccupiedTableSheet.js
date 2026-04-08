import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';
import reservationApi from '../../../api/reservationApi';
import orderApi from '../../../api/orderApi';

const OccupiedTableSheet = ({ table, tables, onClose, onUpdateGuest, onRefresh, onOpenMenu, onViewInvoice }) => {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'merge', 'change', null

  if (!table) return null;

  const emptyTables = (tables || []).filter(t => t.tinhTrangBan === 'TRONG');
  const reservationId = table.reservation?.idPhieuDat;

  const handleMerge = async (targetTableId) => {
    if (!reservationId) return;
    setLoading(true);
    try {
      await reservationApi.mergeTables(reservationId, [targetTableId]);
      if (onRefresh) await onRefresh();
      onClose();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể gộp bàn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTable = async (newTableId) => {
    if (!reservationId) return;
    setLoading(true);
    try {
      await reservationApi.changeTable(reservationId, table.idBan, newTableId);
      if (onRefresh) await onRefresh();
      onClose();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đổi bàn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!reservationId) return;
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn hủy phiếu đặt/mở bàn này không?',
      [
        { text: 'Bỏ qua', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await reservationApi.cancelReservation(reservationId);
              if (onRefresh) await onRefresh();
              onClose();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể hủy phiếu. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRequestPayment = async () => {
    const invoiceId = table.invoice?.idHoaDon;
    if (!invoiceId) {
      Alert.alert('Thanh toán', 'Bàn này hiện chưa có hóa đơn hoặc hóa đơn không còn hiệu lực.');
      return;
    }

    Alert.alert(
      'Yêu cầu thanh toán',
      'Bạn muốn gửi yêu cầu thanh toán cho hóa đơn này?',
      [
        { text: 'Bỏ qua', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: async () => {
            setLoading(true);
            try {
              await orderApi.requestPayment(invoiceId);
              if (onRefresh) await onRefresh();
              onClose();
              Alert.alert('Thành công', 'Đã chuyển trạng thái Đang Chờ Thanh Toán.');
            } catch (err) {
              console.error('Request payment error:', err);
              Alert.alert('Lỗi', 'Không thể gửi yêu cầu thanh toán. Vui lòng thử lại sau.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={!!table} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>{table.tenBan || 'Bàn không tên'}</Text>
            <Text style={[styles.sheetSubtitle, table.invoice?.trangThai === 'CHO_THANH_TOAN' && { color: '#FFD700' }, table.invoice?.trangThai === 'DA_THANH_TOAN' && { color: '#9810FA' }]}>
              {table.invoice?.trangThai === 'CHO_THANH_TOAN' ? 'Chờ Thanh Toán 🔔' : 
               table.invoice?.trangThai === 'DA_THANH_TOAN' ? 'Đã Thanh Toán' : 'Đang Phục Vụ'}
            </Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.occStatRow}>
          <View style={styles.occStatBox}>
            <Text style={styles.occStatLabel}>Giờ vào</Text>
            <Text style={styles.occStatValue}>
              {table.invoice?.thoiGianTao ? new Date(table.invoice.thoiGianTao).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 
               table.reservation?.thoiGianDat ? table.reservation.thoiGianDat.slice(11, 16) : '--:--'}
            </Text>
          </View>
          <View style={[styles.occStatBox, { marginLeft: 12 }]}>
            <Text style={styles.occStatLabel}>Thời gian ngồi</Text>
            <Text style={styles.occStatValue}>
              {(() => {
                const startTime = table.invoice?.thoiGianTao || table.reservation?.thoiGianDat;
                if (!startTime) return '0 phút';
                const diffMs = new Date() - new Date(startTime);
                const diffMins = Math.floor(diffMs / 60000);
                return `${Math.max(0, diffMins)} phút`;
              })()}
            </Text>
          </View>
        </View>

        {/* Total price card */}
        <LinearGradient
          colors={
            table.invoice?.trangThai === 'CHO_THANH_TOAN' ? ['rgba(255,215,0,0.25)', 'rgba(255,165,0,0.15)'] :
            table.invoice?.trangThai === 'DA_THANH_TOAN' ? ['rgba(152,16,250,0.2)', 'rgba(108,108,108,0.1)'] :
            ['rgba(255,68,68,0.15)', 'rgba(255,68,68,0.08)']
          }
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.occPriceCard, { borderColor: table.invoice?.trangThai === 'CHO_THANH_TOAN' ? '#FFD700' : 
                                                    table.invoice?.trangThai === 'DA_THANH_TOAN' ? '#9810FA' : 'rgba(255,68,68,0.3)' }]}>
          <Text style={styles.occPriceLabel}>Tổng tạm tính</Text>
          <Text style={[styles.occPriceValue, { color: table.invoice?.trangThai === 'CHO_THANH_TOAN' ? '#FFD700' : 
                                                      table.invoice?.trangThai === 'DA_THANH_TOAN' ? '#9810FA' : '#FF4444' }]}>
            {table.invoice?.tongThanhToan?.toLocaleString('vi-VN') || '0'}₫
          </Text>
          <Text style={styles.occGuestCount}>{table.reservation?.soLuongNguoi || table.invoice?.soLuongKhach || 0} khách</Text>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <Pressable
              style={[styles.occBtnGhost, { flex: 1, marginBottom: 0, borderColor: actionType === 'merge' ? '#8BA367' : 'rgba(255,255,255,0.15)' }]}
              onPress={() => setActionType(actionType === 'merge' ? null : 'merge')}>
              <Text style={[styles.occBtnGhostText, actionType === 'merge' && { color: '#8BA367' }]}>➕ Gộp thêm bàn</Text>
            </Pressable>
            <Pressable
              style={[styles.occBtnGhost, { flex: 1, marginBottom: 0, borderColor: actionType === 'change' ? '#FFD700' : 'rgba(255,255,255,0.15)' }]}
              onPress={() => setActionType(actionType === 'change' ? null : 'change')}>
              <Text style={[styles.occBtnGhostText, actionType === 'change' && { color: '#FFD700' }]}>🔄 Đổi bàn</Text>
            </Pressable>
          </View>

          {/* Sub-action: Table Selection */}
          {actionType && (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12, marginBottom: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8 }}>
                {actionType === 'merge' ? 'Chọn bàn trống để gộp:' : 'Chọn bàn trống để đổi sang:'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {emptyTables.length > 0 ? emptyTables.map(t => (
                  <Pressable
                    key={t.idBan}
                    onPress={() => actionType === 'merge' ? handleMerge(t.idBan) : handleChangeTable(t.idBan)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: actionType === 'merge' ? 'rgba(139,163,103,0.3)' : 'rgba(255,215,0,0.2)',
                      marginRight: 8, borderWidth: 1, borderColor: actionType === 'merge' ? '#8BA367' : '#FFD700'
                    }}>
                    <Text style={{ color: actionType === 'merge' ? '#8BA367' : '#FFD700', fontWeight: '600' }}>{t.tenBan}</Text>
                  </Pressable>
                )) : <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Không có bàn trống</Text>}
              </ScrollView>
            </View>
          )}

          <Pressable
            style={[styles.occBtnGhost, { backgroundColor: 'rgba(251,44,54,0.1)', borderColor: 'rgba(251,44,54,0.3)' }]}
            onPress={handleCancel}>
            <Text style={[styles.occBtnGhostText, { color: '#FFA2A2' }]}>⊗ Hủy phiếu đặt / trả bàn</Text>
          </Pressable>
        </View>

        {/* Footer Actions */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <LinearGradient colors={['#5a7a8a', '#3d5a6a']} style={[styles.confirmBtn, { flex: 1 }]}>
            <Pressable style={styles.confirmBtnInner} onPress={() => { onViewInvoice && onViewInvoice(table); onClose(); }}>
              <Text style={styles.confirmBtnText}>🧾 Hóa đơn</Text>
            </Pressable>
          </LinearGradient>
          <LinearGradient colors={['#8BA367', '#6B8E4E']} style={[styles.confirmBtn, { flex: 1 }]}>
            <Pressable style={styles.confirmBtnInner} onPress={() => { onOpenMenu && onOpenMenu([table], reservationId, false, table.invoice?.idHoaDon); onClose(); }}>
              <Text style={styles.confirmBtnText}>📋 Gọi món</Text>
            </Pressable>
          </LinearGradient>
        </View>

        <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.confirmBtn}>
          <Pressable 
            style={styles.confirmBtnInner} 
            onPress={handleRequestPayment}>
            <Text style={[styles.confirmBtnText, { color: '#1A1A1A', fontWeight: '700' }]}>💳 Yêu cầu thanh toán</Text>
          </Pressable>
        </LinearGradient>

        {loading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 32 }}>
            <ActivityIndicator size="large" color="#8BA367" />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default OccupiedTableSheet;
