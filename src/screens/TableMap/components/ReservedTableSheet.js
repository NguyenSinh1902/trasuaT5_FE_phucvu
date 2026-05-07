import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import reservationApi from '../../../api/reservationApi';

const ReservedTableSheet = ({ table, onClose, onEdit, onRefresh, onOpenMenu }) => {
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  if (!table) return null;

  const handleCheckIn = async () => {
    const resId = table.reservation?.idPhieuDat;
    if (!resId) return;

    setLoading(true);
    try {
      const response = await reservationApi.checkIn(resId);
      if (onRefresh) await onRefresh();
      
      // Auto-open menu for the newly checked-in table
      if (onOpenMenu && response?.danhSachBan) {
        onOpenMenu(response.danhSachBan, response.idPhieuDat);
      }
      onClose();
    } catch (err) {
      console.error('Check-in failed:', err);
      Alert.alert('Lỗi', 'Không thể check-in bàn này. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    setShowCancelConfirm(false);
    const resId = table.reservation?.idPhieuDat;
    if (!resId) return;
    
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
  };

  const ActionButton = ({ title, icon, onPress, bgColor, gradient, textColor, borderColor, containerStyle, horizontal, shadowColor }) => (
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
          transform: [{ scale: pressed ? 0.96 : 1 }],
          shadowColor: shadowColor || bgColor || (gradient && gradient[1]) || '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: pressed || borderColor ? 0 : 0.3,
          shadowRadius: 10,
          elevation: pressed ? 0 : 5,
        },
        containerStyle
      ]}
    >
      {gradient && <LinearGradient colors={gradient} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} start={{x:0, y:0}} end={{x:1, y:1}} />}
      {icon && <Text style={{ fontSize: horizontal ? 24 : 32, marginRight: horizontal ? 12 : 0, marginBottom: horizontal ? 0 : 6, zIndex: 1 }}>{icon}</Text>}
      <Text style={{ color: textColor, fontSize: 16, fontWeight: '800', letterSpacing: 0.5, zIndex: 1 }} adjustsFontSizeToFit numberOfLines={1}>{title}</Text>
    </Pressable>
  );

  return (
    <Modal visible={!!table} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} onPress={onClose} />
        
        <View style={{ 
          width: isTablet ? '55%' : '92%', 
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          borderRadius: 24, 
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.8)',
          padding: isTablet ? 36 : 24, 
          paddingBottom: isTablet ? 32 : 24,
          shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 20 
        }}>
          {/* Trang trí: Gradient Glow Blobs */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: 24 }} pointerEvents="none">
            <LinearGradient colors={['rgba(245, 158, 11, 0.12)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: -100, left: -100, width: 350, height: 350, borderRadius: 175 }} />
            <LinearGradient colors={['rgba(16, 185, 129, 0.08)', 'transparent']} start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }} style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: 200 }} />
          </View>

          {/* Close Button */}
          <Pressable style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', zIndex: 10 }} onPress={onClose}>
            <Text style={{ fontSize: 18, color: '#64748B', fontWeight: 'bold' }}>✕</Text>
          </Pressable>

          {/* HEADER */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: isTablet ? 36 : 28, fontWeight: '900', color: '#1E293B', marginBottom: 4 }}>{table.tenBan || 'Bàn không tên'}</Text>
            <Text style={{ fontSize: isTablet ? 20 : 16, fontWeight: '700', color: '#D97706' }}>Phiếu Đặt Bàn 📅</Text>
          </View>

          {/* RESERVATION INFO DASHBOARD */}
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: isTablet ? 32 : 24, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 32 }}>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                 <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>Giờ hẹn đến</Text>
                 <Text style={{ color: '#D97706', fontSize: isTablet ? 56 : 48, fontWeight: '900', marginTop: 8 }}>
                    {table.reservation?.thoiGianDat ? table.reservation.thoiGianDat.slice(11, 16) : '--:--'}
                 </Text>
              </View>

              <View style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 20, width: '100%' }} />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                 <Text style={{ color: '#64748B', fontSize: 15, fontWeight: '500' }}>👤 Tên khách</Text>
                 <Text style={{ color: '#1E293B', fontSize: 18, fontWeight: '800' }}>{table.reservation?.tenKhachHang || '---'}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                 <Text style={{ color: '#64748B', fontSize: 15, fontWeight: '500' }}>📞 Số điện thoại</Text>
                 <Text style={{ color: '#1E293B', fontSize: 18, fontWeight: '800' }}>{table.reservation?.sdtKhachHang || '---'}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                 <Text style={{ color: '#64748B', fontSize: 15, fontWeight: '500' }}>👥 Số khách</Text>
                 <Text style={{ color: '#1E293B', fontSize: 18, fontWeight: '800' }}>{table.reservation?.soLuongNguoi || 0}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <Text style={{ color: '#64748B', fontSize: 15, fontWeight: '500', flex: 1 }}>📝 Ghi chú</Text>
                 <Text style={{ color: '#1E293B', fontSize: 16, fontWeight: '600', flex: 2, textAlign: 'right' }}>
                    {table.reservation?.ghiChu || '---'}
                 </Text>
              </View>
          </View>

          {/* CHECK-IN CORE ACTION */}
          <ActionButton 
              title="Check-in & Mở bàn" gradient={['#34D399', '#059669']} textColor="#FFFFFF" shadowColor="#047857"
              horizontal containerStyle={{ height: 70, marginBottom: 16 }} 
              onPress={handleCheckIn} 
          />

          {/* SECONDARY ACTIONS */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
              <ActionButton 
                  title="Sửa thông tin" icon="✏️" bgColor="#F1F5F9" textColor="#475569" borderColor="#E2E8F0"
                  horizontal containerStyle={{ flex: 1, height: 60, shadowOpacity: 0 }} 
                  onPress={onEdit} 
              />
              <ActionButton 
                  title="Hủy đặt" icon="⊗" gradient={['#FEF2F2', '#FEE2E2']} textColor="#B91C1C" borderColor="#FECACA" shadowColor="#F87171"
                  horizontal containerStyle={{ flex: 1, height: 60 }} 
                  onPress={handleCancelClick} 
              />
          </View>

          {loading && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.75)', justifyContent: 'center', alignItems: 'center', borderRadius: 24, zIndex: 100 }}>
              <ActivityIndicator size="large" color="#D97706" />
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
                   Bạn có chắc chắn muốn hủy phiếu đặt bàn này không? Hành động này sẽ <Text style={{fontWeight: 'bold', color: '#E11D48'}}>không thể hoàn tác</Text>.
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

        </View>
      </View>
    </Modal>
  );
};

export default ReservedTableSheet;
