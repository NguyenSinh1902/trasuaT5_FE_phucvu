import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator, Alert, useWindowDimensions, TextInput, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';
import orderApi from '../../../api/orderApi';

const TakeawayDetailSheet = ({ invoice, onClose, onRefresh, onOpenMenu }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedNote, setSelectedNote] = useState('');

  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

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
      setSelectedNote(opts.luuY || '');
    } catch (e) { }
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    setEditing(true);
    try {
      const oldOpts = JSON.parse(selectedItem.tuyChonJson || '{}');
      const newOpts = { ...oldOpts, luuY: selectedNote };
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
    <Modal visible={!!invoice} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={{ 
          width: isTablet ? '65%' : '92%', 
          backgroundColor: '#FFFFFF', 
          borderRadius: 28, 
          padding: isTablet ? 32 : 24, 
          maxHeight: '90%',
          shadowColor: '#000', shadowOffset: { width: 0, height: 25 }, shadowOpacity: 0.3, shadowRadius: 35, elevation: 30,
          overflow: 'hidden'
        }}>
          {/* TRANG TRÍ NỀN (Học hỏi từ EmptyTableSheet) */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
            <LinearGradient colors={['rgba(52, 211, 153, 0.1)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150 }} />
            <LinearGradient colors={['rgba(245, 158, 11, 0.05)', 'transparent']} start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }} style={{ position: 'absolute', bottom: -100, right: -100, width: 350, height: 350, borderRadius: 175 }} />
          </View>
          
          <Pressable style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', zIndex: 10 }} onPress={onClose}>
            <Text style={{ fontSize: 18, color: '#64748B', fontWeight: 'bold' }}>✕</Text>
          </Pressable>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: isTablet ? 36 : 26, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 }}>Đơn Mang Về #{invoice.idHoaDon}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 }}>
              <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: invoice.trangThai === 'CHO_THANH_TOAN' ? '#FEF3C7' : '#DCFCE7', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: invoice.trangThai === 'CHO_THANH_TOAN' ? '#B45309' : '#166534' }}>
                  {invoice.trangThai === 'CHO_THANH_TOAN' ? '🔔 Chờ thanh toán' : 
                   invoice.trangThai === 'DA_THANH_TOAN' ? '✅ Đã thanh toán' : '⏳ Đang xử lý'}
                </Text>
              </View>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' }} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#64748B' }}>👤 {invoice.tenKhachHang || 'Khách vãng lai'}</Text>
            </View>
          </View>

          {/* MAIN CONTENT AREA */}
          <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 24, flexShrink: 1 }}>
            
            {/* Left Side: Items List (SCROLLABLE) */}
            <View style={{ flex: isTablet ? 1.5 : 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#475569', marginBottom: 12, marginLeft: 4 }}>Danh sách món ăn</Text>
              <View style={{ flexShrink: 1, backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 8 }}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: isTablet ? 400 : 300 }}>
                  {invoice.danhSachChiTiet?.map((item, index) => (
                    <View key={item.idChiTiet || index} style={{ padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: index === invoice.danhSachChiTiet.length - 1 ? 0 : 8, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#1E293B', fontSize: 17, fontWeight: '800' }}>{item.tenSanPham}</Text>
                            <Pressable onPress={() => handleOpenEdit(item)} style={{ marginLeft: 10, padding: 6, backgroundColor: '#F1F5F9', borderRadius: 8 }}><Text style={{ fontSize: 14 }}>✏️</Text></Pressable>
                          </View>
                          <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '500', marginTop: 2 }}>{item.tenKichCo}</Text>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 4 }}>
                              <Pressable onPress={() => updateItemQuantity(item, -1)} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}><Text style={{ color: '#1E293B', fontWeight: 'bold', fontSize: 18 }}>−</Text></Pressable>
                              <Text style={{ color: '#1E293B', fontWeight: '900', width: 44, textAlign: 'center', fontSize: 18 }}>{item.soLuong}</Text>
                              <Pressable onPress={() => updateItemQuantity(item, 1)} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#34A853', alignItems: 'center', justifyContent: 'center', shadowColor: '#34A853', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}><Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>+</Text></Pressable>
                            </View>
                            <Pressable onPress={() => handleDeleteItem(item)} style={{ marginLeft: 20, padding: 10, backgroundColor: '#FEF2F2', borderRadius: 12 }}><Text style={{ fontSize: 20 }}>🗑️</Text></Pressable>
                          </View>
                        </View>
                        <Text style={{ color: '#059669', fontWeight: '900', fontSize: 18 }}>{item.thanhTien?.toLocaleString()}đ</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Right Side: Summary Card (FIXED) */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#475569', marginBottom: 12, marginLeft: 4 }}>Tổng quan đơn hàng</Text>
              <LinearGradient colors={['#F0FDFA', '#CCFBF1']} style={{ borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#5EEAD4', shadowColor: '#14B8A6', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 }}>
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ color: '#0D9488', fontSize: 15, fontWeight: '700' }}>Tổng cộng thanh toán</Text>
                  <Text style={{ color: '#0F766E', fontSize: 36, fontWeight: '900', marginTop: 6, letterSpacing: -1 }}>{invoice.tongThanhToan?.toLocaleString()}đ</Text>
                </View>
                <View style={{ height: 1.5, backgroundColor: 'rgba(15, 118, 110, 0.1)', marginBottom: 20 }} />
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#64748B', fontSize: 15, fontWeight: '600' }}>Số lượng món:</Text>
                    <Text style={{ color: '#1E293B', fontSize: 16, fontWeight: '800' }}>{invoice.danhSachChiTiet?.length || 0} món</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#64748B', fontSize: 15, fontWeight: '600' }}>Nhân viên phục vụ:</Text>
                    <Text style={{ color: '#1E293B', fontSize: 16, fontWeight: '800' }}>{invoice.tenNhanVien || '---'}</Text>
                  </View>
                </View>
              </LinearGradient>
              
              {/* Trang trí thêm: Tip hoặc info */}
              <View style={{ marginTop: 16, padding: 16, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 20 }}>💡</Text>
                <Text style={{ fontSize: 13, color: '#64748B', flex: 1, fontWeight: '500' }}>Kiểm tra kỹ các món và ghi chú trước khi gửi yêu cầu thanh toán.</Text>
              </View>
            </View>

          </View>

          {/* ACTION FOOTER (FIXED) */}
          <View style={{ marginTop: 28, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable style={{ flex: 1, height: 65, borderRadius: 18, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FEE2E2', shadowColor: '#EF4444', shadowOpacity: 0.05, shadowRadius: 5 }} onPress={handleCancel}>
                <Text style={{ color: '#DC2626', fontWeight: '900', fontSize: 17 }}>⊗ Hủy đơn hàng</Text>
              </Pressable>
              
              <LinearGradient colors={['#34D399', '#059669']} style={{ flex: 1, borderRadius: 18, shadowColor: '#059669', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
                <Pressable style={{ height: 65, justifyContent: 'center', alignItems: 'center' }} onPress={() => { onOpenMenu && onOpenMenu([], null, true, invoice.idHoaDon); onClose(); }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 17 }}>➕ Thêm món vào đơn</Text>
                </Pressable>
              </LinearGradient>
            </View>

            {invoice.trangThai !== 'CHO_THANH_TOAN' && invoice.trangThai !== 'DA_THANH_TOAN' && (
              <LinearGradient colors={['#FCD34D', '#F59E0B']} style={{ borderRadius: 18, shadowColor: '#F59E0B', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }}>
                <Pressable style={{ height: 65, justifyContent: 'center', alignItems: 'center' }} onPress={handleRequestPayment}>
                  <Text style={{ color: '#92400E', fontWeight: '900', fontSize: 18 }}>💳 Gửi yêu cầu thanh toán ngay</Text>
                </Pressable>
              </LinearGradient>
            )}
          </View>

        </View>

        {/* Edit Modal (Nested) */}
        <Modal visible={isEditModalVisible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: isTablet ? 450 : '85%', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20 }}>
              <Text style={{ color: '#1E293B', fontSize: 20, fontWeight: '900', marginBottom: 20 }}>Ghi chú cho: {selectedItem?.tenSanPham}</Text>
              <TextInput 
                style={{ backgroundColor: '#F1F5F9', color: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 24, height: 100, textAlignVertical: 'top', fontSize: 16 }} 
                placeholder="Ví dụ: Không hành, nhiều đá..." 
                placeholderTextColor="#94A3B8" 
                value={selectedNote} 
                onChangeText={setSelectedNote}
                multiline
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable onPress={() => setIsEditModalVisible(false)} style={{ flex: 1, height: 50, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#64748B', fontWeight: '700' }}>Hủy</Text></Pressable>
                <Pressable onPress={handleSaveEdit} style={{ flex: 2, height: 50, backgroundColor: '#34A853', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontWeight: '900' }}>Lưu ghi chú</Text></Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {(loading || editing) && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <ActivityIndicator size="large" color="#34A853" />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default TakeawayDetailSheet;
