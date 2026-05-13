import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Modal, Pressable, StatusBar, Animated, Easing, ActivityIndicator, ScrollView, StyleSheet
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import productApi from '../../../api/productApi';

const AISuggestionModal = ({ visible, onClose, onAdd, product, allToppings }) => {
  const modalAnim = useRef(new Animated.Value(0)).current;
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (visible) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start();
      fetchSuggestions();
    } else {
      modalAnim.setValue(0);
      setSelectedIds([]);
    }
  }, [visible]);

  const fetchSuggestions = async () => {
    if (!product?.idSanPham) return;
    setLoading(true);
    try {
      const res = await productApi.getSuggestions(product.idSanPham);
      const data = Array.isArray(res) ? res : (res.data || []);
      setSuggestions(data);
      
      const suggestionIds = data.map(d => d.idSanPhamGoiY);
      const currentlySelected = suggestionIds.filter(id => currentSelectedToppings?.includes(id));
      
      if (currentlySelected.length > 0) {
        setSelectedIds(currentlySelected);
      } else if (data.length > 0) {
        // Auto-select top suggestions only if user hasn't selected any of them yet
        setSelectedIds(data.slice(0, 2).map(d => d.idSanPhamGoiY));
      } else {
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Fetch suggestions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const allSuggestionIds = suggestions.map(s => s.idSanPhamGoiY);
    onAdd(selectedIds, allSuggestionIds);
  };

  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const modalOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.4)" translucent />
      
      <View style={localStyles.backdrop}>
        <Animated.View style={[localStyles.modalContainer, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
          
          {/* HEADER SECTION */}
          <View style={localStyles.header}>
            <View style={localStyles.headerTitleRow}>
              <Text style={localStyles.robotIcon}>🤖</Text>
              <Text style={localStyles.headerTitle}>{product?.tenSanPham || 'Sản phẩm'}</Text>
            </View>
            <Text style={localStyles.headerSubtitle}>AI gợi ý các loại Toppings "chân ái" cho món này!</Text>
          </View>
          
          {/* CONTENT SECTION */}
          <View style={localStyles.contentContainer}>
            {loading ? (
              <View style={localStyles.centerContent}>
                <ActivityIndicator size="large" color="#8BA367" />
                <Text style={localStyles.loadingText}>Đang phân tích khẩu vị...</Text>
              </View>
            ) : suggestions.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                {suggestions.map((item) => {
                  const id = item.idSanPhamGoiY;
                  const isSelected = selectedIds.includes(id);
                  const toppingInfo = allToppings.find(t => t.idSanPham === id);
                  const price = toppingInfo?.danhSachBienThe?.[0]?.giaBan || 0;

                  return (
                    <Pressable 
                      key={id}
                      style={[
                        localStyles.card,
                        isSelected && localStyles.cardActive
                      ]} 
                      onPress={() => toggleSelection(id)}
                    >
                      {/* Custom Checkbox */}
                      <View style={[localStyles.checkbox, isSelected && localStyles.checkboxActive]}>
                        {isSelected && <Text style={localStyles.checkmark}>✓</Text>}
                      </View>
                      
                      <View style={localStyles.cardInfo}>
                        <Text style={[localStyles.cardTitle, isSelected && localStyles.cardTitleActive]}>
                          {item.tenSanPhamGoiY}
                        </Text>
                        <Text style={localStyles.cardDesc}>
                          {item.diemTinCay >= 1 ? 'Khách thường chọn nhất ⭐' : 'Gợi ý từ AI 🪄'}
                        </Text>
                      </View>

                      <Text style={[localStyles.cardPrice, isSelected && localStyles.cardPriceActive]}>
                        +{price.toLocaleString()}đ
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={localStyles.centerContent}>
                <Text style={localStyles.emptyIcon}>🍃</Text>
                <Text style={localStyles.emptyText}>
                  Món này đã rất hoàn hảo, AI chưa tìm thấy topping nào phù hợp hơn!
                </Text>
              </View>
            )}
          </View>

          {/* FOOTER SECTION */}
          <View style={localStyles.footer}>
            <Pressable 
              style={[localStyles.confirmBtn, loading && localStyles.btnDisabled]} 
              onPress={handleConfirm}
              disabled={loading}
            >
              <LinearGradient
                colors={['#8BA367', '#064E3B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={localStyles.gradient}
              >
                <Text style={localStyles.confirmText}>
                  {selectedIds.length > 0 ? `CẬP NHẬT ${selectedIds.length} LỰA CHỌN` : 'XÁC NHẬN'}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={localStyles.skipBtn} onPress={onClose}>
              <Text style={localStyles.skipText}>Đóng</Text>
            </Pressable>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Darker, more premium backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  robotIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#064E3B',
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  contentContainer: {
    maxHeight: 320, // Prevents overflow, makes scrollview work
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  centerContent: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardActive: {
    borderColor: '#8BA367',
    backgroundColor: '#F7FEE7',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkboxActive: {
    borderColor: '#8BA367',
    backgroundColor: '#8BA367',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardTitleActive: {
    color: '#064E3B',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
  },
  cardPriceActive: {
    color: '#059669',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmBtn: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  skipBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AISuggestionModal;
