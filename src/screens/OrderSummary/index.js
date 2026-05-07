import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, StatusBar, Animated, PanResponder, Dimensions, Modal, Alert, ActivityIndicator
} from 'react-native';

const { width } = Dimensions.get('window');
import LinearGradient from 'react-native-linear-gradient';
import styles from './OrderSummary.styles';

import orderApi from '../../api/orderApi';
import productApi from '../../api/productApi';

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

const OrderItem = ({ item, onUpdateQty, onDelete, onEdit }) => {
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
        <Pressable style={styles.editBtn} onPress={() => onEdit && onEdit(item)}>
          <Text style={styles.editIcon}>📝</Text>
        </Pressable>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</Text>
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

const OrderSummary = ({ onNavigate, table, isTakeaway, invoiceId, reservation, cart, onUpdateQty, onRemove, onClear }) => {
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const items = cart || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleEdit = (item) => {
    if (!item.product) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin sản phẩm này.');
      return;
    }

    onNavigate('ProductDetail', {
      product: item.product,
      table,
      isTakeaway,
      invoiceId,
      reservation,
      existingItem: item
    });
  };

  const handleOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng chọn món trước khi đặt.');
      return;
    }

    setSubmitting(true);
    try {
      // Tìm ID Phiếu Đặt ở mọi nơi có thể
      const idPhieuDat = reservation ||
        table?.reservation?.idPhieuDat ||
        table?.idPhieuDat ||
        table?.idPhieuDatTemp;

      const loaiDonHang = isTakeaway ? "MANG_VE" : "TAI_BAN";

      if (!isTakeaway && !idPhieuDat) {
        // Debug thử xem tại sao không có ID
        console.log('DEBUG - Order Params:', { isTakeaway, reservation, tableId: table?.idBan, hasResObj: !!table?.reservation });
        Alert.alert('Lỗi', `Không tìm thấy ID Phiếu Đặt Bàn cho ${table?.tenBan || 'bàn này'}. Vui lòng thử mở lại bàn.`);
        setSubmitting(false);
        return;
      }

      const payload = {
        request: {
          idNhanVien: 3,
          idPhieuDat: idPhieuDat || null,
          loaiDonHang: loaiDonHang,
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

      if (invoiceId) {
        await orderApi.addItemsToInvoice(invoiceId, payload.chiTiets);
      } else if (idPhieuDat) {
        const allInvoicesRes = await orderApi.getAll();
        const allInvoices = Array.isArray(allInvoicesRes) ? allInvoicesRes : (allInvoicesRes.data || []);
        const activeInvoice = allInvoices.find(inv =>
          inv.idPhieuDat === idPhieuDat &&
          inv.trangThai !== 'DA_THANH_TOAN' &&
          inv.trangThai !== 'DA_HUY'
        );

        if (activeInvoice) {
          await orderApi.addItemsToInvoice(activeInvoice.idHoaDon, payload.chiTiets);
        } else {
          await orderApi.createOrder(payload);
        }
      } else {
        await orderApi.createOrder(payload);
      }

      onClear && onClear();
      setOrderSuccess(true);
    } catch (err) {
      console.error('Order Submit Error Details:', err.response?.data || err.message);
      setOrderError('Có lỗi xảy ra khi xử lý hóa đơn. Vui lòng thử lại.');
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
          <Pressable style={styles.backBtn} onPress={() => onNavigate('OrderMenu', { table, isTakeaway, invoiceId, reservation })}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Đơn của {table?.tenBan || 'Giao đi'}</Text>
        </View>

        {/* Section Title */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Tóm Tắt Đơn Hàng</Text>
          <Pressable style={styles.addItemBtn} onPress={() => onNavigate('OrderMenu', { table, isTakeaway, invoiceId, reservation })}>
            <Text style={styles.addItemIcon}>✚</Text>
            <Text style={styles.addItemText}>Thêm Món</Text>
          </Pressable>
        </View>

        {/* Order List */}
        <View style={styles.itemList}>
          {items.map(item => (
            <OrderItem key={item.id} item={item} onUpdateQty={onUpdateQty} onDelete={onRemove} onEdit={handleEdit} />
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

      {/* SUCCESS MODAL */}
      <Modal visible={orderSuccess} transparent animationType="fade" statusBarTranslucent>
         <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#FFFFFF', width: 340, borderRadius: 24, padding: 32, alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 10 }}>
               <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 40 }}>✅</Text>
               </View>
               <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 }}>Thành công!</Text>
               <Text style={{ fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 28 }}>Đã gửi lệnh pha chế cho quầy.</Text>
               
               <Pressable 
                  style={({pressed}) => [{ width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => {
                     setOrderSuccess(false);
                     if (onNavigate) onNavigate('TableMap');
                  }}
               >
                 <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} />
                 <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Quay lại Sơ đồ</Text>
               </Pressable>
            </View>
         </View>
      </Modal>

      {/* ERROR MODAL */}
      <Modal visible={!!orderError} transparent animationType="fade" statusBarTranslucent>
         <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#FFFFFF', width: 340, borderRadius: 24, padding: 32, alignItems: 'center' }}>
               <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 40 }}>❌</Text>
               </View>
               <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 }}>Lỗi đặt món</Text>
               <Text style={{ fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 28 }}>{orderError}</Text>
               
               <Pressable 
                  style={({pressed}) => [{ width: '100%', paddingVertical: 16, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => setOrderError(null)}
               >
                 <Text style={{ color: '#475569', fontSize: 16, fontWeight: '700' }}>Đóng lại</Text>
               </Pressable>
            </View>
         </View>
      </Modal>
      
      {/* FULL SCREEN SUBMITTING LOADING OVERLAY */}
      <Modal visible={submitting} transparent animationType="fade" statusBarTranslucent>
         <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 32, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 }}>
               <ActivityIndicator size="large" color="#10B981" />
               <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '700', color: '#1E293B' }}>Đang lưu đơn hàng...</Text>
            </View>
         </View>
      </Modal>

    </View>
  );
};

export default OrderSummary;
