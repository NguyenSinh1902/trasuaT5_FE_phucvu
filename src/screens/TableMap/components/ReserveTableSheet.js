import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';
import reservationApi from '../../../api/reservationApi';

const ReserveTableSheet = ({ table, onClose, onRefresh }) => {
  const [custName, setCustName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('');
  const [guestCount, setGuestCount] = useState('2');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!table) return null;

  const handleConfirm = async () => {
    if (!custName || !phone || !time) {
      Alert.alert('Thiếu thông line', 'Vui lòng nhập tên, SĐT và giờ hẹn.');
      return;
    }

    setLoading(true);
    try {
      // Format YYYY-MM-DDTHH:mm:00 (Local Date)
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localDate = new Date(now - offset).toISOString().split('T')[0];
      const thoiGianDat = `${localDate}T${time.length === 5 ? time : '00:00'}:00`;

      const payload = {
        tenKhachHang: custName,
        sdtKhachHang: phone,
        thoiGianDat: thoiGianDat,
        soLuongNguoi: parseInt(guestCount, 10),
        ghiChu: note,
        danhSachIdBan: [table.idBan]
      };

      await reservationApi.createReservation(payload);
      if (onRefresh) await onRefresh();
      Alert.alert('Thành công', `Đã đặt bàn ${table.tenBan || table.name} lúc ${time}`);
      onClose();
    } catch (err) {
      console.error('Reserve failed:', err);
      Alert.alert('Lỗi', 'Không thể đặt bàn. Vui lòng kiểm tra lại thời gian.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={!!table} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>Đặt bàn trước</Text>
            <Text style={styles.sheetSubtitle}>{table.tenBan || table.name}</Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
          {/* Form fields */}
          <View style={styles.reserveFormField}>
            <Text style={styles.reserveFieldLabel}>Tên khách hàng</Text>
            <View style={styles.reserveInputWrap}>
              <Text style={styles.reserveInputIcon}>👤</Text>
              <TextInput
                style={styles.reserveInput}
                placeholder="Nhập tên khách"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={custName}
                onChangeText={setCustName}
              />
            </View>
          </View>

          <View style={styles.reserveFormField}>
            <Text style={styles.reserveFieldLabel}>Số điện thoại</Text>
            <View style={styles.reserveInputWrap}>
              <Text style={styles.reserveInputIcon}>📞</Text>
              <TextInput
                style={styles.reserveInput}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="rgba(255,255,255,0.35)"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.reserveFormField, { flex: 1 }]}>
              <Text style={styles.reserveFieldLabel}>Giờ hẹn đến</Text>
              <View style={styles.reserveInputWrap}>
                <Text style={styles.reserveInputIcon}>🕐</Text>
                <TextInput
                  style={styles.reserveInput}
                  placeholder="VD: 19:30"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>
            <View style={[styles.reserveFormField, { flex: 1 }]}>
              <Text style={styles.reserveFieldLabel}>Số người</Text>
              <View style={styles.reserveInputWrap}>
                <Text style={styles.reserveInputIcon}>👥</Text>
                <TextInput
                  style={styles.reserveInput}
                  placeholder="2"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="numeric"
                  value={guestCount}
                  onChangeText={setGuestCount}
                />
              </View>
            </View>
          </View>

          <View style={styles.reserveFormField}>
            <Text style={styles.reserveFieldLabel}>Ghi chú</Text>
            <View style={styles.reserveInputWrap}>
              <Text style={styles.reserveInputIcon}>📝</Text>
              <TextInput
                style={styles.reserveInput}
                placeholder="Ví dụ: Gộp bàn, ít đá..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>
        </ScrollView>

        <LinearGradient colors={['#FFD700', '#FFA500']} style={[styles.confirmBtn, { marginTop: 12 }]}>
          <Pressable style={styles.confirmBtnInner} onPress={handleConfirm}>
            <Text style={[styles.confirmBtnText, { color: '#1A1A1A' }]}>Xác nhận đặt bàn</Text>
          </Pressable>
        </LinearGradient>

        {loading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 32 }}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ReserveTableSheet;
