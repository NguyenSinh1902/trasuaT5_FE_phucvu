import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StatusBar, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageCarousel from '../../components/ImageCarousel';
import styles from './Login.styles';
import authApi from '../../api/authApi';
import safeAsyncStorage from '../../utils/storage';
import { Alert, ActivityIndicator } from 'react-native';

const Login = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setErrorMessage('');

    setLoading(true);
    try {
      const response = await authApi.login({ email, matKhau: password });

      if (response.success && response.token) {
        const user = response.user;
        
        // Kiểm tra quyền: Chặn Thu ngân (Kiểm tra đa trường dữ liệu để đảm bảo chính xác)
        const userRole = user.loaiNguoiDung || user.vaiTro || user.role || '';
        if (userRole.toString().toUpperCase() === 'THU_NGAN') {
          setErrorMessage('Tài khoản Thu ngân không có quyền truy cập ứng dụng này.');
          setLoading(false);
          return;
        }

        await safeAsyncStorage.setItem('token', response.token);
        await safeAsyncStorage.setItem('user', JSON.stringify(user));

        onNavigate && onNavigate('TableMap');
      } else {
        setErrorMessage(response.message || 'Không thể đăng nhập vào hệ thống');
      }
    } catch (error) {
      // Sử dụng trường message đã được axiosClient trích xuất
      setErrorMessage(error.message || 'Kết nối máy chủ thất bại');
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

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formWrapper}>
            <Text style={styles.headerText}>Chào mừng trở lại!</Text>
            <Text style={styles.subHeaderText}>Đăng nhập để vào hệ thống ứng dụng</Text>

            <View style={[styles.inputContainer, errorMessage ? { borderColor: '#FCA5A5' } : null]}>
              <Text style={styles.icon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Tài khoản / Email"
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

            <Pressable style={styles.forgotPassword} onPress={() => onNavigate && onNavigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </Pressable>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable
              style={[styles.submitBtnWrapper, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#2D5A27', '#059669']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Đăng nhập</Text>}
              </LinearGradient>
            </Pressable>

            <View style={styles.switchLink}>
              <Text style={styles.switchText1}>Chưa có tài khoản? </Text>
              <Pressable onPress={() => onNavigate && onNavigate('Register')}>
                <Text style={styles.switchText2}>Đăng ký ngay</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;
