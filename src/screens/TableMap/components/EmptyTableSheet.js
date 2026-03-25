import React, { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';

const EmptyTableSheet = ({ table, onClose, onReserve, onOpenMenu }) => {
  const [guestCount, setGuestCount] = useState(2);
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
            <Text style={styles.sheetSubtitle}>Sẵn sàng phục vụ</Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Action card */}
        <View style={styles.sheetCard}>
          <View style={styles.sheetCardTitleRow}>
            <Text style={styles.sheetCardIcon}>🍽️</Text>
            <Text style={styles.sheetCardTitle}>Mở bàn & Đặt món</Text>
          </View>

          <Text style={styles.sheetGuestLabel}>Số lượng khách</Text>
          <View style={styles.sheetStepper}>
            <Pressable style={styles.stepperBtn} onPress={() => setGuestCount(Math.max(1, guestCount - 1))}>
              <Text style={styles.stepperBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{guestCount}</Text>
            <Pressable style={styles.stepperBtn} onPress={() => setGuestCount(guestCount + 1)}>
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>

          <LinearGradient colors={['#8BA367', '#6B8E4E']} style={styles.confirmBtn}>
            <Pressable style={styles.confirmBtnInner} onPress={() => { onClose(); onOpenMenu && onOpenMenu(); }}>
              <Text style={styles.confirmBtnText}>Xác nhận & Đặt món</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Reserve button */}
        <Pressable style={styles.reserveBtn} onPress={onReserve}>
          <Text style={styles.reserveBtnIcon}>📅</Text>
          <Text style={styles.reserveBtnText}>Đặt bàn trước</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

export default EmptyTableSheet;
