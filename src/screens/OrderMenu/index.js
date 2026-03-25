import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, StatusBar, Image, FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './OrderMenu.styles';

// ===================== MOCK DATA =====================
const CATEGORIES = [
  { id: 'all', emoji: '📋', label: 'Tất Cả' },
  { id: 'matcha', emoji: '🧋', label: 'Trà Sữa\nMatchTea' },
  { id: 'classic', emoji: '🍵', label: 'Truyền\nThống' },
  { id: 'coffee', emoji: '☕', label: 'Cà Phê\n& Khác' },
  { id: 'promo', emoji: '🎉', label: 'Khuyến\nMãi' },
];

const PRODUCTS = [
  { id: 1, cat: 'matcha', name: 'Trà Sữa Matcha Trân Châu Đen', price: '45.000₫', uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { id: 2, cat: 'matcha', name: 'Trà Sữa Matcha Đậu Đỏ', price: '45.000₫', uri: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
  { id: 3, cat: 'matcha', name: 'Trà Sữa Matcha Kem Cheese', price: '52.000₫', uri: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
  { id: 4, cat: 'classic', name: 'Trà Sữa Matcha Nguyên Chất', price: '40.000₫', badge: '-20%', uri: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400' },
  { id: 5, cat: 'classic', name: 'Trà Đào Cam Sả (Peach Orange)', price: '48.000₫', badge: '-20%', uri: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400' },
  { id: 6, cat: 'coffee', name: 'Cà Phê Sữa Đá', price: '35.000₫', uri: 'https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?w=400' },
  { id: 7, cat: 'promo', name: 'Matcha Kem Cheese (-20%)', price: '42.000₫', badge: '-20%', uri: 'https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400' },
  { id: 8, cat: 'coffee', name: 'Cà Phê Đen Đá', price: '30.000₫', uri: 'https://images.unsplash.com/photo-1542897644-e04528f928e8?w=400' },
];

const SECTIONS = [
  { id: 'hot', title: 'Sản Phẩm Hot 🔥', products: PRODUCTS.slice(0, 3) },
  { id: 'promo', title: 'Khuyến Mãi Khủng 🏷️', products: PRODUCTS.slice(3, 6) },
  { id: 'best', title: 'Sản Phẩm Bán Chạy 🏆', products: PRODUCTS },
];

// ===================== PRODUCT CARD =====================
const ProductCard = ({ item, onNavigate, table }) => (
  <View style={styles.productCard}>
    <Pressable
      onPress={() => onNavigate && onNavigate('ProductDetail', { product: item, table })}
      style={styles.productImageWrap}>
      <LinearGradient
        colors={['#000', 'rgba(17,16,16,0.99)', '#CFCFCF']}
        start={{ x: 0.15, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.productImageGradient}>
        <Image source={{ uri: item.uri }} style={styles.productImage} resizeMode="cover" />
      </LinearGradient>
      {item.badge && (
        <LinearGradient colors={['#CACACA', '#113FF8']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={styles.productBadge}>
          <Text style={styles.productBadgeText}>{item.badge}</Text>
        </LinearGradient>
      )}
      <Pressable style={styles.addBtn}>
        <Text style={styles.addBtnText}>+</Text>
      </Pressable>
    </Pressable>
    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
    <Text style={styles.productPrice}>$ {item.price}</Text>
  </View>
);

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
const OrderMenu = ({ onNavigate, table }) => {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState('all');

  const filteredProducts = activeCat === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.cat === activeCat);

  const displaySections = activeCat === 'all'
    ? SECTIONS
    : [{ id: activeCat, title: CATEGORIES.find(c => c.id === activeCat)?.label?.replace('\n', ' ') ?? '', products: filteredProducts }];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#1A1A1A', '#0F1A0F']} style={styles.bg} />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => onNavigate && onNavigate('TableMap')}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{table?.name?.toUpperCase() ?? 'BÀN'}</Text>
        <Pressable style={styles.cartBtn}>
          <Text style={styles.cartBtnText}>🛒</Text>
          {cart.length > 0 && (
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cart.length}</Text></View>
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
        {CATEGORIES.map(c => {
          const isActive = activeCat === c.id;
          return (
            <Pressable key={c.id} style={styles.catItem} onPress={() => setActiveCat(c.id)}>
              <View style={[
                styles.catCircle,
                isActive && styles.catCircleActive,
              ]}>
                <Text style={[styles.catEmoji, isActive && styles.catEmojiActive]}>{c.emoji}</Text>
              </View>
              <Text style={[styles.catLabel, isActive && styles.catLabelActive]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
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
        {displaySections.map(section => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
              data={section.products}
              keyExtractor={item => `${section.id}-${item.id}`}
              renderItem={({ item }) => <ProductCard item={item} onNavigate={onNavigate} table={table} />}
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
