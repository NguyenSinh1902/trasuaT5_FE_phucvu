import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';
import orderApi from '../../../api/orderApi';

const { width } = Dimensions.get('window');

const InvoiceDetailSheet = ({ table, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (table) {
      fetchInvoice();
    } else {
      setInvoice(null);
    }
  }, [table]);

  const fetchInvoice = async () => {
    const idPhieuDat = table?.reservation?.idPhieuDat;
    if (!idPhieuDat) {
      Alert.alert('Lỗi', 'Bàn này chưa có phiếu đặt.');
      onClose();
      return;
    }

    setLoading(true);
    try {
      // 1. Find active invoice ID for this reservation
      const allRes = await orderApi.getAll();
      const allInvoices = Array.isArray(allRes) ? allRes : (allRes.data || []);
      const active = allInvoices.find(inv => 
        inv.idPhieuDat === idPhieuDat && 
        inv.trangThai !== 'DA_THANH_TOAN' && 
        inv.trangThai !== 'DA_HUY'
      );

      if (!active) {
        Alert.alert('Thông báo', 'Bàn này chưa gọi món (chưa có hóa đơn).');
        onClose();
        return;
      }

      // 2. Fetch full invoice details
      const detailRes = await orderApi.getById(active.idHoaDon);
      const detail = detailRes.data || detailRes;
      setInvoice(detail);
    } catch (err) {
      console.error('Invoice fetch error:', err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết hóa đơn.');
      onClose();
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.sheetSubtitle}>{invoice?.trangThai === 'CHO_XAC_NHAN' ? 'Chờ xác nhận' : (invoice?.trangThai || '---')}</Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8BA367" />
          </View>
        ) : invoice ? (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 10 }}>
            {/* Items List */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
              {invoice.danhSachChiTiet?.map((item, index) => {
                let options = '';
                try {
                  const opts = JSON.parse(item.tuyChonJson || '{}');
                  options = [opts.da, opts.duong, opts.luuY].filter(Boolean).join(', ');
                } catch (e) {}

                return (
                  <View key={item.idChiTiet || index} style={{ marginBottom: 16, borderBottomWidth: index === invoice.danhSachChiTiet.length - 1 ? 0 : 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: index === invoice.danhSachChiTiet.length - 1 ? 0 : 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 }}>{item.soLuong}x {item.tenSanPham}</Text>
                      <Text style={{ color: '#8BA367', fontSize: 16, fontWeight: '600' }}>{item.thanhTien?.toLocaleString('vi-VN')}đ</Text>
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 4 }}>Size: {item.tenKichCo}</Text>
                    {options ? <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 4 }}>Tùy chọn: {options}</Text> : null}
                    
                    {item.danhSachTopping?.length > 0 && (
                      <View style={{ marginTop: 4, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.1)' }}>
                        {item.danhSachTopping.map((top, idx) => (
                          <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>+ {top.tenTopping}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{top.giaTopping?.toLocaleString('vi-VN')}đ</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Summary breakdown */}
            <View style={{ gap: 12, marginBottom: 30, paddingHorizontal: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>Tổng tiền hàng:</Text>
                <Text style={{ color: '#fff', fontSize: 15 }}>{invoice.tongTienHang?.toLocaleString('vi-VN') || 0}đ</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>Thuế ({(invoice.thueSuat * 100).toFixed(0)}%):</Text>
                <Text style={{ color: '#fff', fontSize: 15 }}>{invoice.tongTienThue?.toLocaleString('vi-VN') || 0}đ</Text>
              </View>
              {invoice.giamGiaKhuyenMai > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#FFD700', fontSize: 15 }}>Giảm giá KM:</Text>
                  <Text style={{ color: '#FFD700', fontSize: 15 }}>-{invoice.giamGiaKhuyenMai?.toLocaleString('vi-VN')}đ</Text>
                </View>
              )}
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>TỔNG THANH TOÁN:</Text>
                <Text style={{ color: '#8BA367', fontSize: 22, fontWeight: '700' }}>{invoice.tongThanhToan?.toLocaleString('vi-VN') || 0}đ</Text>
              </View>
            </View>
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
};

export default InvoiceDetailSheet;
