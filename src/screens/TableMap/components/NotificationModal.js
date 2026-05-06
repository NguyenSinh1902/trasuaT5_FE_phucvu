import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';

const NotificationModal = ({ isVisible, onClose }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const notifications = [
    { id: 1, title: 'Đơn hàng mới', message: 'Bàn 05 vừa gọi thêm 2 món mới.', time: '2 phút trước', type: 'order', isUnread: true },
    { id: 2, title: 'Yêu cầu thanh toán', message: 'Bàn 02 yêu cầu thanh toán hóa đơn.', time: '5 phút trước', type: 'payment', isUnread: true },
    { id: 3, title: 'Bàn đặt trước', message: 'Khách hàng Nguyễn Văn A sắp đến (Bàn 08).', time: '15 phút trước', type: 'reservation', isUnread: true },
    { id: 4, title: 'Hệ thống', message: 'Cập nhật phiên bản mới thành công.', time: '1 giờ trước', type: 'system', isUnread: false },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'order': return '🍵';
      case 'payment': return '💳';
      case 'reservation': return '📅';
      default: return '🔔';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'order': return '#10B981';
      case 'payment': return '#F59E0B';
      case 'reservation': return '#3B82F6';
      default: return '#64748B';
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.content, isTablet && styles.contentTablet]}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.title}>Thông báo</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>3 mới</Text></View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {notifications.map((item) => (
              <View key={item.id} style={[styles.item, item.isUnread && styles.itemUnread]}>
                <View style={[styles.iconWrap, { backgroundColor: getColor(item.type) + '15' }]}>
                  <Text style={styles.icon}>{getIcon(item.type)}</Text>
                </View>
                <View style={styles.textContainer}>
                  <View style={styles.row}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                  <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                </View>
                {item.isUnread && <View style={styles.unreadDot} />}
              </View>
            ))}
          </ScrollView>

          <Pressable style={styles.footer} onPress={onClose}>
            <Text style={styles.footerText}>Đánh dấu tất cả là đã đọc</Text>
          </Pressable>
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
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  contentTablet: {
    width: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    padding: 12,
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  itemUnread: {
    backgroundColor: '#F8FAFC',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  time: {
    fontSize: 12,
    color: '#94A3B8',
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default NotificationModal;
