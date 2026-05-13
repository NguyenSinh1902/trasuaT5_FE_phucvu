import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, TextInput, StatusBar, useWindowDimensions
} from 'react-native';
import styles from './ProductDetail.styles';
import AISuggestionModal from './components/AISuggestionModal';
import LinearGradient from 'react-native-linear-gradient';

import productApi from '../../api/productApi';

const ICE_LEVELS = ['Không đá', 'Ít đá', 'Mặc định', 'Nhiều đá'];
const SUGAR_LEVELS = ['0%', '50%', '70%', '100%'];

const ProductDetail = ({ onNavigate, product, table, isTakeaway, invoiceId, reservation, onAddToCart, existingItem, isTabletPopup, onClosePopup }) => {
  const [toppings, setToppings] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(existingItem?.variant?.idBienThe || product?.danhSachBienThe?.[0]?.idBienThe);
  const [selectedIce, setSelectedIce] = useState(existingItem?.ice || 'Mặc định');
  const [selectedSugar, setSelectedSugar] = useState(existingItem?.sugar || '50%');
  const [selectedToppings, setSelectedToppings] = useState(existingItem?.toppings?.map(t => t.idSanPham) || []);
  const [quantity, setQuantity] = useState(existingItem?.quantity || 1);
  const [note, setNote] = useState(existingItem?.note || '');
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    fetchToppings();
  }, []);

  const fetchToppings = async () => {
    try {
      const res = await productApi.getToppings();
      const toppingsData = Array.isArray(res) ? res : (res.data || []);
      setToppings(toppingsData);
    } catch (err) {
      console.error('Failed to fetch toppings:', err);
    }
  };

  if (!product) return null;

  const variants = product.danhSachBienThe || [];
  const selectedVariant = variants.find(v => v.idBienThe === selectedVariantId) || variants[0];

  const toggleTopping = (id) => {
    setSelectedToppings(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  // Helper: calculate actual price after discount
  const getActualPrice = (variant) => {
    if (!variant) return 0;
    const discount = variant.phanTramGiamGia || 0;
    return variant.giaBan * (1 - discount / 100);
  };

  const totalPrice = useMemo(() => {
    const base = getActualPrice(selectedVariant);
    const toppingsExtra = selectedToppings.reduce((sum, id) => {
      const t = toppings.find(item => item.idSanPham === id);
      const toppingPrice = t?.danhSachBienThe?.[0]?.giaBan || 0;
      return sum + toppingPrice;
    }, 0);
    return (base + toppingsExtra) * quantity;
  }, [selectedVariant, selectedToppings, quantity, toppings]);

  const handleBack = () => onNavigate('OrderMenu', { table, isTakeaway, invoiceId, reservation });

  const handleConfirm = () => {
    const cartItem = {
      idSanPham: product.idSanPham,
      tenSanPham: product.tenSanPham,
      duongDanAnh: product.duongDanAnh,
      variant: selectedVariant,
      ice: selectedIce,
      sugar: selectedSugar,
      toppings: selectedToppings.map(id => {
        const t = toppings.find(item => item.idSanPham === id);
        return {
          idSanPham: t.idSanPham,
          tenSanPham: t.tenSanPham,
          price: t.danhSachBienThe?.[0]?.giaBan || 0,
          idBienThe: t.danhSachBienThe?.[0]?.idBienThe
        };
      }),
      quantity,
      price: totalPrice / quantity,
      total: totalPrice,
      note,
      product: product, // Save full product object for offline editing
      replaceId: existingItem?.id // Use this to replace instead of add in App.jsx
    };
    onAddToCart && onAddToCart(cartItem);
    if (!isTabletPopup) {
      onNavigate('OrderMenu', { table, isTakeaway, invoiceId, reservation });
    }
  };

  const handleAISuggestionsUpdate = (aiSelectedIds, allSuggestionIds) => {
    setSelectedToppings(prev => {
      // Remove any previously selected items that belong to AI suggestions 
      // (this resets their state to whatever AI modal returned)
      let next = prev.filter(id => !allSuggestionIds.includes(id));
      
      // Add the currently selected ones from AI modal back in
      aiSelectedIds.forEach(id => {
        if (!next.includes(id)) {
          next.push(id);
        }
      });
      return next;
    });
    setShowAI(false);
  };

  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const renderTabletLayout = () => {
    return (
      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.75)', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.5)" translucent />

        <View style={{ width: '92%', maxWidth: 1000, height: '90%', maxHeight: 760, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24, overflow: 'hidden', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 20 }}>

          {/* LEFT PANE (35%) */}
          <View style={{ flex: 3.5, backgroundColor: '#FFFFFF', borderRightWidth: 1, borderColor: '#F1F5F9', padding: 28 }}>
            <Pressable style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center' }} onPress={onClosePopup || handleBack}>
              <Text style={{ fontSize: 24, color: '#64748B', marginRight: 8 }}>✕</Text>
              <Text style={{ fontSize: 16, color: '#64748B', fontWeight: 'bold' }}>Đóng</Text>
            </Pressable>

            <View style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8, marginBottom: 24 }}>
              <Image source={{ uri: product.duongDanAnh || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' }}
                style={{ width: '100%', aspectRatio: 1, borderRadius: 20 }} resizeMode="cover" />
            </View>

            <Text style={{ fontSize: 32, fontWeight: '900', color: '#1E293B', marginBottom: 8 }}>{product.tenSanPham}</Text>
            
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#15803D', marginRight: 8 }} />
                <Text style={{ fontSize: 12, color: '#14532D', fontWeight: '800' }}>
                  Số lượng tồn kho: {selectedVariant?.soLuongTonKho === -1 ? 'Không giới hạn' : (selectedVariant?.soLuongTonKho || 0)}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 13, color: '#94A3B8', lineHeight: 18, fontStyle: 'italic', marginBottom: 24 }} numberOfLines={4}>
              {product.moTa || 'Hương trà xanh dịu nhẹ hòa cùng vị sữa ngọt vừa phải, tạo nên cảm giác thơm ngon và dễ uống.'}
            </Text>

            <View style={{ height: 0.5, backgroundColor: '#E2E8F0', marginBottom: 20, marginTop: 'auto' }} />

            {/* UNIT PRICE with TAG */}
            {(() => {
              const discount = selectedVariant?.phanTramGiamGia || 0;
              const originalPrice = selectedVariant?.giaBan || 0;
              const actualPrice = getActualPrice(selectedVariant);
              return (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '900', marginRight: 8, flexShrink: 0, textTransform: 'uppercase' }}>Đơn giá</Text>
                    <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, color: '#166534', fontWeight: '900' }}>{selectedVariant?.tenKichCo?.toUpperCase() || 'MẶC ĐỊNH'}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 40, fontWeight: '900', color: '#14532D' }}>
                      {new Intl.NumberFormat('vi-VN').format(actualPrice)}đ
                    </Text>
                    {discount > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginBottom: 8 }}>
                        <Text style={{ fontSize: 18, color: '#CBD5E1', textDecorationLine: 'line-through', marginRight: 8 }}>
                          {new Intl.NumberFormat('vi-VN').format(originalPrice)}
                        </Text>
                        <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: '#F87171', fontSize: 12, fontWeight: '900' }}>-{discount}%</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })()}
          </View>

          {/* RIGHT PANE (65%) */}
          <View style={{ flex: 6.5, backgroundColor: '#F8FAFC' }}>
            <ScrollView contentContainerStyle={{ padding: 32, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>

              {/* Size Selection */}
              <View style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={[styles.sectionTitle, { fontSize: 22, color: '#0F172A' }]}>Chọn Size {existingItem ? '(Chỉnh sửa)' : ''}</Text>
                <View style={{ backgroundColor: '#FEF9C3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 }}>
                  <Text style={{ color: '#854D0E', fontSize: 10, fontWeight: '900' }}>Bắt buộc</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 48 }}>
                {variants.map(v => {
                  const isActive = selectedVariantId === v.idBienThe;
                  const discount = v.phanTramGiamGia || 0;
                  const actualPrice = v.giaBan * (1 - discount / 100);
                  return (
                    <View key={v.idBienThe} style={{ flex: 1, minWidth: 100, alignItems: 'center' }}>
                      <Pressable
                        style={{
                          width: '100%', height: 52, justifyContent: 'center', alignItems: 'center',
                          borderRadius: 14, borderWidth: isActive ? 0 : 1,
                          backgroundColor: isActive ? 'transparent' : '#FFFFFF',
                          borderColor: '#E2E8F0',
                          shadowColor: isActive ? '#4CAF50' : '#000', shadowOpacity: isActive ? 0.25 : 0.05, 
                          shadowRadius: isActive ? 8 : 5, shadowOffset: { width: 0, height: isActive ? 4 : 2 }, elevation: isActive ? 6 : 2,
                          overflow: 'hidden'
                        }}
                        onPress={() => setSelectedVariantId(v.idBienThe)}
                      >
                        {isActive ? (
                          <LinearGradient colors={['#8BA367', '#064E3B']} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF', textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>{v.tenKichCo}</Text>
                          </LinearGradient>
                        ) : (
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#475569' }}>{v.tenKichCo}</Text>
                        )}
                      </Pressable>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: isActive ? '#064E3B' : '#8BA367' }}>
                          {new Intl.NumberFormat('vi-VN').format(actualPrice)}đ
                        </Text>
                        {discount > 0 && (
                          <>
                            <Text style={{ fontSize: 12, color: '#CBD5E1', textDecorationLine: 'line-through' }}>
                              {new Intl.NumberFormat('vi-VN').format(v.giaBan)}
                            </Text>
                            <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
                              <Text style={{ color: '#F87171', fontSize: 9, fontWeight: '900' }}>-{discount}%</Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>

              {/* Ice Level */}
              <View style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={[styles.sectionTitle, { fontSize: 22, color: '#0F172A' }]}>Chọn Mức Đá</Text>
                <View style={{ backgroundColor: '#FEF9C3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 }}>
                  <Text style={{ color: '#854D0E', fontSize: 10, fontWeight: '900' }}>Bắt buộc</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 48 }}>
                {ICE_LEVELS.map(level => {
                  const isActive = selectedIce === level;
                  return (
                    <Pressable
                      key={level}
                      style={{
                        flex: 1, minWidth: 90, height: 52, justifyContent: 'center', alignItems: 'center',
                        borderRadius: 14, borderWidth: isActive ? 0 : 1,
                        backgroundColor: isActive ? 'transparent' : '#FFFFFF',
                        borderColor: '#E2E8F0',
                        shadowColor: isActive ? '#4CAF50' : '#000', shadowOpacity: isActive ? 0.25 : 0.05, 
                        shadowRadius: isActive ? 8 : 5, shadowOffset: { width: 0, height: isActive ? 4 : 2 }, elevation: isActive ? 6 : 2,
                        overflow: 'hidden'
                      }}
                      onPress={() => setSelectedIce(level)}
                    >
                      {isActive ? (
                        <LinearGradient colors={['#8BA367', '#064E3B']} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF', textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>{level}</Text>
                        </LinearGradient>
                      ) : (
                        <Text style={{ fontSize: 16, fontWeight: '500', color: '#475569' }}>{level}</Text>
                      )}
                    </Pressable>
                  )
                })}
              </View>

              {/* Sugar Level */}
              <View style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={[styles.sectionTitle, { fontSize: 22, color: '#0F172A' }]}>Chọn Mức Đường</Text>
                <View style={{ backgroundColor: '#FEF9C3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 }}>
                  <Text style={{ color: '#854D0E', fontSize: 10, fontWeight: '900' }}>Bắt buộc</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 48 }}>
                {SUGAR_LEVELS.map(level => {
                  const isActive = selectedSugar === level;
                  return (
                    <Pressable
                      key={level}
                      style={{
                        flex: 1, minWidth: 90, height: 52, justifyContent: 'center', alignItems: 'center',
                        borderRadius: 14, borderWidth: isActive ? 0 : 1,
                        backgroundColor: isActive ? 'transparent' : '#FFFFFF',
                        borderColor: '#E2E8F0',
                        shadowColor: isActive ? '#4CAF50' : '#000', shadowOpacity: isActive ? 0.25 : 0.05, 
                        shadowRadius: isActive ? 8 : 5, shadowOffset: { width: 0, height: isActive ? 4 : 2 }, elevation: isActive ? 6 : 2,
                        overflow: 'hidden'
                      }}
                      onPress={() => setSelectedSugar(level)}
                    >
                      {isActive ? (
                        <LinearGradient colors={['#8BA367', '#064E3B']} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF', textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>{level}</Text>
                        </LinearGradient>
                      ) : (
                        <Text style={{ fontSize: 16, fontWeight: '500', color: '#475569' }}>{level}</Text>
                      )}
                    </Pressable>
                  )
                })}
              </View>

              {/* Toppings */}
              <View style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={[styles.sectionTitle, { fontSize: 22, color: '#0F172A' }]}>Thêm Toppings</Text>
                <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#475569', fontSize: 11, fontWeight: '700' }}>Không bắt buộc</Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 32 }}>
                {toppings.map((t, idx) => {
                  const isActive = selectedToppings.includes(t.idSanPham);
                  const toppingPrice = t.danhSachBienThe?.[0]?.giaBan || 0;
                  return (
                    <Pressable key={t.idSanPham} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: idx === toppings.length - 1 ? 0 : 1, borderBottomColor: '#F1F5F9' }} onPress={() => toggleTopping(t.idSanPham)}>
                      <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: isActive ? '#8BA367' : '#CBD5E1', backgroundColor: isActive ? '#8BA367' : 'transparent', marginRight: 16, alignItems: 'center', justifyContent: 'center' }}>
                        {isActive && <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>✓</Text>}
                      </View>
                      <Text style={{ flex: 1, fontSize: 17, color: '#1E293B', fontWeight: isActive ? '700' : '500' }}>{t.tenSanPham}</Text>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: isActive ? '#064E3B' : '#94A3B8' }}>
                        +{new Intl.NumberFormat('vi-VN').format(toppingPrice)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Note */}
              <View style={[styles.sectionHeader, { paddingHorizontal: 0, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={[styles.sectionTitle, { fontSize: 22, color: '#0F172A' }]}>Ghi chú</Text>
                <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#475569', fontSize: 11, fontWeight: '700' }}>Không bắt buộc</Text>
                </View>
              </View>
              <TextInput
                style={{ backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 20, paddingTop: 16, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0', height: 80, textAlignVertical: 'top', marginBottom: 24 }}
                placeholder="Ví dụ: Ít ngọt, thêm thìa..."
                placeholderTextColor="#94A3B8"
                multiline
                value={note}
                onChangeText={setNote}
              />

              {/* Quantity + Clear Selection Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 4 }}>
                  <Pressable style={{ width: 44, height: 44, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Text style={{ fontSize: 24, fontWeight: '600', color: '#64748B' }}>−</Text>
                  </Pressable>
                  <Text style={{ width: 60, textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#1E293B' }}>{quantity}</Text>
                  <Pressable style={{ width: 44, height: 44, backgroundColor: '#ECFCCB', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} onPress={() => setQuantity(quantity + 1)}>
                    <Text style={{ fontSize: 24, fontWeight: '600', color: '#8BA367' }}>+</Text>
                  </Pressable>
                </View>

                <Pressable style={{ marginLeft: 24, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, borderWidth: 2, borderColor: '#FECDD3', backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center' }} onPress={() => {
                  setSelectedVariantId(variants[0]?.idBienThe);
                  setSelectedIce('Mặc định');
                  setSelectedSugar('50%');
                  setSelectedToppings([]);
                  setQuantity(1);
                  setNote('');
                }}>
                  <Text style={{ color: '#E11D48', fontSize: 15, fontWeight: '700' }}>Xóa lựa chọn</Text>
                </Pressable>
              </View>

            </ScrollView>

            {/* TABLET BOTTOM BAR - BALANCED DUAL BUTTONS */}
            <View style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, 
              backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#F1F5F9', 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomRightRadius: 24 
            }}>

              {/* TOTAL PRICE BUTTON (flex: 1) */}
              <View style={{ 
                flex: 1, backgroundColor: '#FFFFFF', height: 64, paddingHorizontal: 20, borderRadius: 14, 
                borderWidth: 2, borderColor: '#81C784', marginHorizontal: 8,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
              }}>
                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 }}>Tạm tính</Text>
                <Text style={{ fontSize: 26, fontWeight: '900', color: '#14532D' }} numberOfLines={1}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
              </View>

              {/* CONFIRM BUTTON (flex: 1) */}
              <Pressable 
                style={{ 
                  flex: 1, height: 64, marginHorizontal: 8, borderRadius: 14, overflow: 'hidden',
                  shadowColor: '#1B5E20', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8 
                }} 
                onPress={handleConfirm}
              >
                <LinearGradient colors={['#8BA367', '#064E3B']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                    {existingItem ? 'Lưu thay đổi' : 'Xác nhận món'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Floating AI Button fixed to bottom right of scroll pane */}
            <Pressable style={{ position: 'absolute', bottom: 130, right: 32, width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFBEB', borderWidth: 2, borderColor: '#FDE68A', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 15, zIndex: 999 }} onPress={() => setShowAI(true)}>
              <Text style={{ fontSize: 32 }}>🤖</Text>
            </Pressable>
          </View>
        </View>
        {/* AI Suggestion Modal */}
        <AISuggestionModal 
          visible={showAI} 
          table={table} 
          product={product} 
          allToppings={toppings}
          currentSelectedToppings={selectedToppings}
          onClose={() => setShowAI(false)} 
          onAdd={handleAISuggestionsUpdate} 
        />
      </View>
    );
  };

  if (isTablet) return renderTabletLayout();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#7E9B5D" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header with Curved Image Wrapper */}
        <View style={styles.headerContainer}>
          <View style={styles.headerBg} />
          <View style={styles.imageWrapper}>
            <Image source={{ uri: product.duongDanAnh || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' }} style={styles.productImage} resizeMode="cover" />
          </View>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backBtnArrow}>‹</Text>
          </Pressable>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.tenSanPham}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.descText}>
              {product.moTa || 'Hương trà xanh dịu nhẹ hòa cùng vị sữa ngọt vừa phải, tạo nên cảm giác thơm ngon và dễ uống.'}
            </Text>
            <View style={styles.vDivider} />
            <View style={styles.basePriceGroup}>
              <Text style={styles.basePriceLabel}>Giá: </Text>
              <Text style={styles.basePriceValue}>{new Intl.NumberFormat('vi-VN').format(selectedVariant?.giaBan || 0)} VND</Text>
            </View>
          </View>
        </View>

        <View style={styles.hDivider} />

        {/* Size Selection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chọn Size {existingItem ? '(Chỉnh sửa)' : ''}</Text>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredIcon}>⚠️</Text>
            <Text style={styles.requiredText}>Chọn 1</Text>
          </View>
        </View>
        <View style={styles.sizeTrack}>
          {variants.map(v => (
            <Pressable
              key={v.idBienThe}
              style={[styles.sizeBtn, selectedVariantId === v.idBienThe && styles.sizeBtnActive]}
              onPress={() => setSelectedVariantId(v.idBienThe)}>
              <Text style={[styles.sizeText, selectedVariantId === v.idBienThe && styles.sizeTextActive]}>{v.tenKichCo}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.sizePriceRow}>
          {variants.map(v => (
            <View key={v.idBienThe} style={styles.sizePriceItem}>
              <Text style={[styles.sizePriceText, selectedVariantId === v.idBienThe && styles.sizePriceTextActive]}>
                {new Intl.NumberFormat('vi-VN').format(v.giaBan)}
              </Text>
            </View>
          ))}
        </View>

        {/* Ice Level */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chọn Mức Đá</Text>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredIcon}>⚠️</Text>
            <Text style={styles.requiredText}>Chọn 1</Text>
          </View>
        </View>
        <View style={styles.optionRow}>
          {ICE_LEVELS.map(level => (
            <Pressable
              key={level}
              style={[styles.optionBtn, selectedIce === level && styles.optionBtnActive]}
              onPress={() => setSelectedIce(level)}>
              <Text style={[styles.optionBtnText, selectedIce === level && styles.optionBtnTextActive]}>{level}</Text>
            </Pressable>
          ))}
        </View>

        {/* Sugar Level */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chọn Mức Đường</Text>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredIcon}>⚠️</Text>
            <Text style={styles.requiredText}>Chọn 1</Text>
          </View>
        </View>
        <View style={styles.optionRow}>
          {SUGAR_LEVELS.map(level => (
            <Pressable
              key={level}
              style={[styles.optionBtn, selectedSugar === level && styles.optionBtnActive]}
              onPress={() => setSelectedSugar(level)}>
              <Text style={[styles.optionBtnText, selectedSugar === level && styles.optionBtnTextActive]}>{level}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.hDivider} />

        {/* Toppings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thêm Toppings</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>Không bắt buộc</Text>
          </View>
        </View>
        <View style={styles.toppingList}>
          {toppings.map(t => {
            const isActive = selectedToppings.includes(t.idSanPham);
            const toppingPrice = t.danhSachBienThe?.[0]?.giaBan || 0;
            return (
              <Pressable key={t.idSanPham} style={styles.toppingItem} onPress={() => toggleTopping(t.idSanPham)}>
                <View style={[styles.checkbox, isActive && styles.checkboxActive]} />
                <View style={[styles.toppingBox, isActive && styles.toppingBoxActive]}>
                  <Text style={[styles.toppingName, isActive && styles.toppingNameActive]}>{t.tenSanPham}</Text>
                </View>
                <Text style={[styles.toppingPrice, isActive && styles.toppingPriceActive]}>
                  +{new Intl.NumberFormat('vi-VN').format(toppingPrice)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.hDivider} />

        {/* Note */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lưu ý</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>Không bắt buộc</Text>
          </View>
        </View>
        <TextInput
          style={styles.noteInput}
          placeholder="Nhập thông tin..."
          placeholderTextColor="#6C6C6C"
          multiline
          value={note}
          onChangeText={setNote}
        />

        {/* Quantity Stepper */}
        <View style={styles.qtyContainer}>
          <View style={styles.qtyTrack}>
            <Pressable style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Text style={styles.qtyBtnText}>−</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <Pressable style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
          </View>
          <Pressable style={styles.aiIconBtn} onPress={() => setShowAI(true)}>
            <Text style={styles.aiIcon}>🤖</Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        visible={showAI}
        table={table}
        product={product}
        allToppings={toppings}
        currentSelectedToppings={selectedToppings}
        onClose={() => setShowAI(false)}
        onAdd={handleAISuggestionsUpdate}
      />

      {/* Bottom Summary Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.summaryRow}>
          <View style={styles.totalPriceGroup}>
            <Text style={styles.totalPriceLabel}>Tổng tiền tạm tính</Text>
            <Text style={styles.totalPriceValue}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
          <Pressable style={styles.resetBtn} onPress={() => {
            setSelectedVariantId(variants[0]?.idBienThe);
            setSelectedIce('Mặc định');
            setSelectedSugar('50%');
            setSelectedToppings([]);
            setQuantity(1);
            setNote('');
          }}>
            <Text style={styles.resetText}>Xóa lựa chọn</Text>
          </Pressable>
        </View>
        <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
          <LinearGradient
            colors={['#8BA367', '#064E3B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}
          >
            <Text style={styles.confirmText}>{existingItem ? 'Lưu thay đổi' : 'Xác nhận món'}</Text>
            <Text style={styles.confirmIcon}>✔️</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

export default ProductDetail;
