import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const FilterModal = ({ isVisible, onClose, currentFilter, onSelectFilter }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const filters = [
    { id: 'ALL', label: 'Tất cả bàn', icon: '📋', color: '#64748B' },
    { id: 'TRONG', label: 'Bàn trống', icon: '🟢', color: '#22C55E' },
    { id: 'CO_KHACH', label: 'Đang dùng', icon: '🔴', color: '#EF4444' },
    { id: 'DA_DAT', label: 'Đã đặt trước', icon: '🔵', color: '#3B82F6' },
  ];

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.content, isTablet && styles.contentTablet]}>
          <View style={styles.header}>
            <Text style={styles.title}>Bộ lọc trạng thái</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          
          <View style={styles.list}>
            {filters.map((item) => (
              <Pressable 
                key={item.id} 
                style={[
                  styles.item, 
                  currentFilter === item.id && styles.itemActive
                ]}
                onPress={() => {
                  onSelectFilter(item.id);
                  onClose();
                }}
              >
                <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <Text style={[styles.label, currentFilter === item.id && styles.labelActive]}>
                  {item.label}
                </Text>
                {currentFilter === item.id && (
                  <View style={styles.checkWrap}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  contentTablet: {
    width: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'bold',
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  itemActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  labelActive: {
    color: '#047857',
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FilterModal;
