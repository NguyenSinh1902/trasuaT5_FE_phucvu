import React, { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../TableMap.styles';

const UpdateGuestSheet = ({ table, onClose }) => {
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
            <Text style={styles.sheetTitle}>Cập nhật số khách</Text>
            <Text style={styles.sheetSubtitle}>{table.name}</Text>
          </View>
          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </Pressable>
        </View>

        <Text style={[styles.sheetGuestLabel, { textAlign: 'center', marginTop: 8 }]}>Số lượng khách</Text>
        <View style={styles.sheetStepper}>
          <Pressable style={styles.stepperBtn} onPress={() => setGuestCount(Math.max(1, guestCount - 1))}>
            <Text style={styles.stepperBtnText}>−</Text>
          </Pressable>
          <Text style={styles.stepperValue}>{guestCount}</Text>
          <Pressable style={styles.stepperBtn} onPress={() => setGuestCount(guestCount + 1)}>
            <Text style={styles.stepperBtnText}>+</Text>
          </Pressable>
        </View>

        <LinearGradient colors={['#8BA367', '#6B8E4E']} style={[styles.confirmBtn, { marginTop: 8 }]}>
          <Pressable style={styles.confirmBtnInner} onPress={onClose}>
            <Text style={styles.confirmBtnText}>Cập nhật</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default UpdateGuestSheet;
