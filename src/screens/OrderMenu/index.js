import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, StatusBar, Image, ActivityIndicator, useWindowDimensions, StyleSheet, Animated, PanResponder, LayoutAnimation, UIManager, Platform, Modal
} from 'react-native';

// LayoutAnimation is natively supported on New Architecture (RN 0.84+)
import LinearGradient from 'react-native-linear-gradient';

import categoryApi from '../../api/categoryApi';
import promotionApi from '../../api/promotionApi';
import productApi from '../../api/productApi';
import orderApi from '../../api/orderApi';
import ProductDetail from '../ProductDetail';

const EMOJIS = ['🧋', '🍵', '☕', '🎉', '🥤', '🍰'];

const ProductCard = ({ item, onNavigate, table, isTakeaway, invoiceId, reservation, selected = false }) => {
  // Find variant with highest discount
  const maxDiscountVariant = item.danhSachBienThe?.reduce((best, cur) => {
    return (cur.phanTramGiamGia || 0) > (best.phanTramGiamGia || 0) ? cur : best;
  }, item.danhSachBienThe?.[0] || {});
  const hasDiscount = (maxDiscountVariant?.phanTramGiamGia || 0) > 0;

  // Final price after discount
  const finalPrice = maxDiscountVariant?.giaBan
    ? new Intl.NumberFormat('vi-VN').format(
      Math.round(maxDiscountVariant.giaBan * (1 - (maxDiscountVariant.phanTramGiamGia || 0) / 100))
    ) + '₫'
    : '---₫';

  // Original price (shown only when discount exists)
  const originalPrice = hasDiscount && maxDiscountVariant?.giaBan
    ? new Intl.NumberFormat('vi-VN').format(maxDiscountVariant.giaBan) + '₫'
    : null;

  const isValidUrl = item.duongDanAnh && item.duongDanAnh !== 'null' && String(item.duongDanAnh).trim() !== '' && String(item.duongDanAnh).startsWith('http');
  const imageSource = isValidUrl ? { uri: item.duongDanAnh } : require('../../assets/images/trasuamatcha.png');

  const navigateToDetail = () => {
    const params = { product: item, table, isTakeaway, invoiceId, reservation, existingItem: null };
    onNavigate && onNavigate('ProductDetail', params);
  };

  const isSelected = selected;
  const gradientColors = isSelected
    ? ['#8BA367', '#15803D']
    : ['#FFFFFF', '#F1F8E9'];

  return (
    <Pressable onPress={navigateToDetail}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={isSelected ? s.cardGradient : s.productCard}
      >
        {/* Image */}
        <View style={s.productImageWrap}>
          <Image source={imageSource} style={s.productImage} resizeMode="cover" />
          {hasDiscount && (
            <View style={s.discountTag}>
              <Text style={s.discountTagText}>-{maxDiscountVariant.phanTramGiamGia}%</Text>
            </View>
          )}
        </View>
        {/* Info */}
        <View style={s.productInfo}>
          <View>
            <Text style={s.productName} numberOfLines={2}>{item.tenSanPham}</Text>
            <Text style={s.productSubtitle} numberOfLines={1}>{item.moTa || 'Hương vị trà sữa truyền thống thơm béo...'}</Text>
          </View>
          <View style={s.productPriceRow}>
            <View style={s.priceColumn}>
              <Text style={s.productPrice}>{finalPrice}</Text>
              {hasDiscount && originalPrice && (
                <Text style={s.productOriginalPrice}>{originalPrice}</Text>
              )}
            </View>
            {/* Smaller + button */}
            <Pressable onPress={navigateToDetail} style={s.addButtonWrapper}>
              <LinearGradient
                colors={['#8BA367', '#15803D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.addButton}
              >
                <Text style={s.addButtonText}>+</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const CartItem = React.memo(({ item, index, onUpdateQty, onRemove, onEdit }) => {
  const [swipeAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(1));
  const [isDeleting, setIsDeleting] = useState(false);
  const isEven = index % 2 === 0;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0 && gestureState.dx > -150) {
        swipeAnim.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -50) {
        Animated.spring(swipeAnim, { toValue: -80, useNativeDriver: true, tension: 40, friction: 5 }).start();
      } else {
        Animated.spring(swipeAnim, { toValue: 0, useNativeDriver: true, tension: 40, friction: 5 }).start();
      }
    },
  });

  const deleteOpacity = swipeAnim.interpolate({
    inputRange: [-60, -30, 0],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  const deleteScale = swipeAnim.interpolate({
    inputRange: [-100, -80, -40, 0],
    outputRange: [1.2, 1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(swipeAnim, { toValue: -600, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsDeleting(true);
      setTimeout(() => onRemove(item.id), 50);
    });
  };

  if (isDeleting) return null;

  return (
    <Animated.View style={[s.cartItemWrap, { opacity: opacityAnim }]}>
      <Animated.View style={[s.cartItemDeleteBg, { opacity: deleteOpacity }]}>
        <Pressable style={s.cartItemDeleteBtn} onPress={handleDelete}>
          <Animated.View style={{ transform: [{ scale: deleteScale }], alignItems: 'center' }}>
            <Text style={{ fontSize: 22, color: 'white' }}>🗑️</Text>
            <Text style={{ fontSize: 10, color: 'white', fontWeight: 'bold', marginTop: 4 }}>Xóa</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
      <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX: swipeAnim }] }}>
        <Pressable
          style={({ pressed }) => [
            s.cartItemContainer,
            { backgroundColor: pressed ? '#D1FAE5' : (isEven ? '#FFFFFF' : '#F1F8E9') }
          ]}
          onPress={() => onEdit(item)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ fontWeight: '800', color: '#1E293B', fontSize: 16, flexShrink: 1, lineHeight: 22, marginRight: 8 }} numberOfLines={2}>
                {item.product?.tenSanPham || item.tenSanPham}
              </Text>
              <View style={{ padding: 4, backgroundColor: '#FEF3C7', borderRadius: 8 }}>
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </View>
            </View>
            <Text style={{ fontWeight: '900', color: '#059669', fontSize: 16, marginLeft: 12 }}>
              {(item.price * item.quantity).toLocaleString()}đ
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 13, color: '#64748B', flex: 1, marginRight: 16, lineHeight: 18 }} numberOfLines={2}>
              {item.variant?.tenKichCo || item.size || 'Size M'}, {item.ice || 'Kh. đá'}, {item.sugar || 'Kh. đường'}
              {item.toppings?.length > 0 && `\n+ ${item.toppings.map(t => t.tenSanPham || 'Topping').join(', ')}`}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Pressable hitSlop={10} style={s.qtyCartBtn} onPress={(e) => { e.stopPropagation(); onUpdateQty && onUpdateQty(item.id, -1); }}>
                <Text style={{ color: '#475569', fontWeight: 'bold', fontSize: 16 }}>−</Text>
              </Pressable>
              <Text style={{ color: '#059669', fontSize: 18, fontWeight: '900', width: 34, textAlign: 'center' }}>{item.quantity}</Text>
              <Pressable hitSlop={10} style={s.qtyCartBtnAdd} onPress={(e) => { e.stopPropagation(); onUpdateQty && onUpdateQty(item.id, 1); }}>
                <Text style={{ color: '#059669', fontWeight: 'bold', fontSize: 16 }}>+</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

