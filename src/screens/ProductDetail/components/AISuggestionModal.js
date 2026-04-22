import React, { useEffect, useRef } from 'react';
import {
  View, Text, Modal, Pressable, StatusBar, Image, Animated, Easing
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../ProductDetail.styles';

const SUGGESTION = {
  id: 1,
  name: 'Trân châu trắng',
  price: 5000,
  img: 'https://images.unsplash.com/photo-1590080873974-9a3a3028d70e?w=200',
  description: 'Khách thường chọn thêm'
};

const AISuggestionModal = ({ visible, onClose, onAdd, product }) => {
  const modalAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();
    } else {
      modalAnim.setValue(0);
    }
  }, [visible]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const modalOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.3)" translucent />
      
      <View style={styles.smartBackdrop}>
        <Animated.View style={[styles.smartContainer, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
          


          {/* HEADER SECTION */}
          <View style={styles.smartTitleWrap}>
            <Text style={styles.smartMainName}>{product?.tenSanPham || 'Matcha Latte'}</Text>
            <Text style={styles.smartSubTitle}>Sẽ ngon hơn nếu thêm 1 chút topping...</Text>
          </View>
          
          {/* INTERACTIVE HORIZONTAL CARD */}
          <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
            <Pressable 
              style={styles.horizontalToppingCard} 
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => onAdd(SUGGESTION)}
            >
              <View style={styles.toppingImgWrap}>
                <Image source={{ uri: SUGGESTION.img }} style={styles.toppingImg} resizeMode="cover" />
              </View>
              
              <View style={styles.toppingInfo}>
                <Text style={styles.toppingName}>{SUGGESTION.name}</Text>
                <Text style={styles.toppingAdvice}>{SUGGESTION.description}</Text>
              </View>

              <Text style={styles.toppingPriceLabel}>+{SUGGESTION.price.toLocaleString()}đ</Text>
            </Pressable>
          </Animated.View>

          {/* MAIN ACTION BUTTON */}
          <Pressable style={styles.finalConfirmBtn} onPress={() => onAdd(SUGGESTION)}>
            <LinearGradient
              colors={['#8BA367', '#064E3B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.finalConfirmGradient}
            >
              <Text style={styles.finalConfirmText}>THÊM VÀO ĐƠN</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.finalSkipBtn} onPress={onClose}>
            <Text style={styles.finalSkipText}>Bỏ qua</Text>
          </Pressable>

        </Animated.View>
      </View>
    </Modal>
  );
};

export default AISuggestionModal;
