import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';

const ReservedTableSheet = ({ table, onClose, onEdit }) => {
  if (!table) return null;
  return (
    <Modal visible={!!table} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheetContainer, { borderTopColor: 'rgba(255,215,0,0.3)' }]}>
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>{table.name}</Text>
            <Text style={[styles.sheetSubtitle, { color: '#FFD700' }]}>Phiếu đặt bàn</Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Reservation info card */}
        <LinearGradient
          colors={['rgba(255,215,0,0.2)', 'rgba(255,165,0,0.1)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.resCard}>

          {/* Appointment time */}
          <Text style={styles.resTimeLabel}>Giờ hẹn đến</Text>
          <Text style={styles.resTimeValue}>{table.time}</Text>

          {/* Divider */}
          <View style={styles.resDivider} />

          {/* Customer info */}
          <View style={styles.resInfoRow}>
            <Text style={styles.resInfoKey}>Tên khách</Text>
            <Text style={styles.resInfoValue}>Nguyễn Văn An</Text>
          </View>
          <View style={[styles.resInfoRow, { marginTop: 8 }]}>
            <Text style={styles.resInfoKey}>Số điện thoại</Text>
            <Text style={styles.resInfoValue}>0909123456</Text>
          </View>
        </LinearGradient>

        {/* Check-in button */}
        <LinearGradient colors={['#8BA367', '#6B8E4E']} style={[styles.confirmBtn, { marginBottom: 12 }]}>
          <Pressable style={styles.confirmBtnInner}>
            <Text style={styles.confirmBtnText}>→ Check-in & Mở bàn</Text>
          </Pressable>
        </LinearGradient>

        {/* Sửa / Hủy đặt row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable style={[styles.occBtnGhost, { flex: 1, marginBottom: 0 }]} onPress={onEdit}>
            <Text style={styles.occBtnGhostText}>✏️ Sửa</Text>
          </Pressable>
          <Pressable style={[styles.occBtnGhost, { flex: 1, marginBottom: 0, backgroundColor: 'rgba(251,44,54,0.15)', borderColor: 'rgba(251,44,54,0.3)' }]}>
            <Text style={[styles.occBtnGhostText, { color: '#FFA2A2' }]}>⊗ Hủy đặt</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ReservedTableSheet;
