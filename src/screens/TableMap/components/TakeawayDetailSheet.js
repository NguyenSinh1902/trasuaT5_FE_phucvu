import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator, Alert, Dimensions, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';
import orderApi from '../../../api/orderApi';
import productApi from '../../../api/productApi';

const { width } = Dimensions.get('window');
const sw = (size) => (width / 412) * size;

const ICE_LEVELS = ['Không đá', 'Ít đá', 'Mặc định', 'Nhiều đá'];
const SUGAR_LEVELS = ['0%', '50%', '70%', '100%'];

const TakeawayDetailSheet = ({ invoice, onClose, onRefresh, onOpenMenu }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIce, setSelectedIce] = useState('Mặc định');
  const [selectedSugar, setSelectedSugar] = useState('50%');
  const [selectedNote, setSelectedNote] = useState('');

  if (!invoice) return null;

  const handleCancel = () => {
    Alert.alert('Xác nhận hủy', `Hủy đơn mang về (Hóa đơn ${invoice.idHoaDon})?`, [
      { text: 'Bỏ qua', style: 'cancel' },
      { text: 'Đồng ý', style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          await orderApi.cancelOrder(invoice.idHoaDon);
          if (onRefresh) await onRefresh();
          onClose();
        } catch (err) {
          Alert.alert('Lỗi', 'Không thể hủy đơn hàng.');
        } finally { setLoading(false); }
      }}
    ]);
  };

  const handleRequestPayment = async () => {
    setLoading(true);
    try {
      await orderApi.requestPayment(invoice.idHoaDon);
      if (onRefresh) await onRefresh();
      onClose();
      Alert.alert('Thành công', 'Đã gửi yêu cầu thanh toán.');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu thanh toán.');
    } finally { setLoading(false); }
  };

  const updateItemQuantity = async (item, delta) => {
    const newQty = item.soLuong + delta;
    if (newQty < 1) { handleDeleteItem(item); return; }
    setEditing(true);
    try {
      const itemId = item.idChiTiet || item.idChiTietHoaDon;
      await orderApi.editItemInInvoice(invoice.idHoaDon, itemId, { soLuong: newQty, tuyChonJson: item.tuyChonJson });
      if (onRefresh) await onRefresh();
    } catch (err) { Alert.alert('Lỗi', 'Không thể cập nhật số lượng.'); }
    finally { setEditing(false); }
  };

  const handleDeleteItem = (item) => {
    Alert.alert('Xóa món', `Xóa ${item.tenSanPham}?`, [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        setEditing(true);
        try {
          const itemId = item.idChiTiet || item.idChiTietHoaDon;
          await orderApi.deleteItemFromInvoice(invoice.idHoaDon, itemId);
          if (onRefresh) await onRefresh();
        } catch (err) { Alert.alert('Lỗi', 'Không thể xóa món.'); }
        finally { setEditing(false); }
      }}
    ]);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    try {
      const opts = JSON.parse(item.tuyChonJson || '{}');
      setSelectedIce(opts.da || 'Mặc định');
      setSelectedSugar(opts.duong || '50%');
      setSelectedNote(opts.luuY || '');
    } catch (e) { }
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    setEditing(true);
    try {
      const newOpts = { da: selectedIce, duong: selectedSugar, luuY: selectedNote };
      const itemId = selectedItem.idChiTiet || selectedItem.idChiTietHoaDon;
      await orderApi.editItemInInvoice(invoice.idHoaDon, itemId, {
        soLuong: selectedItem.soLuong,
        tuyChonJson: JSON.stringify(newOpts)
      });
      if (onRefresh) await onRefresh();
      setIsEditModalVisible(false);
    } catch (err) { Alert.alert('Lỗi', 'Không thể lưu.'); }
    finally { setEditing(false); }
  };

  return (
    <Modal visible={!!invoice} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={[styles.sheetContainer, { flexShrink: 1 }]}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>Đơn Mang Về {invoice.idHoaDon}</Text>
            <Text style={[styles.sheetSubtitle, { color: invoice.trangThai === 'CHO_THANH_TOAN' ? '#FFD700' : '#8BA367' }]}>
               {invoice.trangThai === 'CHO_THANH_TOAN' ? '🔔 Chờ thanh toán' : 
                invoice.trangThai === 'DA_THANH_TOAN' ? '✅ Đã thanh toán' : '⏳ Đang xử lý'}
            </Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}><Text style={styles.sheetCloseBtnText}>✕</Text></Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 10 }}>
            {/* Summary Card */}
            <LinearGradient colors={['rgba(255,165,0,0.15)', 'rgba(255,140,0,0.05)']} style={styles.occPriceCard}>
                <Text style={styles.occPriceLabel}>Tổng thanh toán</Text>
                <Text style={[styles.occPriceValue, { color: '#FFA500' }]}>{invoice.tongThanhToan?.toLocaleString()}₫</Text>
                <Text style={styles.occGuestCount}>Khách: {invoice.tenKhachHang || 'Vãng lai'}</Text>
            </LinearGradient>

            {/* Items */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16 }}>
                {invoice.danhSachChiTiet?.map((item, index) => (
                    <View key={item.idChiTiet || index} style={{ marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{item.tenSanPham}</Text>
                                    <Pressable onPress={() => handleOpenEdit(item)} style={{ marginLeft: 8 }}><Text>✏️</Text></Pressable>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                    <Pressable onPress={() => updateItemQuantity(item, -1)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff' }}>-</Text></Pressable>
                                    <Text style={{ color: '#fff', marginHorizontal: 15 }}>{item.soLuong}</Text>
                                    <Pressable onPress={() => updateItemQuantity(item, 1)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff' }}>+</Text></Pressable>
                                    <Pressable onPress={() => handleDeleteItem(item)} style={{ marginLeft: 20 }}><Text>🗑️</Text></Pressable>
                                </View>
                            </View>
                            <Text style={{ color: '#8BA367', fontWeight: 'bold' }}>{item.thanhTien?.toLocaleString()}đ</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>

        <View style={{ gap: 10, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable style={[styles.occBtnGhost, { flex: 1, marginBottom: 0 }]} onPress={handleCancel}><Text style={{ color: '#FFA2A2' }}>⊗ Hủy đơn</Text></Pressable>
            <LinearGradient colors={['#8BA367', '#6B8E4E']} style={[styles.confirmBtn, { flex: 1 }]}><Pressable style={styles.confirmBtnInner} onPress={() => { onOpenMenu && onOpenMenu([], null, true, invoice.idHoaDon); onClose(); }}><Text style={styles.confirmBtnText}>➕ Thêm món</Text></Pressable></LinearGradient>
          </View>
          {invoice.trangThai !== 'CHO_THANH_TOAN' && invoice.trangThai !== 'DA_THANH_TOAN' && (
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.confirmBtn}>
                <Pressable style={styles.confirmBtnInner} onPress={handleRequestPayment}><Text style={{ color: '#000', fontWeight: 'bold' }}>💳 Yêu cầu thanh toán</Text></Pressable>
            </LinearGradient>
          )}
        </View>

        {/* Edit Modal */}
        <Modal visible={isEditModalVisible} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '90%', backgroundColor: '#1A1A1A', padding: 20, borderRadius: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Sửa: {selectedItem?.tenSanPham}</Text>
                    <TextInput style={{ backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 20 }} placeholder="Ghi chú..." placeholderTextColor="#555" value={selectedNote} onChangeText={setSelectedNote} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable onPress={() => setIsEditModalVisible(false)} style={{ flex: 1, padding: 15, backgroundColor: '#444', borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#fff' }}>Hủy</Text></Pressable>
                        <Pressable onPress={handleSaveEdit} style={{ flex: 2, padding: 15, backgroundColor: '#8BA367', borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text></Pressable>
                    </View>
                </View>
            </View>
        </Modal>

        {(loading || editing) && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#FFD700" /></View>}
        </View>
      </View>
    </Modal>
  );
};

export default TakeawayDetailSheet;
