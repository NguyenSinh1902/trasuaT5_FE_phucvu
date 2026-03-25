import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, StatusBar, FlatList, Animated, PanResponder, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
import LinearGradient from 'react-native-linear-gradient';
import styles from './OrderSummary.styles';

import { Alert, ActivityIndicator } from 'react-native';
import orderApi from '../../api/orderApi';

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
      if (gestureState.dx < 0) swipeAnim.setValue(gestureState.dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -40) {
        Animated.spring(swipeAnim, { toValue: -80, useNativeDriver: true, bounciness: 0 }).start();
      } else {
        Animated.spring(swipeAnim, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
      }
    },
  });

  const optionsText = [
    item.variant.tenKichCo,
    item.ice,
    item.sugar,
    item.toppings.length > 0 ? `Toppings: ${item.toppings.map(t => t.tenSanPham).join(', ')}` : null
  ].filter(Boolean).join(', ');

  const imageUri = item.duongDanAnh || 'https://images.unsplash.com/photo-1544787210-2211d74fc286?w=200&q=80';

  return (
    <View style={styles.itemContainer}>
      <Pressable style={styles.deleteBtn} onPress={() => {
        Animated.timing(swipeAnim, { toValue: -width, duration: 200, useNativeDriver: true }).start(() => {
          onDelete(item.id);
        });
      }}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </Pressable>
      <Animated.View {...panResponder.panHandlers} style={[styles.itemContent, { transform: [{ translateX: swipeAnim }] }]}>
        <Image source={{ uri: imageUri }} style={styles.itemImg} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.tenSanPham}</Text>
          <Text style={styles.itemOptions}>{optionsText}</Text>
        </View>
        <Pressable style={styles.editBtn}>
          <Text style={styles.editIcon}>📝</Text>
        </Pressable>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString('vi-VN')}</Text>
          <View style={styles.qtyRow}>
            <Pressable style={styles.qtyBtn} onPress={() => onUpdateQty(item.id, -1)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </Pressable>
            <View style={styles.qtyValWrap}>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
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

const OrderSummary = ({ onNavigate, table, cart, onUpdateQty, onRemove, onClear }) => {
  const [submitting, setSubmitting] = useState(false);
  const items = cart || [];
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng chọn món trước khi đặt.');
      return;
    }

    setSubmitting(true);
    try {
      // idPhieuDat can come from the existing table reservation or the temp injected one
      const idPhieuDat = table?.reservation?.idPhieuDat || table?.idPhieuDatTemp;

      if (!idPhieuDat) {
        Alert.alert('Lỗi', 'Không tìm thấy ID Phiếu Đặt Bàn hợp lệ. Vui lòng mở lại bàn từ sơ đồ.');
        setSubmitting(false);
        return;
      }

      const payload = {
        request: {
          idNhanVien: 3,
          idPhieuDat: idPhieuDat,
          loaiDonHang: "TAI_BAN",
          idKhachHang: null,
          thueSuat: 0.08
        },
        chiTiets: items.map(item => ({
          idBienThe: item.variant.idBienThe,
          soLuong: item.quantity,
          tuyChonJson: JSON.stringify({ duong: item.sugar, da: item.ice, luuY: item.note }),
          danhSachIdTopping: item.toppings.map(t => t.idBienThe)
        }))
      };

      try {
        await orderApi.createOrder(payload);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || '';
        if (errMsg.toLowerCase().includes('cập nhật món') || errMsg.toLowerCase().includes('đã có hóa đơn') || err.response?.status === 400) {
          // Fallback to update order by finding existing invoice ID
          const allInvoicesRes = await orderApi.getAll();
          const allInvoices = Array.isArray(allInvoicesRes) ? allInvoicesRes : (allInvoicesRes.data || []);
          const activeInvoice = allInvoices.find(inv => 
             inv.idPhieuDat === idPhieuDat && 
             inv.trangThai !== 'DA_THANH_TOAN' && 
             inv.trangThai !== 'DA_HUY'
          );

          if (activeInvoice) {
             await orderApi.updateOrder(activeInvoice.idHoaDon, payload.chiTiets);
          } else {
             Alert.alert('Lỗi', 'Không tìm thấy hóa đơn đang chờ để thêm món.');
             setSubmitting(false);
             return;
          }
        } else {
          throw err;
        }
      }
      
      onClear && onClear();
      Alert.alert('Thành công', 'Đã lưu đơn hàng thành công!', [
        { text: 'OK', onPress: () => onNavigate('TableMap') }
      ]);
    } catch (err) {
      console.error('Order Submit Error:', err);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý hóa đơn. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <Text style={styles.headerTitle}>Đơn của {table?.tenBan || table?.name || 'Bàn A02'}</Text>
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
            <OrderItem key={item.id} item={item} onUpdateQty={onUpdateQty} onDelete={onRemove} />
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
        <Pressable 
          style={[styles.orderBtn, submitting && { opacity: 0.7 }]} 
          onPress={submitting ? null : handleOrder}>
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.orderBtnText}>Đặt Món</Text>
              <Text style={styles.orderBtnIcon}>›</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default OrderSummary;
