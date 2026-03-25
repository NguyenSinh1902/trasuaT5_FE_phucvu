import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';

const ReserveTableSheet = ({ table, onClose }) => {
  const [custName, setCustName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('');
  if (!table) return null;

  return (
    <Modal visible={!!table} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>Đặt bàn trước</Text>
            <Text style={styles.sheetSubtitle}>{table.name}</Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Form fields */}
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
            onPress={() => console.log('Reserve', table.name, custName, phone, time)}>
            <Text style={[styles.confirmBtnText, { color: '#1A1A1A' }]}>Xác nhận đặt bàn</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default ReserveTableSheet;
