import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, TextInput, StatusBar,
} from 'react-native';
import styles from './ProductDetail.styles';
import AISuggestionModal from './components/AISuggestionModal';

const SIZES = [
  { id: 'S', label: 'S', extra: 0 },
  { id: 'M', label: 'M', extra: 8000 },
  { id: 'XL', label: 'XL', extra: 12000 },
  { id: '2XL', label: '2XL', extra: 16000 },
];

const ICE_LEVELS = ['Không đá', 'Ít đá', 'Mặc định', 'Nhiều đá'];
const SUGAR_LEVELS = ['0%', '50%', '70%', '100%'];
const TOPPINGS = [
  { id: 1, name: 'Trân Châu Đen (Black Boba)', price: 5000 },
  { id: 2, name: 'Trân Châu Hoàng Kim', price: 8000 },
  { id: 3, name: 'Thạch Trái Cây (Fruit Jelly)', price: 10000 },
  { id: 4, name: 'Kem Cheese (Cheese Foam)', price: 8000 },
  { id: 5, name: 'Pudding Trứng (Egg Pudding)', price: 8000 },
];

const ProductDetail = ({ onNavigate, product, table }) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedIce, setSelectedIce] = useState('Mặc định');
  const [selectedSugar, setSelectedSugar] = useState('50%');
  const [selectedToppings, setSelectedToppings] = useState([3]); // Default fruit jelly
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [showAI, setShowAI] = useState(false);

  if (!product) return null;

  const toggleTopping = (id) => {
    setSelectedToppings(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const totalPrice = useMemo(() => {
    const base = 30000; // Original price from mockup
    const sizeExtra = SIZES.find(s => s.id === selectedSize)?.extra || 0;
    const toppingsExtra = selectedToppings.reduce((sum, id) => {
      const t = TOPPINGS.find(item => item.id === id);
      return sum + (t?.price || 0);
    }, 0);
    return (base + sizeExtra + toppingsExtra) * quantity;
  }, [selectedSize, selectedToppings, quantity]);

  const handleBack = () => onNavigate('OrderMenu', { table });
  const handleConfirm = () => onNavigate('OrderSummary', { table });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#7E9B5D" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header with Curved Image Wrapper */}
        <View style={styles.headerContainer}>
          <View style={styles.headerBg} />
          <View style={styles.imageWrapper}>
            <Image source={{ uri: product.uri }} style={styles.productImage} resizeMode="cover" />
          </View>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backBtnArrow}>‹</Text>
          </Pressable>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.descText}>
              Hương trà xanh dịu nhẹ hòa cùng vị sữa ngọt vừa phải, tạo nên cảm giác thơm ngon và dễ uống.
            </Text>
            <View style={styles.vDivider} />
            <View style={styles.basePriceGroup}>
              <Text style={styles.basePriceLabel}>Giá Gốc: </Text>
              <Text style={styles.basePriceValue}>30,000 VND</Text>
            </View>
          </View>
        </View>

        <View style={styles.hDivider} />

        {/* Size Selection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chọn Size</Text>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredIcon}>⚠️</Text>
            <Text style={styles.requiredText}>Chọn 1</Text>
          </View>
        </View>
        <View style={styles.sizeTrack}>
          {SIZES.map(s => (
            <Pressable
              key={s.id}
              style={[styles.sizeBtn, selectedSize === s.id && styles.sizeBtnActive]}
              onPress={() => setSelectedSize(s.id)}>
              <Text style={[styles.sizeText, selectedSize === s.id && styles.sizeTextActive]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.sizePriceRow}>
          {SIZES.map(s => (
            <View key={s.id} style={styles.sizePriceItem}>
              <Text style={[styles.sizePriceText, selectedSize === s.id && styles.sizePriceTextActive]}>
                +{s.extra.toLocaleString('vi-VN')}
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
          {TOPPINGS.map(t => {
            const isActive = selectedToppings.includes(t.id);
            return (
              <Pressable key={t.id} style={styles.toppingItem} onPress={() => toggleTopping(t.id)}>
                <View style={[styles.checkbox, isActive && styles.checkboxActive]} />
                <View style={[styles.toppingBox, isActive && styles.toppingBoxActive]}>
                  <Text style={[styles.toppingName, isActive && styles.toppingNameActive]}>{t.name}</Text>
                </View>
                <Text style={[styles.toppingPrice, isActive && styles.toppingPriceActive]}>
                  +{t.price.toLocaleString('vi-VN')}
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
            setSelectedSize('M');
            setSelectedIce('Mặc định');
            setSelectedSugar('50%');
            setSelectedToppings([3]);
            setQuantity(1);
            setNote('');
          }}>
            <Text style={styles.resetText}>Xóa lựa chọn</Text>
          </Pressable>
        </View>
        <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Xác nhận món</Text>
          <Text style={styles.confirmIcon}>✔️</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProductDetail;
