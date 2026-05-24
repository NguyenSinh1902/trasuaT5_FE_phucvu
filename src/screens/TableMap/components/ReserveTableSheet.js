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

const PickerField = ({ label, icon, value, placeholder, onPress }) => (
  <View style={{ marginBottom: 20 }}>
     <Text style={{ color: '#475569', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>{label}</Text>
     <Pressable 
        onPress={onPress}
        style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, height: 55, alignItems: 'center' }}>
        {icon && <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>}
        <Text style={{ flex: 1, color: value ? '#1E293B' : '#94A3B8', fontSize: 16, fontWeight: '500' }}>
           {value || placeholder}
        </Text>
     </Pressable>
  </View>
);

const ReserveTableSheet = ({ table, tables, onClose, onRefresh }) => {
  const [custName, setCustName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [note, setNote] = useState('');
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  React.useEffect(() => {
    if (table) {
      setSelectedTables([table.idBan]);
      if (!time) setTime('19:00');
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
    if (!custName || !phone || !time) {
      setError('Thiếu thông tin: Vui lòng nhập Tên, SĐT và Giờ hẹn.');
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
        soLuongNguoi: guestCount,
        ghiChu: note,
        danhSachIdBan: selectedTables
      };

      await reservationApi.createReservation(payload);
      if (onRefresh) await onRefresh();
      onClose();
    } catch (err) {
      console.error('Reserve failed:', err);
      setError(err.message || 'Không thể đặt bàn. Vui lòng kiểm tra lại thời gian.');
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
                        <PickerField label="Giờ hẹn đến *" icon="🕐" value={time} placeholder="Chọn giờ" onPress={() => setShowTimePicker(true)} />
                     </View>
                     <View style={{ flex: 1 }}>
                        {/* Stepper for Guests */}
                        <Text style={{ color: '#475569', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>Số người</Text>
                        <View style={{ flexDirection: 'row', backgroundColor: isOverCapacity ? '#FEF2F2' : '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: isOverCapacity ? '#FECACA' : '#E2E8F0', padding: 5, alignItems: 'center', height: 55 }}>
                           <Pressable onPress={() => setGuestCount(Math.max(1, guestCount - 1))} style={{ flex: 1, height: '100%', backgroundColor: '#FFFFFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor:'#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, borderWidth: isOverCapacity ? 1 : 0, borderColor: '#FEE2E2' }}>
                              <Text style={{ fontSize: 20, color: isOverCapacity ? '#EF4444' : '#475569', fontWeight: 'bold' }}>−</Text>
                           </Pressable>
                           <Text style={{ fontSize: 18, fontWeight: '800', color: isOverCapacity ? '#DC2626' : '#1E293B', marginHorizontal: 12, minWidth: 20, textAlign: 'center' }}>{guestCount}</Text>
                           <Pressable onPress={() => setGuestCount(guestCount + 1)} style={{ flex: 1, height: '100%', backgroundColor: isOverCapacity ? '#EF4444' : '#F59E0B', borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor: isOverCapacity ? '#EF4444' : '#D97706', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}>
                              <Text style={{ fontSize: 20, color: '#FFFFFF', fontWeight: 'bold' }}>+</Text>
                           </Pressable>
                        </View>
                     </View>
                  </View>

                  {isOverCapacity && (
                     <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -8, marginBottom: 16, backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' }}>
                       <Text style={{ fontSize: 14, marginRight: 6 }}>⚠️</Text>
                       <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600', flex: 1 }}>
                         Vượt quá sức chứa ({totalCapacity} người). Vui lòng gộp bàn!
                       </Text>
                     </View>
                  )}

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

            {error && (
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' }}>
                 <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
                 <Text style={{ color: '#DC2626', fontSize: 14, fontWeight: '600', flex: 1 }}>{error}</Text>
               </View>
            )}

            {/* ACTION FOOTER */}
            <ActionButton 
                title="Xác nhận đặt bàn" icon="✅" gradient={['#FEF3C7', '#FDE68A']} textColor="#B45309" borderColor="#FCD34D" shadowColor="#F59E0B"
                horizontal containerStyle={{ height: 65, width: '100%' }} 
                onPress={handleConfirm} disabled={loading || isOverCapacity}
            />

          </ScrollView>

          {/* CUSTOM TIME PICKER OVERLAY */}
          {showTimePicker && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 300, borderRadius: 24 }}>
               <View style={{ backgroundColor: '#FFFFFF', width: 320, borderRadius: 24, padding: 24, shadowColor: '#D97706', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 16, textAlign: 'center' }}>Chọn Giờ Hẹn</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                     {/* Cột Giờ */}
                     <View style={{ flex: 1, height: 220 }}>
                        <Text style={{ textAlign: 'center', color: '#64748B', marginBottom: 8, fontWeight: '700', fontSize: 13, textTransform: 'uppercase' }}>Giờ</Text>
                        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                           {Array.from({length: 24}, (_, i) => i).map(h => {
                              const hr = h.toString().padStart(2, '0');
                              const isSelected = time.split(':')[0] === hr;
                              return (
                                 <Pressable key={hr} onPress={() => setTime(`${hr}:${time.split(':')[1] || '00'}`)} style={{ paddingVertical: 12, backgroundColor: isSelected ? '#FEF3C7' : 'transparent', borderRadius: 12, marginBottom: 4 }}>
                                    <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: isSelected ? '900' : '600', color: isSelected ? '#D97706' : '#475569' }}>{hr}</Text>
                                 </Pressable>
                              )
                           })}
                        </ScrollView>
                     </View>

                     <View style={{ width: 1.5, backgroundColor: '#F1F5F9', marginHorizontal: 16 }} />

                     {/* Cột Phút */}
                     <View style={{ flex: 1, height: 220 }}>
                        <Text style={{ textAlign: 'center', color: '#64748B', marginBottom: 8, fontWeight: '700', fontSize: 13, textTransform: 'uppercase' }}>Phút</Text>
                        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                           {Array.from({length: 60}, (_, i) => i).map(m => {
                              const min = m.toString().padStart(2, '0');
                              const isSelected = time.split(':')[1] === min;
                              return (
                                 <Pressable key={min} onPress={() => setTime(`${time.split(':')[0] || '19'}:${min}`)} style={{ paddingVertical: 12, backgroundColor: isSelected ? '#FEF3C7' : 'transparent', borderRadius: 12, marginBottom: 4 }}>
                                    <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: isSelected ? '900' : '600', color: isSelected ? '#D97706' : '#475569' }}>{min}</Text>
                                 </Pressable>
                              )
                           })}
                        </ScrollView>
                     </View>
                  </View>

                  <Pressable onPress={() => setShowTimePicker(false)} style={({pressed}) => [{ backgroundColor: '#F59E0B', paddingVertical: 16, borderRadius: 16, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}>
                     <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>Xong</Text>
                  </Pressable>
               </View>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

export default ReserveTableSheet;
