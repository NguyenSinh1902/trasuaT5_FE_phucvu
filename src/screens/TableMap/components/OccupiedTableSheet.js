import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import reservationApi from '../../../api/reservationApi';
import orderApi from '../../../api/orderApi';

const OccupiedTableSheet = ({ table, tables, onClose, onUpdateGuest, onRefresh, onOpenMenu, onViewInvoice }) => {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'merge', 'change', null
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    let timer;
    const startTimeStr = table?.invoice?.thoiGianTao || table?.reservation?.thoiGianDat;

    if (startTimeStr) {
      const startMs = new Date(startTimeStr).getTime();
      const updateTimer = () => {
        const diffMs = Math.max(0, Date.now() - startMs);
        const hours = Math.floor(diffMs / 3600000).toString().padStart(2, '0');
        const minutes = Math.floor((diffMs % 3600000) / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((diffMs % 60000) / 1000).toString().padStart(2, '0');
        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime('00:00:00');
    }
    return () => clearInterval(timer);
  }, [table]);

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

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    setShowCancelConfirm(false);
    if (!reservationId) return;
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
  };

  const handleRequestPaymentClick = () => {
    const invoiceId = table.invoice?.idHoaDon;
    if (!invoiceId) {
      setPaymentError('Bàn này hiện chưa có hóa đơn hoặc hóa đơn không còn hiệu lực.');
      return;
    }
    setShowPaymentConfirm(true);
  };

  const confirmPayment = async () => {
    const invoiceId = table.invoice?.idHoaDon;
    setShowPaymentConfirm(false);
    setLoading(true);
    try {
      await orderApi.requestPayment(invoiceId);
      if (onRefresh) await onRefresh();
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setPaymentError('Không thể gửi yêu cầu thanh toán. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const ActionButton = ({ title, icon, onPress, bgColor, gradient, textColor, borderColor, isActive, containerStyle, horizontal, shadowColor }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: horizontal ? 'row' : 'column',
          backgroundColor: bgColor || 'transparent',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: borderColor ? 1.5 : 0,
          borderColor: borderColor || 'transparent',
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : (isActive ? 0.98 : 1) }],
          shadowColor: shadowColor || bgColor || (gradient && gradient[1]) || '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: pressed || borderColor ? 0 : 0.3,
          shadowRadius: 10,
          elevation: pressed ? 0 : 5,
        },
        containerStyle,
        isActive && { borderWidth: 2, borderColor: '#059669', shadowOpacity: 0.1 }
      ]}
    >
      {gradient && <LinearGradient colors={gradient} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />}
      <Text style={{ fontSize: horizontal ? 22 : 32, marginRight: horizontal ? 8 : 0, marginBottom: horizontal ? 0 : 6, zIndex: 1 }}>{icon}</Text>
      <Text style={{ color: textColor, fontSize: isTablet ? 15 : 13, fontWeight: '800', letterSpacing: 0.5, zIndex: 1 }} adjustsFontSizeToFit numberOfLines={1}>{title}</Text>
    </Pressable>
  );

  return (
    <Modal visible={!!table} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} onPress={onClose} />

        <View style={{
          width: isTablet ? '65%' : '92%',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.8)',
          padding: isTablet ? 36 : 24,
          paddingBottom: isTablet ? 32 : 24,
          shadowColor: '#2E7D32', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 40, elevation: 20
        }}>
          {/* Trang trí: Gradient Glow Blobs */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: 24 }} pointerEvents="none">
            <LinearGradient colors={['rgba(5, 150, 105, 0.2)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: -50, left: -50, width: 250, height: 250, borderRadius: 125 }} />
            <LinearGradient colors={['rgba(245, 158, 11, 0.2)', 'transparent']} start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }} style={{ position: 'absolute', bottom: -50, right: -50, width: 250, height: 250, borderRadius: 125 }} />
          </View>

          {/* Close Button */}
          <Pressable style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', zIndex: 10 }} onPress={onClose}>
            <Text style={{ fontSize: 18, color: '#64748B', fontWeight: 'bold' }}>✕</Text>
          </Pressable>

          {/* HEADER */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: isTablet ? 32 : 28, fontWeight: '900', color: '#1E293B', marginBottom: 4 }}>{table.tenBan || 'Bàn không tên'}</Text>
            <Text style={{ fontSize: isTablet ? 18 : 16, fontWeight: '700', color: table.invoice?.trangThai === 'CHO_THANH_TOAN' ? '#D97706' : '#059669' }}>
              {table.invoice?.trangThai === 'CHO_THANH_TOAN' ? 'Chở Thanh Toán 🔔' :
                table.invoice?.trangThai === 'DA_THANH_TOAN' ? 'Đã Thanh Toán' : 'Đang Phục Vụ'}
            </Text>
          </View>

          {/* MIDDLE CONTENT: 2 Columns */}
          <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: isTablet ? 32 : 16, marginBottom: 32 }}>

            {/* CỘT TRÁI (Dashboard) */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '500' }}>🕒 Giờ vào</Text>
                  <Text style={{ color: '#1E293B', fontSize: 18, fontWeight: '700', marginTop: 4 }}>
                    {table.invoice?.thoiGianTao ? new Date(table.invoice.thoiGianTao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) :
                      table.reservation?.thoiGianDat ? table.reservation.thoiGianDat.slice(11, 16) : '--:--'}
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#E2E8F0', height: 40 }} />
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '500' }}>⏳ Đã ngồi</Text>
                  <Text style={{ color: '#1E293B', fontSize: 18, fontWeight: '700', marginTop: 4 }}>{elapsedTime}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#E2E8F0', height: 40 }} />
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '500' }}>👤 Số khách</Text>
                  <Text style={{ color: '#1E293B', fontSize: 18, fontWeight: '700', marginTop: 4 }}>{table.reservation?.soLuongNguoi || table.invoice?.soLuongKhach || 0}</Text>
                </View>
              </View>

              {/* Hiển thị chọn bàn ngay bên dưới cột này nếu ActionType tồn tại */}
              {actionType && (
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ color: '#475569', fontSize: 13, marginBottom: 12, fontWeight: '600' }}>
                    {actionType === 'merge' ? 'Chọn bàn trống để gộp:' : 'Chọn bàn trống để đổi sang:'}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                    {emptyTables.length > 0 ? emptyTables.map(t => (
                      <Pressable
                        key={t.idBan}
                        onPress={() => actionType === 'merge' ? handleMerge(t.idBan) : handleChangeTable(t.idBan)}
                        style={({ pressed }) => [{
                          paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                          backgroundColor: '#FFFFFF', marginRight: 10, borderWidth: 1.5, borderColor: actionType === 'merge' ? '#2E7D32' : '#D97706',
                          opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.95 : 1 }]
                        }]}>
                        <Text style={{ color: actionType === 'merge' ? '#2E7D32' : '#B45309', fontWeight: '700', fontSize: 15 }}>{t.tenBan}</Text>
                      </Pressable>
                    )) : <Text style={{ color: '#94A3B8', fontSize: 14, fontStyle: 'italic' }}>Không có bàn trống</Text>}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* CỘT PHẢI (Grid Nút tác vụ 2x2) */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
                <ActionButton containerStyle={{ width: '48%', height: 85 }} title="Gộp bàn" icon="➕" gradient={['#F0FDF4', '#DCFCE7']} textColor="#065F46" shadowColor="#34D399" isActive={actionType === 'merge'} onPress={() => setActionType(actionType === 'merge' ? null : 'merge')} />
                <ActionButton containerStyle={{ width: '48%', height: 85 }} title="Đổi bàn" icon="🔄" gradient={['#F0FDF4', '#DCFCE7']} textColor="#065F46" shadowColor="#34D399" isActive={actionType === 'change'} onPress={() => setActionType(actionType === 'change' ? null : 'change')} />

                <ActionButton containerStyle={{ width: '48%', height: 85 }} title="Gọi món" icon="📋" gradient={['#34D399', '#059669']} textColor="#FFFFFF" shadowColor="#047857" onPress={() => { onOpenMenu && onOpenMenu([table], reservationId, false, table.invoice?.idHoaDon); onClose(); }} />
                <ActionButton containerStyle={{ width: '48%', height: 85 }} title="Hóa đơn" icon="🧾" gradient={['#34D399', '#059669']} textColor="#FFFFFF" shadowColor="#047857" onPress={() => { onViewInvoice && onViewInvoice(table); onClose(); }} />
              </View>
            </View>

          </View>

          {/* Kẻ chân ngang xám */}
          <View style={{ height: 1.5, backgroundColor: '#F1F5F9', marginBottom: 24, width: '100%' }} />

          {/* FOOTER ROW (Align-items: center, Justify-content: space-between) */}
          <View style={{ flexDirection: isTablet ? 'row' : 'column', alignItems: isTablet ? 'center' : 'stretch', justifyContent: 'space-between', gap: 16 }}>

            {/* TỔNG TẠM TÍNH (Nằm gọn gàng bên trái) */}
            <LinearGradient colors={['#F0FDF4', '#DCFCE7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#BBF7D0', shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ color: '#166534', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginRight: 20 }}>Tổng Tạm Tính</Text>
              <Text style={{ color: '#DC2626', fontSize: 26, fontWeight: '900' }} adjustsFontSizeToFit numberOfLines={1}>
                {table.invoice?.tongThanhToan?.toLocaleString('vi-VN') || '0'} đ
              </Text>
            </LinearGradient>

            {/* ACTION BOTTOM (Hủy & Thanh toán - nằm bên phải) */}
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
              {/* Cảnh báo: Hủy Phiếu đặt */}
              <ActionButton
                title="Hủy phiếu" icon="⊗" gradient={['#FEF2F2', '#FEE2E2']} textColor="#B91C1C" borderColor="#FECACA" shadowColor="#F87171"
                horizontal containerStyle={{ paddingHorizontal: 20, height: 55 }}
                onPress={handleCancelClick}
              />
              {/* Hành động lõi: Yêu cầu Thanh toán */}
              <ActionButton
                title="Yêu cầu thanh toán" icon="💳" gradient={['#FDE68A', '#F59E0B']} textColor="#78350F" shadowColor="#D97706"
                horizontal containerStyle={{ paddingHorizontal: 24, height: 55 }}
                onPress={handleRequestPaymentClick}
              />
            </View>
          </View>

          {loading && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.75)', justifyContent: 'center', alignItems: 'center', borderRadius: 24, zIndex: 100 }}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
          )}

          {/* CUSTOM CANCEL CONFIRMATION MODAL OVERLAY */}
          {showCancelConfirm && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 200, borderRadius: 24 }}>
               <View style={{ backgroundColor: '#FFFFFF', width: isTablet ? 360 : '85%', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#E11D48', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}>
                 <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 28 }}>⚠️</Text>
                 </View>
                 <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 }}>Hủy phiếu đặt bàn</Text>
                 <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                   Bạn có chắc chắn muốn hủy phiếu đặt/mở bàn này không? Hành động này sẽ <Text style={{fontWeight: 'bold', color: '#E11D48'}}>không thể hoàn tác</Text>.
                 </Text>
                 <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                    <Pressable 
                      style={({pressed}) => [{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}
                      onPress={() => setShowCancelConfirm(false)}
                    >
                       <Text style={{ color: '#475569', fontSize: 15, fontWeight: '700' }}>Bỏ qua</Text>
                    </Pressable>
                    <Pressable 
                      style={({pressed}) => [{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
                      onPress={confirmCancel}
                    >
                      <LinearGradient colors={['#F43F5E', '#BE123C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 }} />
                      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Đồng ý Hủy</Text>
                    </Pressable>
                 </View>
               </View>
            </View>
          )}

          {/* CUSTOM PAYMENT CONFIRMATION MODAL OVERLAY */}
          {showPaymentConfirm && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 200, borderRadius: 24 }}>
               <View style={{ backgroundColor: '#FFFFFF', width: isTablet ? 360 : '85%', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#D97706', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}>
                 <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFBEB', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 28 }}>💳</Text>
                 </View>
                 <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 }}>Yêu cầu thanh toán</Text>
                 <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                   Bạn muốn gửi yêu cầu thanh toán cho hóa đơn này tới Thu Ngân?
                 </Text>
                 <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                    <Pressable 
                      style={({pressed}) => [{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}
                      onPress={() => setShowPaymentConfirm(false)}
                    >
                       <Text style={{ color: '#475569', fontSize: 15, fontWeight: '700' }}>Bỏ qua</Text>
                    </Pressable>
                    <Pressable 
                      style={({pressed}) => [{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
                      onPress={confirmPayment}
                    >
                      <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 }} />
                      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Xác nhận</Text>
                    </Pressable>
                 </View>
               </View>
            </View>
          )}

          {/* PAYMENT SUCCESS OVERLAY */}
          {paymentSuccess && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 210, borderRadius: 24 }}>
               <View style={{ backgroundColor: '#FFFFFF', width: isTablet ? 360 : '85%', borderRadius: 24, padding: 32, alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 10 }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                     <Text style={{ fontSize: 40 }}>✅</Text>
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 8 }}>Thành công!</Text>
                  <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center' }}>Đã gửi yêu cầu thanh toán.</Text>
               </View>
            </View>
          )}

          {/* PAYMENT ERROR OVERLAY */}
          {paymentError && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 210, borderRadius: 24 }}>
               <View style={{ backgroundColor: '#FFFFFF', width: isTablet ? 360 : '85%', borderRadius: 24, padding: 32, alignItems: 'center' }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                     <Text style={{ fontSize: 40 }}>❌</Text>
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 8 }}>Lỗi thanh toán</Text>
                  <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 24 }}>{paymentError}</Text>
                  <Pressable 
                     style={({pressed}) => [{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
                     onPress={() => setPaymentError(null)}
                  >
                    <Text style={{ color: '#475569', fontSize: 15, fontWeight: '700' }}>Đóng lại</Text>
                  </Pressable>
               </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default OccupiedTableSheet;
