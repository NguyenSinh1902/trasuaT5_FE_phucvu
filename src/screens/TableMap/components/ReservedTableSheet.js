import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';
import reservationApi from '../../../api/reservationApi';

const ReservedTableSheet = ({ table, onClose, onEdit, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  if (!table) return null;

  const handleCheckIn = async () => {
    const resId = table.reservation?.idPhieuDat;
    if (!resId) return;

    setLoading(true);
    try {
      await reservationApi.checkIn(resId);
      if (onRefresh) await onRefresh();
      onClose();
    } catch (err) {
      console.error('Check-in failed:', err);
      Alert.alert('Lỗi', 'Không thể check-in bàn này. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const resId = table.reservation?.idPhieuDat;
    if (!resId) return;

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn hủy đặt bàn này?',
      [
        { text: 'Bỏ qua', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await reservationApi.cancelReservation(resId);
              if (onRefresh) await onRefresh();
              onClose();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể hủy đặt bàn.');
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
      <View style={[styles.sheetContainer, { borderTopColor: 'rgba(255,215,0,0.3)' }]}>
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>{table.tenBan || 'Bàn không tên'}</Text>
            <Text style={[styles.sheetSubtitle, { color: '#FFD700' }]}>Phiếu đặt bàn</Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Reservation info card */}
        <LinearGradient
          colors={['rgba(255,215,0,0.2)', 'rgba(255,165,0,0.1)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.resCard}>

          {/* Appointment time */}
          <Text style={styles.resTimeLabel}>Giờ hẹn đến</Text>
          <Text style={styles.resTimeValue}>
            {table.reservation?.thoiGianDat ? table.reservation.thoiGianDat.slice(11, 16) : '--:--'}
          </Text>

          {/* Divider */}
          <View style={styles.resDivider} />

          {/* Customer info */}
          <View style={styles.resInfoRow}>
            <Text style={styles.resInfoKey}>Tên khách</Text>
            <Text style={styles.resInfoValue}>{table.reservation?.tenKhachHang || '---'}</Text>
          </View>
          <View style={[styles.resInfoRow, { marginTop: 8 }]}>
            <Text style={styles.resInfoKey}>Số điện thoại</Text>
            <Text style={styles.resInfoValue}>{table.reservation?.sdtKhachHang || '---'}</Text>
          </View>
        </LinearGradient>

        {/* Check-in button */}
        <LinearGradient colors={['#8BA367', '#6B8E4E']} style={[styles.confirmBtn, { marginBottom: 12 }]}>
          <Pressable style={styles.confirmBtnInner} onPress={handleCheckIn}>
            <Text style={styles.confirmBtnText}>→ Check-in & Mở bàn</Text>
          </Pressable>
        </LinearGradient>

        {/* Sửa / Hủy đặt row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable style={[styles.occBtnGhost, { flex: 1, marginBottom: 0 }]} onPress={onEdit}>
            <Text style={styles.occBtnGhostText}>✏️ Sửa</Text>
          </Pressable>
          <Pressable
            style={[styles.occBtnGhost, { flex: 1, marginBottom: 0, backgroundColor: 'rgba(251,44,54,0.15)', borderColor: 'rgba(251,44,54,0.3)' }]}
            onPress={handleCancel}>
            <Text style={[styles.occBtnGhostText, { color: '#FFA2A2' }]}>⊗ Hủy đặt</Text>
          </Pressable>
        </View>

        {loading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 32 }}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ReservedTableSheet;
