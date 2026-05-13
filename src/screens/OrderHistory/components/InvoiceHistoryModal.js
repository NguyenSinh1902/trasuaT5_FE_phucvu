import React, { useState, useEffect } from 'react';
import { 
  View, Text, Modal, Pressable, ScrollView, 
  ActivityIndicator, useWindowDimensions, StyleSheet 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import orderApi from '../../../api/orderApi';

const InvoiceHistoryModal = ({ isVisible, invoiceId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  useEffect(() => {
    if (isVisible && invoiceId) {
      fetchInvoiceDetail();
    }
  }, [isVisible, invoiceId]);

  const fetchInvoiceDetail = async () => {
    setLoading(true);
    try {
      const response = await orderApi.getById(invoiceId);
      setInvoice(response.data || response);
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      'CHO_XAC_NHAN': 'Chờ xác nhận',
      'DANG_PHA_CHE': 'Đang pha chế',
      'CHO_LAY_MON': 'Chờ lấy món',
      'DANG_PHUC_VU': 'Đang phục vụ',
      'CHO_THANH_TOAN': 'Chờ thanh toán',
      'DA_THANH_TOAN': 'Đã thanh toán',
      'HOAN_TAT': 'Hoàn tất',
      'DA_HUY': 'Đã hủy',
    };
    return map[status] || status;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '---';
    const date = new Date(isoString);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={[styles.modalContainer, { width: isTablet ? '60%' : '92%' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Chi tiết hóa đơn #{invoiceId}</Text>
              <Text style={styles.headerSubtitle}>Tra cứu thông tin giao dịch lịch sử</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
          ) : invoice ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              {/* Summary Info Cards */}
              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Trạng thái</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={styles.statusText}>{getStatusLabel(invoice.trangThai)}</Text>
                  </View>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Loại đơn</Text>
                  <Text style={styles.infoValue}>{invoice.loaiDonHang === 'MANG_VE' ? 'Mang về' : 'Tại bàn'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Nhân viên</Text>
                  <Text style={styles.infoValue}>{invoice.tenNhanVien || '---'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Thanh toán</Text>
                  <Text style={styles.infoValue}>{invoice.phuongThucThanhToan || 'Chưa thanh toán'}</Text>
                </View>
              </View>

              {/* Items Table */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danh sách món ăn</Text>
                <View style={styles.itemsHeader}>
                   <Text style={[styles.itemHeaderText, { flex: 2 }]}>Sản phẩm</Text>
                   <Text style={[styles.itemHeaderText, { flex: 0.5, textAlign: 'center' }]}>SL</Text>
                   <Text style={[styles.itemHeaderText, { flex: 1, textAlign: 'right' }]}>Thành tiền</Text>
                </View>
                {invoice.danhSachChiTiet?.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.itemName}>{item.tenSanPham}</Text>
                      <Text style={styles.itemSub}>{item.tenKichCo}</Text>
                      {item.tuyChonJson && (
                        <Text style={styles.itemOptions}>
                          {Object.values(JSON.parse(item.tuyChonJson)).filter(v => v).join(' • ')}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.itemQty, { flex: 0.5 }]}>x{item.soLuong}</Text>
                    <Text style={[styles.itemPrice, { flex: 1 }]}>{item.thanhTien?.toLocaleString()}đ</Text>
                  </View>
                ))}
              </View>

              {/* Totals Section */}
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tiền hàng</Text>
                  <Text style={styles.totalValue}>{invoice.tongTienHang?.toLocaleString()}đ</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Thuế phí (VAT 8%)</Text>
                  <Text style={styles.totalValue}>+{invoice.tongTienThue?.toLocaleString()}đ</Text>
                </View>
                <View style={[styles.totalRow, styles.finalRow]}>
                  <Text style={styles.finalLabel}>TỔNG CỘNG</Text>
                  <Text style={styles.finalValue}>{invoice.tongThanhToan?.toLocaleString()}đ</Text>
                </View>
              </View>

              {/* Timestamps */}
              <View style={styles.timestampSection}>
                <View style={styles.timeRow}><Text style={styles.timeLabel}>Giờ tạo:</Text><Text style={styles.timeValue}>{formatTime(invoice.thoiGianTao)}</Text></View>
                <View style={styles.timeRow}><Text style={styles.timeLabel}>Giờ thanh toán:</Text><Text style={styles.timeValue}>{formatTime(invoice.thoiGianThanhToan)}</Text></View>
              </View>

              {/* Bill Print View (Optional Decorative) */}
              {invoice.thongTinChiTiet && (
                <View style={styles.receiptContainer}>
                   <Text style={styles.receiptText}>{invoice.thongTinChiTiet}</Text>
                </View>
              )}

            </ScrollView>
          ) : null}
          
          <View style={styles.footer}>
            <Pressable style={styles.okBtn} onPress={onClose}>
               <Text style={styles.okBtnText}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#94A3B8',
  },
  scrollContent: {
    padding: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  itemsHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  itemHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemOptions: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemQty: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
    textAlign: 'right',
  },
  totalsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  finalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  finalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
  },
  finalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
  },
  timestampSection: {
    gap: 8,
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  timeValue: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  receiptContainer: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  receiptText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 14,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 16,
  },
  okBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  okBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  printBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  printBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  }
});

export default InvoiceHistoryModal;
