import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';

const OccupiedTableSheet = ({ table, onClose, onUpdateGuest }) => {
  if (!table) return null;
  return (
    <Modal visible={!!table} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>{table.name}</Text>
            <Text style={styles.sheetSubtitle}>Đang phục vụ</Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.occStatRow}>
          <View style={styles.occStatBox}>
            <Text style={styles.occStatLabel}>Giờ đến</Text>
            <Text style={styles.occStatValue}>14:30</Text>
          </View>
          <View style={[styles.occStatBox, { marginLeft: 12 }]}>
            <Text style={styles.occStatLabel}>Đã ngồi</Text>
            <Text style={styles.occStatValue}>{table.time}</Text>
          </View>
        </View>

        {/* Total price card */}
        <LinearGradient
          colors={['rgba(139,163,103,0.2)', 'rgba(107,142,78,0.1)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.occPriceCard}>
          <Text style={styles.occPriceLabel}>Tổng tạm tính</Text>
          <Text style={styles.occPriceValue}>{table.price}</Text>
          <Text style={styles.occGuestCount}>2 khách</Text>
        </LinearGradient>

        {/* Action buttons */}
        <Pressable style={styles.occBtnGhost} onPress={onUpdateGuest}>
          <Text style={styles.occBtnGhostText}>👥 Cập nhật số khách</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <LinearGradient colors={['#5a7a8a', '#3d5a6a']} style={[styles.confirmBtn, { flex: 1 }]}>
            <Pressable style={styles.confirmBtnInner}>
              <Text style={styles.confirmBtnText}>🧾 Xem hóa đơn</Text>
            </Pressable>
          </LinearGradient>
          <LinearGradient colors={['#8BA367', '#6B8E4E']} style={[styles.confirmBtn, { flex: 1 }]}>
            <Pressable style={styles.confirmBtnInner}>
              <Text style={styles.confirmBtnText}>📋 Gọi thêm món</Text>
            </Pressable>
          </LinearGradient>
        </View>

        <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.confirmBtn}>
          <Pressable style={styles.confirmBtnInner}>
            <Text style={[styles.confirmBtnText, { color: '#1A1A1A', fontWeight: '700' }]}>💳 Yêu cầu thanh toán</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default OccupiedTableSheet;
