import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StatusBar, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageCarousel from '../../components/ImageCarousel';
import styles from './Register.styles';
import authApi from '../../api/authApi';
import { Alert, ActivityIndicator } from 'react-native';

const Register = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const response = await authApi.register({
        email,
        matKhau: password,
        hoTen: name,
        soDienThoai: phone,
        vaiTro: 'PHUC_VU' // Set vaiTro to PHUC_VU to match BE Enum
      });

      if (response.idNhanVien) {
        Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng kiểm tra mã OTP trong email.');
        onNavigate && onNavigate('VerifyOTP', { email });
      } else {
        setErrorMessage(response.message || 'Không thể tạo tài khoản');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Kết nối thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Brand Side (Left on Tablet) */}
      <View style={styles.brandSide}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1544424472-a1f9a2fbaf02?q=80&w=2670&auto=format&fit=crop' }} 
          style={styles.bgImage}
          resizeMode="cover"
          blurRadius={32}
        />
        <View style={styles.blurOverlay} />
        <View style={styles.blurOverlay} />
        <View style={styles.brandTitleWrap}>
          <View style={styles.logoRow}>
            <Text style={styles.logoIcon}>🍵</Text>
            <Text style={styles.brandTitle}>MatchTea</Text>
          </View>
          <Text style={styles.brandSubtitle}>APP NHÂN VIÊN PHỤC VỤ</Text>
        </View>
        <ImageCarousel />
      </View>

      {/* Content Form Side (Right on Tablet) */}
      <View style={styles.formSide}>
        <View style={styles.cornerBlob} pointerEvents="none" />
        <View style={styles.cornerBlob2} pointerEvents="none" />
        
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.formWrapper}>
            <Text style={styles.headerText}>Tạo Tài Khoản</Text>
            <Text style={styles.subHeaderText}>Đăng ký thông minh - Nâng tầm dịch vụ</Text>

            <View style={[styles.inputContainer, errorMessage ? { borderColor: '#FCA5A5' } : null]}>
              <Text style={styles.icon}>🏷️</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Họ và tên" 
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            <View style={[styles.inputContainer, errorMessage ? { borderColor: '#FCA5A5' } : null]}>
              <Text style={styles.icon}>✉️</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Email của bạn" 
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, errorMessage ? { borderColor: '#FCA5A5' } : null]}>
              <Text style={styles.icon}>📞</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Số điện thoại" 
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="phone-pad"
              />
            </View>

            <View style={[styles.inputContainer, errorMessage ? { borderColor: '#FCA5A5' } : null]}>
              <Text style={styles.icon}>🔒</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Mật khẩu" 
                secureTextEntry={!showPassword} 
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
              </Pressable>
            </View>

            <View style={[styles.inputContainer, errorMessage ? { borderColor: '#FCA5A5' } : null]}>
              <Text style={styles.icon}>🔑</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Xác nhận mật khẩu" 
                secureTextEntry={!showConfirmPassword} 
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIconContainer}>
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '🙈'}</Text>
              </Pressable>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable 
              style={[styles.submitBtnWrapper, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient 
                colors={['#2D5A27', '#059669']} 
                style={styles.btnGradient} 
                start={{x:0, y:0}} 
                end={{x:1, y:0}}
              >
                <Text style={styles.submitBtnText}>Đăng ký ngay</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.switchLink}>
              <Text style={styles.switchText1}>Đã có tài khoản? </Text>
              <Pressable onPress={() => onNavigate && onNavigate('Login')}>
                <Text style={styles.switchText2}>Đăng nhập thôi</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Register;
