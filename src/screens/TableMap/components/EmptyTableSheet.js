import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, Pressable, TextInput, ScrollView,
  ActivityIndicator, Alert, useWindowDimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import reservationApi from '../../../api/reservationApi';

const ActionButton = ({ title, icon, onPress, bgColor, gradient, textColor, borderColor, containerStyle, horizontal, shadowColor, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      {
        flexDirection: horizontal ? 'row' : 'column',
        backgroundColor: bgColor || 'transparent',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: borderColor ? 1.5 : 0,
        borderColor: borderColor || 'transparent',
        opacity: disabled ? 0.6 : (pressed ? 0.8 : 1),
        transform: [{ scale: (pressed && !disabled) ? 0.96 : 1 }],
        shadowColor: disabled ? 'transparent' : (shadowColor || bgColor || (gradient && gradient[1]) || '#000'),
        shadowOffset: { width: 0, height: disabled ? 0 : 6 },
        shadowOpacity: disabled ? 0 : (pressed || borderColor ? 0 : 0.3),
        shadowRadius: 10,
        elevation: disabled ? 0 : (pressed ? 0 : 5),
      },
      containerStyle
    ]}
  >
    {gradient && <LinearGradient colors={gradient} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} start={{x:0, y:0}} end={{x:1, y:1}} />}
    {disabled && title.includes('Xác nhận') ? (
      <ActivityIndicator color={textColor} />
    ) : (
      <>
        {icon && <Text style={{ fontSize: horizontal ? 24 : 32, marginRight: horizontal ? 12 : 0, marginBottom: horizontal ? 0 : 6, zIndex: 1 }}>{icon}</Text>}
        <Text style={{ color: textColor, fontSize: 16, fontWeight: '800', letterSpacing: 0.5, zIndex: 1 }} adjustsFontSizeToFit numberOfLines={1}>{title}</Text>
      </>
    )}
  </Pressable>
);

const InputField = ({ label, icon, value, onChangeText, keyboardType, placeholder, multiline }) => (
  <View style={{ marginBottom: 20 }}>
     <Text style={{ color: '#475569', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>{label}</Text>
     <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, minHeight: multiline ? 100 : 55, alignItems: multiline ? 'flex-start' : 'center' }}>
        {icon && <Text style={{ fontSize: 20, marginRight: 12, marginTop: multiline ? 16 : 0 }}>{icon}</Text>}
        <TextInput
           style={{ flex: 1, color: '#1E293B', fontSize: 16, fontWeight: '500', paddingVertical: multiline ? 16 : 0, textAlignVertical: multiline ? 'top' : 'center' }}
           placeholder={placeholder}
           placeholderTextColor="#94A3B8"
           value={value}
           onChangeText={onChangeText}
           keyboardType={keyboardType}
           multiline={multiline}
        />
     </View>
  </View>
);

