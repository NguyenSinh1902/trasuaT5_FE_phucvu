import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, Pressable, TextInput, ScrollView,
  ActivityIndicator, Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';
import reservationApi from '../../../api/reservationApi';

const EmptyTableSheet = ({ table, tables, onClose, onReserve, onOpenMenu, onRefresh }) => {
  const [customerName, setCustomerName] = useState('Khách vãng lai');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [note, setNote] = useState('');
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (table) {
      setCustomerName(`Khách vãng lai ${table.tenBan}`);
      setSelectedTables([table.idBan]);
      setGuestCount(table.sucChua || 2);
    }
  }, [table]);

  if (!table) return null;

  const emptyTables = (tables || []).filter(t => t.tinhTrangBan === 'TRONG' && t.idBan !== table.idBan);

  const toggleTable = (id) => {
    setSelectedTables(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      let now = new Date();
      now.setMinutes(now.getMinutes() + 1); // Add 1 minute buffer
      
      // Manual Local ISO String (YYYY-MM-DDTHH:mm:ss) with proper Offset
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 19);
      
      const payload = {
        tenKhachHang: customerName,
        sdtKhachHang: phoneNumber || '0000000000',
        thoiGianDat: localISOTime,
        soLuongNguoi: guestCount,
        ghiChu: note,
        danhSachIdBan: selectedTables,
      };

      const res = await reservationApi.createReservation(payload);
      const newReservationId = res?.idPhieuDat || res?.data?.idPhieuDat || res?.result?.idPhieuDat || res?.data?.result?.idPhieuDat;
      if (onRefresh) await onRefresh();

      const fullSelectedObjects = (tables || []).filter(t => selectedTables.includes(t.idBan));
      onOpenMenu && onOpenMenu(fullSelectedObjects, newReservationId);
      onClose();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể mở bàn. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={!!table} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheetContainer, { height: '85%' }]}>
        <View style={styles.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sheetHeaderRow}>
            <View>
              <Text style={styles.sheetTitle}>{table.tenBan}</Text>
              <Text style={styles.sheetSubtitle}>Mở bàn & Đặt món</Text>
            </View>
            <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
              <Text style={styles.sheetCloseBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.reserveFormField}>
            <Text style={styles.reserveFieldLabel}>Tên khách hàng</Text>
            <View style={styles.reserveInputWrap}>
              <Text style={styles.reserveInputIcon}>👤</Text>
              <TextInput
                style={styles.reserveInput}
                placeholder="Nhập tên khách..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>
          </View>

          <View style={styles.reserveFormField}>
            <Text style={styles.reserveFieldLabel}>Số điện thoại</Text>
            <View style={styles.reserveInputWrap}>
              <Text style={styles.reserveInputIcon}>📞</Text>
              <TextInput
                style={styles.reserveInput}
                placeholder="Nhập số điện thoại..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          </View>

          <View style={styles.reserveFormField}>
            <Text style={styles.reserveFieldLabel}>Gộp thêm bàn (Nếu có)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              {emptyTables.map(t => (
                <Pressable
                  key={t.idBan}
                  onPress={() => toggleTable(t.idBan)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: selectedTables.includes(t.idBan) ? '#8BA367' : 'rgba(255,255,255,0.2)',
                    backgroundColor: selectedTables.includes(t.idBan) ? 'rgba(139,163,103,0.3)' : 'transparent',
                    marginRight: 8,
                  }}>
                  <Text style={{ color: selectedTables.includes(t.idBan) ? '#8BA367' : 'rgba(255,255,255,0.6)' }}>
                    {t.tenBan}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sheetCard}>
            <Text style={styles.sheetGuestLabel}>Tổng số lượng khách</Text>
            <View style={styles.sheetStepper}>
              <Pressable style={styles.stepperBtn} onPress={() => setGuestCount(Math.max(1, guestCount - 1))}>
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>
              <Text style={styles.stepperValue}>{guestCount}</Text>
              <Pressable style={styles.stepperBtn} onPress={() => setGuestCount(guestCount + 1)}>
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.reserveFormField}>
            <Text style={styles.reserveFieldLabel}>Ghi chú</Text>
            <View style={[styles.reserveInputWrap, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
              <TextInput
                style={[styles.reserveInput, { textAlignVertical: 'top' }]}
                placeholder="Khách đi đông, gộp bàn..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                numberOfLines={4}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>

          <LinearGradient colors={['#8BA367', '#6B8E4E']} style={[styles.confirmBtn, { marginTop: 10 }]}>
            <Pressable style={styles.confirmBtnInner} onPress={handleConfirm} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.confirmBtnText}>Xác nhận & Đặt món</Text>}
            </Pressable>
          </LinearGradient>

          <Pressable style={[styles.reserveBtn, { marginTop: 15 }]} onPress={onReserve}>
            <Text style={styles.reserveBtnIcon}>📅</Text>
            <Text style={styles.reserveBtnText}>Đặt bàn trước</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default EmptyTableSheet;
