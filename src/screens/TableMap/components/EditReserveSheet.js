import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';

const EditReserveSheet = ({ table, onClose }) => {
  const [custName, setCustName] = useState('Nguyễn Văn An');
  const [phone, setPhone] = useState('0909123456');
  const [time, setTime] = useState(table?.time ?? '');
  if (!table) return null;

  return (
    <Modal visible={!!table} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>Sửa Thông Tin Đặt Bàn</Text>
            <Text style={styles.sheetSubtitle}>{table.name}</Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Form fields — same layout as ReserveTableSheet */}
        <View style={styles.reserveFormField}>
          <Text style={styles.reserveFieldLabel}>Tên khách hàng</Text>
          <View style={styles.reserveInputWrap}>
            <Text style={styles.reserveInputIcon}>👤</Text>
            <TextInput
              style={styles.reserveInput}
              placeholder="Nhập tên khách"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={custName}
              onChangeText={setCustName}
            />
          </View>
        </View>

        <View style={styles.reserveFormField}>
          <Text style={styles.reserveFieldLabel}>Số điện thoại</Text>
          <View style={styles.reserveInputWrap}>
            <Text style={styles.reserveInputIcon}>📞</Text>
            <TextInput
              style={styles.reserveInput}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <View style={styles.reserveFormField}>
          <Text style={styles.reserveFieldLabel}>Giờ hẹn đến</Text>
          <View style={styles.reserveInputWrap}>
            <Text style={styles.reserveInputIcon}>🕐</Text>
            <TextInput
              style={styles.reserveInput}
              placeholder="VD: 19:30"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <LinearGradient colors={['#FFD700', '#FFA500']} style={[styles.confirmBtn, { marginTop: 8 }]}>
          <Pressable
            style={styles.confirmBtnInner}
            onPress={() => { console.log('Edit save', table.name, custName, phone, time); onClose(); }}>
            <Text style={[styles.confirmBtnText, { color: '#1A1A1A' }]}>Xác nhận đặt bàn</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default EditReserveSheet;
