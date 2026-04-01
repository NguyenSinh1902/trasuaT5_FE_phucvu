import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, TextInput, StatusBar,
} from 'react-native';
import styles from './ProductDetail.styles';
import AISuggestionModal from './components/AISuggestionModal';

import productApi from '../../api/productApi';

const ICE_LEVELS = ['Không đá', 'Ít đá', 'Mặc định', 'Nhiều đá'];
const SUGAR_LEVELS = ['0%', '50%', '70%', '100%'];

const ProductDetail = ({ onNavigate, product, table, isTakeaway, invoiceId, onAddToCart, existingItem }) => {
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

  const totalPrice = useMemo(() => {
    const base = selectedVariant?.giaBan || 0;
    const toppingsExtra = selectedToppings.reduce((sum, id) => {
      const t = toppings.find(item => item.idSanPham === id);
      const toppingPrice = t?.danhSachBienThe?.[0]?.giaBan || 0;
      return sum + toppingPrice;
    }, 0);
    return (base + toppingsExtra) * quantity;
  }, [selectedVariant, selectedToppings, quantity, toppings]);

  const handleBack = () => onNavigate('OrderMenu', { table, isTakeaway, invoiceId });
  
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
    onNavigate('OrderMenu', { table, isTakeaway, invoiceId });
  };

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
        onClose={() => setShowAI(false)}
        onAdd={() => setShowAI(false)}
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
          <Text style={styles.confirmText}>{existingItem ? 'Lưu thay đổi' : 'Xác nhận món'}</Text>
          <Text style={styles.confirmIcon}>✔️</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProductDetail;