const OrderMenu = ({ onNavigate, table, isTakeaway, invoiceId, reservation, cartCount, cart, onUpdateQty, onRemove, onClear, onAddToCart }) => {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [categories, setCategories] = useState([{ idDanhMuc: 'all', tenDanhMuc: 'Khám Phá', emoji: '🌟' }]);
  const [promotions, setPromotions] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [emptyCartAlert, setEmptyCartAlert] = useState(false);

  // Right pane state using locally provided cart
  const [tabletPopupData, setTabletPopupData] = useState(null);
  const items = cart || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (items.length > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true })
      ]).start();
    }
  }, [items.length, pulseAnim]);

  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOrder = async () => {
      if (items.length === 0) {
        setEmptyCartAlert(true);
        return;
      }

      setSubmitting(true);
      const submitOrder = async () => {
        try {
          const idPhieuDat = reservation || table?.reservation?.idPhieuDat || table?.idPhieuDat || table?.idPhieuDatTemp;
          const loaiDonHang = isTakeaway ? "MANG_VE" : "TAI_BAN";

          if (!isTakeaway && !idPhieuDat) {
            setOrderError(`Không tìm thấy ID Phiếu Đặt Bàn cho bàn này. Vui lòng thử mở lại bàn.`);
            setSubmitting(false);
            return;
          }

          const payload = {
            request: { idNhanVien: 3, idPhieuDat: idPhieuDat || null, loaiDonHang, idKhachHang: null, thueSuat: 0.08 },
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
            const activeInvoice = allInvoices.find(inv => inv.idPhieuDat === idPhieuDat && inv.trangThai !== 'DA_THANH_TOAN' && inv.trangThai !== 'DA_HUY');
            if (activeInvoice) await orderApi.addItemsToInvoice(activeInvoice.idHoaDon, payload.chiTiets);
            else await orderApi.createOrder(payload);
          } else {
            await orderApi.createOrder(payload);
          }

          if (onClear) onClear();
          setOrderSuccess(true);
        } catch (err) {
          console.error(err);
          setOrderError('Có lỗi xảy ra khi xử lý hóa đơn.');
        } finally {
          setSubmitting(false);
        }
      }
      submitOrder();
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catRes, homeRes, promoRes] = await Promise.all([
        categoryApi.getAll(), 
        productApi.getHome(),
        promotionApi.getActive().catch(() => [])
      ]);
      
      const promoData = promoRes.data || promoRes || [];
      setPromotions(promoData);

      const catData = Array.isArray(catRes) ? catRes : (catRes.data || []);
      const formattedCats = [
        { idDanhMuc: 'all', tenDanhMuc: 'Khám Phá', emoji: '🌟' },
        ...catData.map((c, i) => ({ ...c, emoji: EMOJIS[i % EMOJIS.length] }))
      ];
      setCategories(formattedCats);

      const homeData = homeRes || {};
      setSections([
        { id: 'hot', title: 'Sản Phẩm Hot 🔥', products: homeData.sanPhamHot || [] },
        { id: 'promo', title: 'Khuyến Mãi Khủng 🏷️', products: homeData.sanPhamGiamGia || [] },
        { id: 'new', title: 'Sản Phẩm Mới ✨', products: homeData.sanPhamMoi || [] },
      ]);
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = async (catId) => {
    setActiveCat(catId);
    if (catId === 'all') { fetchInitialData(); return; }

    setLoading(true);
    try {
      const res = await productApi.getByCategory(catId);
      const catName = categories.find(c => c.idDanhMuc === catId)?.tenDanhMuc || '';
      setSections([{ id: catId, title: catName, products: Array.isArray(res) ? res : (res.data || []) }]);
    } catch (err) {
      console.error('Failed to fetch category products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = query.trim() === ''
    ? sections
    : sections.map(s => ({ ...s, products: s.products.filter(p => p.tenSanPham.toLowerCase().includes(query.toLowerCase())) }))
      .filter(s => s.products.length > 0);

  const renderSidebar = () => (
    <View style={s.sidebar}>
      <Pressable
        style={s.sidebarBackBtn}
        onPress={() => onNavigate && onNavigate('TableMap')}
      >
        <Text style={{ fontSize: 44, color: '#475569', fontWeight: '300', marginTop: -6 }}>‹</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 40 }} style={{ width: '100%' }}>
        {categories.map(c => {
          const isActive = activeCat === c.idDanhMuc;
          const content = (
            <>
              <Text style={{ fontSize: 26, marginBottom: 6, opacity: isActive ? 1 : 0.4 }}>{c.emoji}</Text>
              <Text style={[s.catSidebarText, isActive && s.catSidebarTextActive]} numberOfLines={2}>
                {c.tenDanhMuc}
              </Text>
            </>
          );

          if (isActive) {
            return (
              <Pressable key={c.idDanhMuc} onPress={() => handleCategoryPress(c.idDanhMuc)}>
                <LinearGradient
                  colors={['#8BA367', '#15803D']} // 45 degree diagonal gradient matching checkout
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.catSidebarItem}
                >
                  {content}
                </LinearGradient>
              </Pressable>
            );
          }

          return (
            <Pressable key={c.idDanhMuc} onPress={() => handleCategoryPress(c.idDanhMuc)}
              style={s.catSidebarItem}>
              {content}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const handleEdit = (item) => {
    if (!item.product) return;
    const params = { product: item.product, table, isTakeaway, invoiceId, reservation, existingItem: item };
    if (isTablet) setTabletPopupData(params);
    else onNavigate('ProductDetail', params);
  };

  const handleCardNavigate = (screen, params) => {
    if (isTablet && screen === 'ProductDetail') {
      setTabletPopupData(params);
    } else {
      onNavigate(screen, params);
    }
  };

  const renderCart = () => {
    const hasItems = items.length > 0;
    return (
      <View style={s.cartSidebar}>
        <Text style={s.cartTitle}>Giỏ Hàng {table?.tenBan || table?.name ? `(${table.tenBan || table.name})` : ''}</Text>
        <Text style={s.cartSubtitle}>{isTakeaway ? 'Đơn mang về' : 'Chọn món hiện tại'} 📝</Text>

        {hasItems ? (
          <ScrollView style={{ flex: 1, marginTop: 12 }} showsVerticalScrollIndicator={false}>
            {items.map((item, idx) => (
              <CartItem key={item.id || idx} index={idx} item={item} onUpdateQty={onUpdateQty} onRemove={onRemove} onEdit={handleEdit} />
            ))}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 60, marginBottom: 20, opacity: 0.5 }}>🛒</Text>
            <Text style={{ color: '#94A3B8', fontWeight: '600', fontSize: 16 }}>Chưa có món nào chọn</Text>
          </View>
        )}

        <View style={s.cartFooter}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, color: '#64748B', fontWeight: '600' }}>Tạm tính:</Text>
            <Text style={{ fontSize: 24, color: '#D97706', fontWeight: '900' }}>{subtotal.toLocaleString()}đ</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              disabled={submitting}
              onPress={handleOrder}
              style={({ pressed }) => [
                { opacity: (submitting || pressed) ? 0.8 : 1 }
              ]}
            >
              <LinearGradient
                colors={['#8BA367', '#15803D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.checkoutBtn}
              >
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={s.checkoutBtnText}>Gửi đơn + {items.length} món</Text>}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* THREE PANE LAYOUT (Tablet) OR STACKED (Phone) */}
      <View style={{ flex: 1, flexDirection: isTablet ? 'row' : 'column' }}>

        {/* PANE 1: SIDEBAR */}
        {isTablet && renderSidebar()}

        {/* PANE 2: CENTER DASHBOARD */}
        <View style={s.centerPane}>

          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: '#064E3B' }}>
                {table?.tenBan || table?.name || 'Bàn 01'} 🪑
              </Text>
              <Text style={{ fontSize: 13, color: '#064E3B', fontWeight: '600', marginTop: 4, opacity: 0.7 }}>
                {new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date())}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={s.searchWrap}>
                <Text style={{ fontSize: 18, color: '#064E3B', marginRight: 10 }}>🔍</Text>
                <TextInput
                  style={s.searchInput}
                  placeholder="Tìm món ngon..."
                  placeholderTextColor="#064E3B80"
                  value={query} onChangeText={setQuery}
                />
              </View>
              <Pressable style={s.filterBtn}>
                <View style={{ gap: 4, alignItems: 'center' }}>
                  <View style={{ width: 18, height: 1.5, backgroundColor: '#064E3B', borderRadius: 1 }} />
                  <View style={{ width: 12, height: 1.5, backgroundColor: '#064E3B', borderRadius: 1 }} />
                  <View style={{ width: 6, height: 1.5, backgroundColor: '#064E3B', borderRadius: 1 }} />
                </View>
              </Pressable>
            </View>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 120 }}>

            {/* BANNER PROMO */}
            {activeCat !== 'all' && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={{ marginBottom: 20, height: 150 }} 
                contentContainerStyle={{ alignItems: 'center' }}
              >
                <LinearGradient colors={['#ECFCCB', '#D1FAE5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.bannerCard, { marginRight: 16 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#047857', fontWeight: '900', fontSize: 13, marginBottom: 6, letterSpacing: 0.5 }}>CHÀO MỪNG BẠN</Text>
                    <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 24, marginBottom: 6 }}>Thưởng Thức Trà Ngon</Text>
                    <Text style={{ color: '#475569', fontSize: 14 }}>Nhiều ưu đãi đang chờ bạn!</Text>
                  </View>
                  <Text style={{ fontSize: 56, marginLeft: 20 }}>🧋</Text>
                </LinearGradient>
                
                {promotions.map((p, idx) => (
                  <LinearGradient 
                    key={p.idKhuyenMai || idx}
                    colors={idx % 2 === 0 ? ['#FEF3C7', '#FEF08A'] : ['#E0F2FE', '#BAE6FD']} 
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} 
                    style={[s.bannerCard, { marginRight: 16 }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: idx % 2 === 0 ? '#B45309' : '#0369A1', fontWeight: '900', fontSize: 13, marginBottom: 6, letterSpacing: 0.5 }}>KHUYẾN MÃI HÔM NAY</Text>
                      <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 24, marginBottom: 6 }}>
                        {p.loaiKhuyenMai === 'GIAM_PHAN_TRAM' ? `Giảm ${p.giaTriGiam}%` : `Giảm ${p.giaTriGiam?.toLocaleString()}đ`}
                      </Text>
                      <Text style={{ color: '#475569', fontSize: 14 }}>
                        Nhập mã: {p.maCode} | Đơn từ {p.donToiThieu?.toLocaleString()}đ
                      </Text>
                    </View>
                    <Text style={{ fontSize: 56, marginLeft: 20 }}>{idx % 2 === 0 ? '🎁' : '🔥'}</Text>
                  </LinearGradient>
                ))}
              </ScrollView>
            )}

            {loading ? <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 100 }} /> :
              filteredSections.map(section => (
                <View key={section.id} style={{ marginBottom: 40 }}>
                  <Text style={s.sectionTitle}>{section.title}</Text>
                  <View style={s.productGrid}>
                    {section.products.map(item => (
                      <View key={item.idSanPham} style={[s.productGridItem, { width: isTablet ? '23%' : '47%' }]}>
                        <ProductCard item={item} onNavigate={handleCardNavigate} table={table} isTakeaway={isTakeaway} invoiceId={invoiceId} reservation={reservation} />
                      </View>
                    ))}
                  </View>
                </View>
              ))
            }
          </ScrollView>
        </View>

        {/* PANE 3: CART */}
        {isTablet ? renderCart() : (
          <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
            <Pressable style={s.floatingCart} onPress={() => onNavigate && onNavigate('OrderSummary', { table, isTakeaway, invoiceId, reservation })}>
              <Text style={{ fontSize: 24 }}>🛒</Text>
              {(items.length > 0) && (
                <View style={s.floatingCartBadge}>
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>{items.length}</Text>
                </View>
              )}
            </Pressable>
          </View>
        )}

      </View>

      {/* INLINE PRODUCT DETAIL MODAL FOR TABLET */}
      {isTablet && tabletPopupData && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 9999 }}>
          <ProductDetail
            {...tabletPopupData}
            isTabletPopup={true}
            onClosePopup={() => setTabletPopupData(null)}
            onAddToCart={(item) => {
              if (onAddToCart) onAddToCart(item);
              setTabletPopupData(null);
            }}
          />
        </View>
      )}

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
              style={({ pressed }) => [{ width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
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
              style={({ pressed }) => [{ width: '100%', paddingVertical: 16, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
              onPress={() => setOrderError(null)}
            >
              <Text style={{ color: '#475569', fontSize: 16, fontWeight: '700' }}>Đóng lại</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* EMPTY CART MODAL */}
      <Modal visible={emptyCartAlert} transparent animationType="fade" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#FFFFFF', width: 340, borderRadius: 24, padding: 32, alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 40 }}>🛒</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 }}>Giỏ hàng rỗng</Text>
            <Text style={{ fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 28 }}>Vui lòng chọn món trước khi đặt.</Text>

            <Pressable
              style={({ pressed }) => [{ width: '100%', paddingVertical: 16, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
              onPress={() => setEmptyCartAlert(false)}
            >
              <Text style={{ color: '#475569', fontSize: 16, fontWeight: '700' }}>Đã hiểu</Text>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  sidebar: { width: 110, backgroundColor: '#FFFFFF', borderRightWidth: 1, borderColor: '#F1F5F9', paddingTop: 24, alignItems: 'center' },
  sidebarBackBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },

  catSidebarItem: { width: 84, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 20, alignSelf: 'center' },
  catSidebarItemActive: {}, // controlled by gradient now

  catSidebarText: { fontSize: 12, fontWeight: '600', color: '#94A3B8', textAlign: 'center', paddingHorizontal: 4 },
  catSidebarTextActive: { color: '#FFFFFF', fontWeight: '800' },

  centerPane: { flex: 1, backgroundColor: '#F5F7F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7F8',
    borderBottomWidth: 0.5,
    borderBottomColor: '#A5D6A780',
    zIndex: 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  searchWrap: { width: 300, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 100, paddingHorizontal: 20, height: 48, borderWidth: 1, borderColor: '#A5D6A7' },
  searchInput: { flex: 1, color: '#064E3B', fontSize: 14, fontWeight: '600' },
  filterBtn: { width: 48, height: 48, borderRadius: 100, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#A5D6A7' },

  bannerCard: { flexDirection: 'row', alignItems: 'center', width: 380, borderRadius: 28, padding: 24, height: 130 },

  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: '2%' },
  productGridItem: { marginBottom: 20 },

  // Card container (default) – glassmorphism style (Solid white to fix artifacts)
  productCard: { borderRadius: 24, padding: 12, paddingBottom: 16, shadowColor: '#000', shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, borderWidth: 0.5, borderColor: '#E2E8F0' },
  // Gradient background for selected card (45° diagonal)
  cardGradient: { borderRadius: 24, padding: 12, paddingBottom: 16, shadowColor: '#15803D', shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8, borderWidth: 1, borderColor: '#15803D' },
  productImageWrap: { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: 'transparent', marginBottom: 10 },
  productImage: { width: '100%', height: '100%' },
  // Discount tag displayed on top‑left of image when there is a discount
  discountTag: { position: 'absolute', top: 12, left: 12, backgroundColor: '#E11D48', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discountTagText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  // Add button (gradient) wrapper – smaller size
  addButtonWrapper: { width: 36, height: 36, borderRadius: 8, overflow: 'hidden' },
  addButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  // Price column for price & original price
  priceColumn: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' },
  productOriginalPrice: { fontSize: 13, color: '#9CA3AF', textDecorationLine: 'line-through', marginTop: 2 },

  productInfo: { paddingHorizontal: 4, flex: 1, paddingTop: 2 },
  productName: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 2, height: 44, lineHeight: 22 },
  productSubtitle: { fontSize: 12, color: '#94A3B8', marginBottom: 2, height: 16 },
  productPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingBottom: 2 },
  productPrice: { fontSize: 18, fontWeight: '900', color: '#15803D' },

  cartSidebar: { width: 340, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderLeftWidth: 1, borderColor: '#E2E8F0', padding: 24, paddingTop: 40 },
  cartTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  cartSubtitle: { fontSize: 16, fontWeight: '700', color: '#059669', marginBottom: 16 },

  cartItemWrap: { position: 'relative', marginBottom: 16, marginHorizontal: 2 },
  cartItemDeleteBg: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '100%', backgroundColor: '#E11D48', borderRadius: 16, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 20 },
  cartItemDeleteBtn: { padding: 12, alignItems: 'center' },
  cartItemContainer: { padding: 16, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, borderWidth: 0.5, borderColor: '#D1FAE5' },

  qtyCartBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  qtyCartBtnAdd: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  cartFooter: { marginTop: 'auto', paddingTop: 24, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  checkoutBtn: { borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#052e16', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },

  floatingCart: { width: 64, height: 64, backgroundColor: '#FFFFFF', borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 6 }
});

export default OrderMenu;
