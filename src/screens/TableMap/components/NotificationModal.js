import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Modal, Pressable, StyleSheet,
  ScrollView, useWindowDimensions,
} from 'react-native';
import safeAsyncStorage from '../../../utils/storage';

// Key cố định — không per-user để tránh mất dữ liệu khi currentUser chưa load xong
const NOTI_KEY = 'app_notifications';

/**
 * Thêm một thông báo mới vào storage (gọi từ bên ngoài component)
 * @param {object} noti - { title, message, type }
 */
export async function pushNotification(noti) {
  try {
    const raw = await safeAsyncStorage.getItem(NOTI_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const newItem = {
      id: Date.now().toString(),
      title: noti.title,
      message: noti.message,
      type: noti.type || 'system',
      time: Date.now(),
      isUnread: true,
    };
    const updated = [newItem, ...existing].slice(0, 50);
    await safeAsyncStorage.setItem(NOTI_KEY, JSON.stringify(updated));
  } catch (e) {
    console.log('[Noti] pushNotification error:', e?.message);
  }
}

const getIcon = (type) => {
  switch (type) {
    case 'order': return '🍵';
    case 'payment': return '✅';
    case 'cancelled': return '🚨';
    default: return '🔔';
  }
};

const getColor = (type) => {
  switch (type) {
    case 'order': return '#10B981';
    case 'payment': return '#3B82F6';
    case 'cancelled': return '#EF4444';
    default: return '#64748B';
  }
};

const formatTime = (timestamp) => {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

const NotificationModal = ({ isVisible, onClose, userId }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      const raw = await safeAsyncStorage.getItem(NOTI_KEY);
      setNotifications(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    if (isVisible) loadNotifications();
  }, [isVisible, loadNotifications]);

  const markAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, isUnread: false }));
    setNotifications(updated);
    await safeAsyncStorage.setItem(NOTI_KEY, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => n.isUnread).length;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.content, isTablet && styles.contentTablet]}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.title}>Thông báo</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount} mới</Text>
                </View>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
              </View>
            ) : (
              notifications.map((item) => (
                <View key={item.id} style={[styles.item, item.isUnread && styles.itemUnread]}>
                  <View style={[styles.iconWrap, { backgroundColor: getColor(item.type) + '18' }]}>
                    <Text style={styles.icon}>{getIcon(item.type)}</Text>
                  </View>
                  <View style={styles.textContainer}>
                    <View style={styles.row}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.time}>{formatTime(item.time)}</Text>
                    </View>
                    <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                  </View>
                  {item.isUnread && <View style={styles.unreadDot} />}
                </View>
              ))
            )}
          </ScrollView>

          {notifications.length > 0 && (
            <Pressable style={styles.footer} onPress={markAllRead}>
              <Text style={styles.footerText}>Đánh dấu tất cả là đã đọc</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
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
    shadowOpacity: 0.15,
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
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  item: {
    flexDirection: 'row',
    padding: 14,
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
    marginRight: 14,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#94A3B8',
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 10,
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
