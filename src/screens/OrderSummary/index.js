import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, StatusBar, FlatList, Animated, PanResponder, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
import LinearGradient from 'react-native-linear-gradient';
import styles from './OrderSummary.styles';

const MOCK_ORDER = [
  {
    id: 1,
    name: 'Trà Sữa Matcha Kem Cheese',
    options: 'Ít Đá, 50% Đường, Trân Châu đen',
    price: 35000,
    qty: 1,
    uri: 'https://images.unsplash.com/photo-1544787210-2211d74fc286?w=200&q=80',
  },
  {
    id: 2,
    name: 'Trà Sữa Matcha Đậu Đỏ',
    options: 'Ít Đá, 50% Đường, Trân Châu đen',
    price: 45000,
    qty: 1,
    uri: 'https://images.unsplash.com/photo-1594631252845-29fc4586c552?w=200&q=80',
  },
  {
    id: 3,
    name: 'Trà Sữa Matcha Kem Cheese',
    options: 'Ít Đá, 50% Đường, Trân Châu đen',
    price: 58000,
    qty: 1,
    uri: 'https://images.unsplash.com/photo-1544787210-2211d74fc286?w=200&q=80',
    deleting: true, // Simulation of swipe
  },
];

const PROMOS = [
  {
    id: 1,
    type: 'HOT DEAL',
    title: 'Giảm 50%',
    subtitle: 'Cà Phê Sữa Đá & Bánh Mì',
    colors: ['#9810FA', '#4F39F6', '#2B7FFF'],
    action: 'Đặt hàng',
  },
  {
    id: 2,
    type: 'KHUYẾN MÃI',
    title: 'Mua 1 Tặng 1',
    subtitle: 'Trà Đào Cam Sả (Size L)',
    colors: ['#FE9A00', '#FF2056'],
    action: 'Thêm ngay',
  },
];

const OrderItem = ({ item, onUpdateQty, onDelete }) => {
  const [swipeAnim] = useState(new Animated.Value(0));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      // Only allow swiping to the left, max 80px
      if (gestureState.dx < 0) {
        swipeAnim.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -40) {
        // Snap to open
        Animated.spring(swipeAnim, {
          toValue: -80,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
      } else {
        // Snap back to closed
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }).start();
      }
    },
  });

  return (
    <View style={styles.itemContainer}>
      <Pressable style={styles.deleteBtn} onPress={() => {
        Animated.timing(swipeAnim, { toValue: -width, duration: 200, useNativeDriver: true }).start(() => {
          onDelete(item.id);
        });
      }}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </Pressable>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.itemContent, { transform: [{ translateX: swipeAnim }] }]}>
        <Image source={{ uri: item.uri }} style={styles.itemImg} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemOptions}>{item.options}</Text>
        </View>
        <Pressable style={styles.editBtn}>
          <Text style={styles.editIcon}>📝</Text>
        </Pressable>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}</Text>
          <View style={styles.qtyRow}>
            <Pressable style={styles.qtyBtn} onPress={() => onUpdateQty(item.id, -1)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </Pressable>
            <View style={styles.qtyValWrap}>
              <Text style={styles.qtyValue}>{item.qty}</Text>
            </View>
            <Pressable style={styles.qtyBtn} onPress={() => onUpdateQty(item.id, 1)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const OrderSummary = ({ onNavigate, table }) => {
  const [items, setItems] = useState(MOCK_ORDER);

  const handleUpdateQty = (id, delta) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7E9B5D" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.gridPattern}>
            {[...Array(20)].map((_, i) => <View key={i} style={styles.gridLine} />)}
          </View>
          <Pressable style={styles.backBtn} onPress={() => onNavigate('OrderMenu', { table })}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Đơn của {table?.name || 'Bàn A02'}</Text>
        </View>

        {/* Section Title */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Tóm Tắt Đơn Hàng</Text>
          <Pressable style={styles.addItemBtn} onPress={() => onNavigate('OrderMenu', { table })}>
            <Text style={styles.addItemIcon}>✚</Text>
            <Text style={styles.addItemText}>Thêm Món</Text>
          </Pressable>
        </View>

        {/* Order List */}
        <View style={styles.itemList}>
          {items.map(item => (
            <OrderItem key={item.id} item={item} onUpdateQty={handleUpdateQty} onDelete={handleDeleteItem} />
          ))}
        </View>

        {/* Breakdown */}
        <View style={styles.summarySection}>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng Tạm Tính:</Text>
            <Text style={styles.totalPriceValue}>{subtotal.toLocaleString('vi-VN')} VND</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Giảm giá:</Text>
            <Text style={styles.totalPriceValue}>0 VND</Text>
          </View>
        </View>

        {/* Promo Banners */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll}>
          {PROMOS.map(promo => (
            <LinearGradient key={promo.id} colors={promo.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoCard}>
              <View>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>{promo.type}</Text>
                </View>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
              </View>
              <Pressable style={styles.promoAction}>
                <Text style={styles.promoActionText}>{promo.action}</Text>
              </Pressable>
            </LinearGradient>
          ))}
        </ScrollView>

      </ScrollView>

      {/* Bottom Fixed Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.finalTotalWrap}>
          <Text style={styles.finalTotalLabel}>Tổng Tiền</Text>
          <Text style={styles.finalTotalValue}>{subtotal.toLocaleString('vi-VN')} VND</Text>
        </View>
        <Pressable style={styles.orderBtn} onPress={() => onNavigate('TableMap')}>
          <Text style={styles.orderBtnText}>Đặt Món</Text>
          <Text style={styles.orderBtnIcon}>›</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default OrderSummary;
