import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, Pressable, StyleSheet, 
  useWindowDimensions, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import authApi from '../../api/authApi';

const VerifyOTP = ({ onNavigate, route }) => {
  const { email } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 700;
  const inputRef = useRef(null);

  const handleVerify = async () => {
    if (otp.length < 6) {
      Alert.alert('Thông báo', 'Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyRegister({ email, otp });
      
      if (response.message && (response.message.includes('thành công') || response.success === true)) {
        Alert.alert('Thành công', 'Xác thực thành công! Tài khoản đã sẵn sàng.');
        onNavigate && onNavigate('Login');
      } else {
        Alert.alert('Xác thực thất bại', response.message || 'Mã xác thực không chính xác');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể xác thực mã OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = otp[i] || '';
      const isFocused = otp.length === i;
      boxes.push(
        <View 
          key={i} 
          style={[
            styles.otpBox, 
            char ? styles.otpBoxFilled : null,
            isFocused ? styles.otpBoxFocused : null
          ]}
        >
          <Text style={styles.otpChar}>{char}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Image with Blur */}
      <View style={StyleSheet.absoluteFill}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1544424472-a1f9a2fbaf02?q=80&w=2670&auto=format&fit=crop' }} 
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5, 46, 22, 0.7)' }]} />
      </View>

      <View style={[styles.card, { width: isTablet ? 550 : '92%' }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.brandIcon}>🍵</Text>
        </View>

        <Text style={styles.title}>Xác thực tài khoản</Text>
        <Text style={styles.subtitle}>Vui lòng nhập mã OTP 6 chữ số đã được gửi tới:</Text>
        <Text style={styles.emailText}>{email}</Text>

        <Pressable style={styles.otpWrapper} onPress={() => inputRef.current?.focus()}>
          {renderOtpBoxes()}
        </Pressable>

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          autoFocus={true}
        />

        <Pressable 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleVerify}
          disabled={loading}
        >
          <LinearGradient 
            colors={['#166534', '#059669']} 
            style={styles.gradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Xác nhận ngay</Text>}
          </LinearGradient>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.resendText}>Chưa nhận được mã? </Text>
          <Pressable onPress={() => Alert.alert('Thông báo', 'Hệ thống đang gửi lại mã mới...')}>
            <Text style={styles.resendAction}>Gửi lại mã</Text>
          </Pressable>
        </View>

        <Pressable style={styles.backBtn} onPress={() => onNavigate('Register')}>
          <Text style={styles.backText}>← Quay lại đăng ký</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 40,
    paddingTop: 50,
    paddingBottom: 40,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: -90, // Nổi lên trên card
    borderWidth: 6,
    borderColor: '#F8FAFC',
  },
  brandIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginTop: 6,
    marginBottom: 40,
  },
  otpWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  otpBox: {
    width: 60,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFocused: {
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
    shadowColor: '#059669',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  otpChar: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  button: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 15,
    color: '#64748B',
  },
  resendAction: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669',
    textDecorationLine: 'underline',
  },
  backBtn: {
    marginTop: 32,
    padding: 10,
  },
  backText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  }
});

export default VerifyOTP;
