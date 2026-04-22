import React from 'react';
import { View, Text, Pressable, Image, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageCarousel from '../../components/ImageCarousel';
import styles from './ManHinhChao.styles';

const ManHinhChao = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Brand Side (Left on Tablet) */}
      <View style={styles.brandSide}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1544424472-a1f9a2fbaf02?q=80&w=2670&auto=format&fit=crop' }} 
          style={styles.bgImage}
          resizeMode="cover"
          blurRadius={32}
        />
        <View style={styles.blurOverlay} />
        <View style={styles.brandTitleWrap}>
          <View style={styles.logoRow}>
            <Text style={styles.logoIcon}>🍵</Text>
            <Text style={styles.brandTitleLeft}>MatchTea</Text>
          </View>
          <Text style={styles.brandSubtitle}>APP NHÂN VIÊN PHỤC VỤ</Text>
        </View>
        <ImageCarousel />
      </View>

      {/* Content Side (Right on Tablet) */}
      <View style={styles.contentSide}>
        <View style={styles.cornerBlob} pointerEvents="none" />
        <View style={styles.cornerBlob2} pointerEvents="none" />
        <View style={styles.contentWrapper}>
          <Text style={styles.titleText}>MatchTea</Text>
          <Text style={styles.sloganText}>Quản lý thông minh - Nâng tầm trải nghiệm</Text>
          
          <View style={styles.buttonRow}>
            <Pressable 
              style={styles.primaryBtnWrapper} 
              onPress={() => onNavigate && onNavigate('Login')}
            >
              <LinearGradient 
                colors={['#2D5A27', '#059669']} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Đăng nhập</Text>
              </LinearGradient>
            </Pressable>

            <Pressable 
              style={styles.secondaryBtn} 
              onPress={() => onNavigate && onNavigate('Register')}
            >
              <Text style={styles.secondaryBtnText}>Đăng ký</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ManHinhChao;
