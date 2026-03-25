import React from 'react';
import {
  View, Text, Modal, Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../ProductDetail.styles';

const AISuggestionModal = ({ visible, onClose, onAdd }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.aiModalBackdrop} onPress={onClose}>
        <View style={styles.aiModalContainer}>
          <View style={styles.aiModalHandle} />

          {/* Header */}
          <View style={styles.aiHeaderRow}>
            <LinearGradient colors={['#FEF3C6', '#FFD6A8']} style={styles.aiHeaderIconWrap}>
              <Text style={styles.aiHeaderIcon}>⚠️</Text>
            </LinearGradient>
            <View style={styles.aiHeaderTextWrap}>
              <Text style={styles.aiHeaderTitle}>Gợi ý thông minh</Text>
              <Text style={styles.aiSubtitle}>
                Khách thường gọi thêm <Text style={styles.aiSubtitleHighlight}>Bánh Flan</Text> kèm với đơn này.
              </Text>
            </View>
          </View>

          {/* Suggestion Card */}
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionImgWrap}>
              <Text style={styles.suggestionImg}>🍮</Text>
            </View>
            <View style={styles.suggestionInfo}>
              <Text style={styles.suggestionName}>Bánh Flan Trứng</Text>
              <Text style={styles.suggestionPrice}>+15.000đ</Text>
            </View>
            <Pressable style={styles.suggestionAddBtn} onPress={onAdd}>
              <Text style={styles.suggestionAddIcon}>+</Text>
            </Pressable>
          </View>

          {/* Action Buttons */}
          <Pressable style={styles.noThanksBtn} onPress={onClose}>
            <Text style={styles.noThanksText}>Không Cảm ơn</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default AISuggestionModal;
