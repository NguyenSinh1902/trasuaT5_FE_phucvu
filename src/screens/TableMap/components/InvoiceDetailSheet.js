import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator, Alert, Dimensions, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';
import orderApi from '../../../api/orderApi';
import productApi from '../../../api/productApi';

const { width, height } = Dimensions.get('window');

const ICE_LEVELS = ['Không đá', 'Ít đá', 'Mặc định', 'Nhiều đá'];
const SUGAR_LEVELS = ['0%', '50%', '70%', '100%'];

const InvoiceDetailSheet = ({ table, onClose, onRefresh, onOpenMenu }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [allToppings, setAllToppings] = useState([]);

  // Edit item state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedIce, setSelectedIce] = useState('Mặc định');
  const [selectedSugar, setSelectedSugar] = useState('50%');
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedToppings, setSelectedToppings] = useState([]);

  useEffect(() => {
    if (table) fetchInvoice();
    else setInvoice(null);
  }, [table]);

  const fetchInvoice = async () => {
    const idPhieuDat = table?.reservation?.idPhieuDat;
    if (!idPhieuDat) return;
    setLoading(true);
    try {
      const allRes = await orderApi.getAll();
      const allInvoices = Array.isArray(allRes) ? allRes : (allRes.data || []);
      const active = allInvoices.find(inv =>
        inv.idPhieuDat === idPhieuDat &&
        inv.trangThai !== 'DA_THANH_TOAN' &&
        inv.trangThai !== 'DA_HUY'
      );
      if (!active) { setInvoice(null); return; }
      const detailRes = await orderApi.getById(active.idHoaDon);
      setInvoice(detailRes.data || detailRes);
    } catch (err) {
      console.error('Fetch invoice error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    try {
      const opts = JSON.parse(item.tuyChonJson || '{}');
      setSelectedIce(opts.da || 'Mặc định');
      setSelectedSugar(opts.duong || '50%');
      setSelectedNote(opts.luuY || '');
    } catch (e) {
      setSelectedIce('Mặc định'); setSelectedSugar('50%'); setSelectedNote('');
    }
    const currentTops = (item.danhSachTopping || []).map(t => t.idTopping || t.idBienTheTopping);
    setSelectedToppings(currentTops.filter(id => id != null));
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem || !invoice) return;
    setEditing(true);
    try {
      const newOpts = { da: selectedIce, duong: selectedSugar, luuY: selectedNote };
      const itemId = selectedItem.idChiTiet || selectedItem.idChiTietHoaDon;
      await orderApi.editItemInInvoice(invoice.idHoaDon, itemId, {
        soLuong: selectedItem.soLuong,
        tuyChonJson: JSON.stringify(newOpts)
      });
      await fetchInvoice();
      if (onRefresh) onRefresh();
      setIsEditModalVisible(false);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật món ăn.');
    } finally {
      setEditing(false);
    }
  };

  const updateItemQuantity = async (item, delta) => {
    const newQty = item.soLuong + delta;
    if (newQty < 1) { handleDeleteItem(item); return; }
    setLoading(true);
    try {
      const itemId = item.idChiTiet || item.idChiTietHoaDon;
      await orderApi.editItemInInvoice(invoice.idHoaDon, itemId, { soLuong: newQty, tuyChonJson: item.tuyChonJson });
      await fetchInvoice();
      if (onRefresh) onRefresh();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (item) => {
    Alert.alert('Xóa món', `Xóa ${item.tenSanPham}?`, [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          const itemId = item.idChiTiet || item.idChiTietHoaDon;
          await orderApi.deleteItemFromInvoice(invoice.idHoaDon, itemId);
          await fetchInvoice();
          if (onRefresh) onRefresh();
        } catch (err) { Alert.alert('Lỗi', 'Không thể xóa.'); }
        finally { setLoading(false); }
      }}
    ]);
  };

  const handleRequestPayment = async () => {
    if (!invoice?.idHoaDon) return;
    Alert.alert('Thanh toán', 'Gửi yêu cầu thanh toán?', [
      { text: 'Bỏ qua' },
      { text: 'Xác nhận', onPress: async () => {
        setLoading(true);
        try {
          await orderApi.requestPayment(invoice.idHoaDon);
          await fetchInvoice();
          if (onRefresh) onRefresh();
          Alert.alert('Thành công', 'Đã gửi yêu cầu.');
        } catch (err) { Alert.alert('Lỗi', 'Không thể gửi yêu cầu.'); }
        finally { setLoading(false); }
      }}
    ]);
  };

  if (!table) return null;

  return (
    <Modal visible={!!table} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheetContainer, { height: '85%' }]}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>Hóa Đơn {table.tenBan}</Text>
            <Text style={styles.sheetSubtitle}>
               {invoice?.trangThai === 'CHO_THANH_TOAN' ? '🔔 Chờ thanh toán' : 
                invoice?.trangThai === 'DA_THANH_TOAN' ? '✅ Đã thanh toán' : 
                invoice?.trangThai === 'CHO_XAC_NHAN' ? '⏳ Chờ xác nhận' : '✅ Đang phục vụ'}
            </Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}><Text style={styles.sheetCloseBtnText}>✕</Text></Pressable>
        </View>

        {loading && !invoice ? <ActivityIndicator size="large" color="#8BA367" style={{ marginTop: 40 }} /> : invoice ? (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 10 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
              {invoice.danhSachChiTiet?.map((item, index) => (
                <View key={item.idChiTiet || index} style={{ marginBottom: 16, borderBottomWidth: index === invoice.danhSachChiTiet.length-1?0:1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{item.tenSanPham}</Text>
                        <Pressable onPress={() => handleOpenEdit(item)} style={{ marginLeft: 8 }}><Text>✏️</Text></Pressable>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <Pressable onPress={() => updateItemQuantity(item, -1)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff' }}>-</Text></Pressable>
                        <Text style={{ color: '#fff', marginHorizontal: 15 }}>{item.soLuong}</Text>
                        <Pressable onPress={() => updateItemQuantity(item, 1)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff' }}>+</Text></Pressable>
                        <Pressable onPress={() => handleDeleteItem(item)} style={{ marginLeft: 20 }}><Text>🗑️</Text></Pressable>
                      </View>
                    </View>
                    <Text style={{ color: '#8BA367', fontWeight: '700' }}>{item.thanhTien?.toLocaleString()}đ</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}><Text style={{ color: '#aaa' }}>Tạm tính</Text><Text style={{ color: '#fff' }}>{invoice.tongTienHang?.toLocaleString()}đ</Text></View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}><Text style={{ color: '#aaa' }}>Thuế</Text><Text style={{ color: '#fff' }}>{invoice.tongTienThue?.toLocaleString()}đ</Text></View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>TỔNG CỘNG</Text><Text style={{ color: '#FFD700', fontSize: 20, fontWeight: 'bold' }}>{invoice.tongThanhToan?.toLocaleString()}đ</Text></View>
              
              {invoice.trangThai !== 'DA_THANH_TOAN' && (
                <View style={{ marginTop: 20, gap: 10 }}>
                  <LinearGradient colors={['#8BA367', '#6B8E4E']} style={styles.confirmBtn}>
                    <Pressable style={styles.confirmBtnInner} onPress={() => { onOpenMenu([table]); onClose(); }}><Text style={styles.confirmBtnText}>➕ Thêm món</Text></Pressable>
                  </LinearGradient>
                  {invoice.trangThai !== 'CHO_THANH_TOAN' && (
                    <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.confirmBtn}>
                      <Pressable style={styles.confirmBtnInner} onPress={handleRequestPayment}><Text style={[styles.confirmBtnText, { color: '#000' }]}>💳 Yêu cầu thanh toán</Text></Pressable>
                    </LinearGradient>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        ) : null}

        {/* Edit Modal */}
        <Modal visible={isEditModalVisible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '90%', backgroundColor: '#1A1A1A', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Chỉnh sửa: {selectedItem?.tenSanPham}</Text>
              
              <Text style={{ color: '#aaa', marginBottom: 10 }}>Đá:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                {ICE_LEVELS.map(level => (
                  <Pressable key={level} onPress={() => setSelectedIce(level)} style={{ padding: 10, borderRadius: 10, backgroundColor: selectedIce===level?'#8BA367':'#333' }}><Text style={{ color: '#fff' }}>{level}</Text></Pressable>
                ))}
              </View>

              <Text style={{ color: '#aaa', marginBottom: 10 }}>Đường:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                {SUGAR_LEVELS.map(level => (
                  <Pressable key={level} onPress={() => setSelectedSugar(level)} style={{ padding: 10, borderRadius: 10, backgroundColor: selectedSugar===level?'#8BA367':'#333' }}><Text style={{ color: '#fff' }}>{level}</Text></Pressable>
                ))}
              </View>

              <TextInput 
                style={{ backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 20 }} 
                placeholder="Ghi chú..." placeholderTextColor="#555" 
                value={selectedNote} onChangeText={setSelectedNote}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable onPress={() => setIsEditModalVisible(false)} style={{ flex: 1, padding: 15, backgroundColor: '#444', borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#fff' }}>Hủy</Text></Pressable>
                <Pressable onPress={handleSaveEdit} style={{ flex: 2, padding: 15, backgroundColor: '#8BA367', borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu thay đổi</Text></Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

export default InvoiceDetailSheet;
