import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
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
    {disabled ? (
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

const ReserveTableSheet = ({ table, tables, onClose, onRefresh }) => {
  const [custName, setCustName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('');
  const [guestCount, setGuestCount] = useState('2');
  const [note, setNote] = useState('');
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  React.useEffect(() => {
    if (table) {
      setSelectedTables([table.idBan]);
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
    if (!custName || !phone || !time) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên, SĐT và giờ hẹn.');
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
        danhSachIdBan: selectedTables
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
          shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 20 
        }}>
          {/* Trang trí: Gradient Glow Blobs */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: 24 }} pointerEvents="none">
            <LinearGradient colors={['rgba(245, 158, 11, 0.15)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: -100, left: -100, width: 350, height: 350, borderRadius: 175 }} />
            <LinearGradient colors={['rgba(59, 130, 246, 0.08)', 'transparent']} start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }} style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: 200 }} />
          </View>

          <Pressable style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', zIndex: 10 }} onPress={onClose}>
            <Text style={{ fontSize: 18, color: '#64748B', fontWeight: 'bold' }}>✕</Text>
          </Pressable>

          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: isTablet ? 34 : 28, fontWeight: '900', color: '#1E293B', marginBottom: 4 }}>Đặt bàn trước</Text>
            <Text style={{ fontSize: isTablet ? 18 : 16, fontWeight: '700', color: '#D97706' }}>{table.tenBan || table.name} 📅</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Split layout for Tablet */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: isTablet ? 24 : 0 }}>
               
               {/* LẼ TRÁI - Nhập Tên & SĐT*/}
               <View style={{ flex: 1 }}>
                  <InputField label="Tên khách hàng *" icon="👤" value={custName} onChangeText={setCustName} placeholder="Nhập tên khách..." />
                  <InputField label="Số điện thoại *" icon="📞" value={phone} onChangeText={setPhone} placeholder="Nhập số điện thoại..." keyboardType="phone-pad" />
               </View>

               {/* LỀ PHẢI - Giờ hẹn, Số khách, Gộp Bàn, Ghi chú */}
               <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                     <View style={{ flex: 1 }}>
                        <InputField label="Giờ hẹn đến *" icon="🕐" value={time} onChangeText={setTime} placeholder="VD: 19:30" />
                     </View>
                     <View style={{ flex: 1 }}>
                        <InputField label="Số người" icon="👥" value={guestCount} onChangeText={setGuestCount} placeholder="VD: 2" keyboardType="numeric" />
                     </View>
                  </View>

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
                                 style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: isSelected ? '#FEF3C7' : '#FFFFFF', borderWidth: 1.5, borderColor: isSelected ? '#F59E0B' : '#E2E8F0' }}>
                                 <Text style={{ color: isSelected ? '#B45309' : '#64748B', fontWeight: isSelected ? '700' : '500', fontSize: 15 }}>{t.tenBan}</Text>
                               </Pressable>
                             );
                           }) : <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>Không có bàn trống nào khác.</Text>}
                         </ScrollView>
                     </View>
                  </View>

                  <InputField label="Ghi chú thêm" icon="📝" value={note} onChangeText={setNote} placeholder="Ví dụ: Gộp bàn, ít đá..." multiline />
               </View>
            </View>

            <View style={{ height: 1.5, backgroundColor: '#F1F5F9', marginVertical: 24, width: '100%' }} />

            {/* ACTION FOOTER */}
            <ActionButton 
                title="Xác nhận đặt bàn" icon="✅" gradient={['#FEF3C7', '#FDE68A']} textColor="#B45309" borderColor="#FCD34D" shadowColor="#F59E0B"
                horizontal containerStyle={{ height: 65, width: '100%' }} 
                onPress={handleConfirm} disabled={loading}
            />

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ReserveTableSheet;