const EmptyTableSheet = ({ table, tables, onClose, onReserve, onOpenMenu, onRefresh }) => {
  const [customerName, setCustomerName] = useState('Khách vãng lai');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [note, setNote] = useState('');
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

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

  const totalCapacity = (tables || [])
    .filter(t => selectedTables.includes(t.idBan))
    .reduce((sum, t) => sum + (t.sucChua || 2), 0);
    
  const isOverCapacity = guestCount > totalCapacity;

  const handleConfirm = async () => {
    setError(null);
    if (isOverCapacity) return;
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
      setError('Không thể mở bàn. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          maxHeight: '90%',
          shadowColor: '#10B981', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 20 
        }}>
          {/* Trang trí: Gradient Glow Blobs */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: 24 }} pointerEvents="none">
            <LinearGradient colors={['rgba(16, 185, 129, 0.15)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: -100, left: -100, width: 350, height: 350, borderRadius: 175 }} />
            <LinearGradient colors={['rgba(59, 130, 246, 0.08)', 'transparent']} start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }} style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: 200 }} />
          </View>

          <Pressable style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', zIndex: 10 }} onPress={onClose}>
            <Text style={{ fontSize: 18, color: '#64748B', fontWeight: 'bold' }}>✕</Text>
          </Pressable>

          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: isTablet ? 34 : 28, fontWeight: '900', color: '#1E293B', marginBottom: 4 }}>{table.tenBan}</Text>
            <Text style={{ fontSize: isTablet ? 18 : 16, fontWeight: '700', color: '#059669' }}>Mở bàn & Đặt món 📝</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Split layout for Tablet */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: isTablet ? 24 : 0 }}>
               
               {/* LẼ TRÁI - Nhập Tên & SĐT, Số khách */}
               <View style={{ flex: 1 }}>
                  <InputField label="Tên khách hàng" icon="👤" value={customerName} onChangeText={setCustomerName} placeholder="Nhập tên khách..." />
                  <InputField label="Số điện thoại" icon="📞" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Nhập số điện thoại..." keyboardType="phone-pad" />
                  
                  {/* Stepper for Guests */}
                  <View style={{ marginBottom: 20 }}>
                     <Text style={{ color: '#475569', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>👥 Tổng số lượng khách</Text>
                     <View style={{ flexDirection: 'row', backgroundColor: isOverCapacity ? '#FEF2F2' : '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: isOverCapacity ? '#FECACA' : '#E2E8F0', padding: 8, alignItems: 'center', alignSelf: 'flex-start' }}>
                        <Pressable onPress={() => setGuestCount(Math.max(1, guestCount - 1))} style={{ width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor:'#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, borderWidth: isOverCapacity ? 1 : 0, borderColor: '#FEE2E2' }}>
                           <Text style={{ fontSize: 24, color: isOverCapacity ? '#EF4444' : '#475569', fontWeight: 'bold' }}>−</Text>
                        </Pressable>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: isOverCapacity ? '#DC2626' : '#1E293B', marginHorizontal: 28 }}>{guestCount}</Text>
                        <Pressable onPress={() => setGuestCount(guestCount + 1)} style={{ width: 44, height: 44, backgroundColor: isOverCapacity ? '#EF4444' : '#059669', borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor: isOverCapacity ? '#EF4444' : '#059669', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}>
                           <Text style={{ fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' }}>+</Text>
                        </Pressable>
                     </View>
                     
                     {isOverCapacity && (
                       <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' }}>
                         <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
                         <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '600', flex: 1 }}>
                           Vượt quá sức chứa tối đa ({totalCapacity} người). Vui lòng gộp thêm bàn bên phải!
                         </Text>
                       </View>
                     )}
                  </View>
               </View>

               {/* LỀ PHẢI - Chọn bàn & Ghi chú */}
               <View style={{ flex: 1 }}>
                  <View style={{ marginBottom: 20 }}>
                     <Text style={{ color: '#475569', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>🔗 Gộp thêm bàn (Nếu có)</Text>
                     <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 16 }}>
                         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                           {emptyTables.length > 0 ? emptyTables.map(t => {
                             const isSelected = selectedTables.includes(t.idBan);
                             return (
                               <Pressable
                                 key={t.idBan}
                                 onPress={() => toggleTable(t.idBan)}
                                 style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: isSelected ? '#D1FAE5' : '#FFFFFF', borderWidth: 1.5, borderColor: isSelected ? '#10B981' : '#E2E8F0' }}>
                                 <Text style={{ color: isSelected ? '#047857' : '#64748B', fontWeight: isSelected ? '700' : '500', fontSize: 15 }}>{t.tenBan}</Text>
                               </Pressable>
                             );
                           }) : <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>Không có bàn trống nào khác.</Text>}
                         </ScrollView>
                     </View>
                  </View>

                  <InputField label="Ghi chú thêm" icon="📝" value={note} onChangeText={setNote} placeholder="VD: Khách đi đông, gộp bàn..." multiline />
               </View>
            </View>

            <View style={{ height: 1.5, backgroundColor: '#F1F5F9', marginVertical: 24, width: '100%' }} />

            {error && (
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' }}>
                 <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
                 <Text style={{ color: '#DC2626', fontSize: 14, fontWeight: '600', flex: 1 }}>{error}</Text>
               </View>
            )}

            {/* ACTION FOOTER */}
            <View style={{ flexDirection: 'row', gap: 16 }}>
               <ActionButton 
                  title="Đặt bàn trước" icon="📅" gradient={['#FEF3C7', '#FDE68A']} textColor="#B45309" borderColor="#FCD34D" shadowColor="#F59E0B"
                  horizontal containerStyle={{ flex: 1, height: 65 }} 
                  onPress={() => { onClose(); onReserve && onReserve(); }} 
                  disabled={isOverCapacity}
               />
               <ActionButton 
                  title="Xác nhận & Đặt món" icon="✅" gradient={['#34D399', '#059669']} textColor="#FFFFFF" shadowColor="#047857"
                  horizontal containerStyle={{ flex: 1, height: 65 }} 
                  onPress={handleConfirm} disabled={loading || isOverCapacity}
               />
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default EmptyTableSheet;
