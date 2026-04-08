import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, StatusBar, Image, FlatList, ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './OrderMenu.styles';

import categoryApi from '../../api/categoryApi';
import productApi from '../../api/productApi';

// ===================== PRODUCT CARD =====================
const ProductCard = ({ item, onNavigate, table, isTakeaway, invoiceId, reservation }) => {
  // Get the base price from the first variant
  const baseVariant = item.danhSachBienThe?.[0];
  const price = baseVariant ? new Intl.NumberFormat('vi-VN').format(baseVariant.giaBan) + '₫' : '---₫';
  const discount = baseVariant?.phanTramGiamGia > 0 ? `-${baseVariant.phanTramGiamGia}%` : null;
  const imageUri = item.duongDanAnh || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';

  const navigateToDetail = () => {
    onNavigate && onNavigate('ProductDetail', { 
      product: item, 
      table, 
      isTakeaway, 
      invoiceId,
      reservation
    });
  };

  return (
    <View style={styles.productCard}>
      <Pressable
        onPress={navigateToDetail}
        style={styles.productImageWrap}>
        <LinearGradient
          colors={['#000', 'rgba(17,16,16,0.99)', '#CFCFCF']}
          start={{ x: 0.15, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.productImageGradient}>
          <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
        </LinearGradient>
        {discount && (
          <LinearGradient colors={['#CACACA', '#113FF8']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={styles.productBadge}>
            <Text style={styles.productBadgeText}>{discount}</Text>
          </LinearGradient>
        )}
        <Pressable style={styles.addBtn} onPress={navigateToDetail}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </Pressable>
      <Text style={styles.productName} numberOfLines={2}>{item.tenSanPham}</Text>
      <Text style={styles.productPrice}>{price}</Text>
    </View>
  );
};

// ===================== PROMO CARD =====================
const PromoCard = ({ gradient, badge, title, subtitle, btnText, btnColor }) => (
  <LinearGradient colors={gradient} style={styles.promoCard}>
    <View style={styles.promoBadge}><Text style={styles.promoBadgeText}>{badge}</Text></View>
    <Text style={styles.promoTitle}>{title}</Text>
    <Text style={styles.promoSubtitle}>{subtitle}</Text>
    <Pressable style={[styles.promoCta, { backgroundColor: btnColor }]}>
      <Text style={[styles.promoCtaText, { color: gradient[0].includes('FE9') ? '#EC003F' : '#9810FA' }]}>{btnText}</Text>
    </Pressable>
  </LinearGradient>
);

// ===================== MAIN SCREEN =====================
const OrderMenu = ({ onNavigate, table, isTakeaway, invoiceId, reservation, cartCount }) => {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [categories, setCategories] = useState([{ idDanhMuc: 'all', tenDanhMuc: 'Tất Cả', emoji: '📋' }]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catRes, homeRes] = await Promise.all([
        categoryApi.getAll(),
        productApi.getHome()
      ]);

      const catData = Array.isArray(catRes) ? catRes : (catRes.data || []);
      const emojis = ['🧋', '🍵', '☕', '🎉', '🥤', '🍰'];
      const formattedCats = [
        { idDanhMuc: 'all', tenDanhMuc: 'Tất Cả', emoji: '📋' },
        ...catData.map((c, i) => ({ ...c, emoji: emojis[i % emojis.length] }))
      ];
      setCategories(formattedCats);

      const homeData = homeRes || {};
      const initialSections = [
        { id: 'hot', title: 'Sản Phẩm Hot 🔥', products: homeData.sanPhamHot || [] },
        { id: 'promo', title: 'Khuyến Mãi Khủng 🏷️', products: homeData.sanPhamGiamGia || [] },
        { id: 'new', title: 'Sản Phẩm Mới ✨', products: homeData.sanPhamMoi || [] },
      ];
      setSections(initialSections);
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = async (catId) => {
    setActiveCat(catId);
    if (catId === 'all') {
      fetchInitialData();
      return;
    }

    setLoading(true);
    try {
      const res = await productApi.getByCategory(catId);
      const catName = categories.find(c => c.idDanhMuc === catId)?.tenDanhMuc || '';
      const products = Array.isArray(res) ? res : (res.data || []);
      setSections([{ id: catId, title: catName, products }]);
    } catch (err) {
      console.error('Failed to fetch category products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = query.trim() === ''
    ? sections
    : sections.map(s => ({
        ...s,
        products: s.products.filter(p => p.tenSanPham.toLowerCase().includes(query.toLowerCase()))
      })).filter(s => s.products.length > 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#1A1A1A', '#0F1A0F']} style={styles.bg} />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => onNavigate && onNavigate('TableMap')}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{isTakeaway ? 'MANG VỀ' : (table?.name?.toUpperCase() ?? 'BÀN')}</Text>
        <Pressable style={styles.cartBtn} onPress={() => onNavigate && onNavigate('OrderSummary', { table, isTakeaway, invoiceId, reservation })}>
          <Text style={styles.cartBtnText}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
          )}
        </Pressable>
      </View>

      {/* ===== SEARCH ===== */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#8BA367"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <Pressable style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </Pressable>
      </View>

      {/* ===== CATEGORIES ===== */}
      <View style={styles.catRow}>
        {categories.map(c => {
          const isActive = activeCat === c.idDanhMuc;
          return (
            <Pressable key={c.idDanhMuc} style={styles.catItem} onPress={() => handleCategoryPress(c.idDanhMuc)}>
              <View style={[
                styles.catCircle,
                isActive && styles.catCircleActive,
              ]}>
                <Text style={[styles.catEmoji, isActive && styles.catEmojiActive]}>{c.emoji}</Text>
              </View>
              <Text style={[styles.catLabel, isActive && styles.catLabelActive]} numberOfLines={1}>{c.tenDanhMuc}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading && (
          <ActivityIndicator size="large" color="#8BA367" style={{ marginTop: 50 }} />
        )}
        {/* ===== PROMO BANNER ===== */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerScroll}>
          <PromoCard
            gradient={['#FE9A00', '#FF2056']}
            badge="Khuyến mãi"
            title="Mua 1 Tặng 1"
            subtitle="Trà Đào Cam Sả (Size L)"
            btnText="Thêm ngay"
            btnColor="white"
          />
          <PromoCard
            gradient={['#9810FA', '#4F39F6', '#2B7FFF']}
            badge="HOT DEAL"
            title="Giảm 50%"
            subtitle="Cà Phê Sữa Đá & Bánh Mì"
            btnText="Đặt hàng"
            btnColor="white"
          />
        </ScrollView>

        {/* ===== PRODUCT SECTIONS ===== */}
        {!loading && filteredSections.map(section => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
              data={section.products}
              keyExtractor={item => `${section.id}-${item.idSanPham}`}
              renderItem={({ item }) => <ProductCard item={item} onNavigate={onNavigate} table={table} isTakeaway={isTakeaway} invoiceId={invoiceId} reservation={reservation} />}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
            />
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default OrderMenu;
