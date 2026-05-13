import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, StatusBar, ScrollView, Image, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImageCarousel from '../../components/ImageCarousel';
import styles from './ForgotPassword.styles';
import authApi from '../../api/authApi';

const ForgotPassword = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (successMessage) {
      // Hiện thông báo
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start();

      // Tự động ẩn sau 3 giây
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(toastTranslateY, { toValue: -20, duration: 300, useNativeDriver: true })
        ]).start(() => setSuccessMessage(''));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleRequestOtp = async () => {
    if (!email) {
      setErrorMessage('Vui lòng nhập email');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const response = await authApi.requestOtp(email);
      setSuccessMessage(response.message || 'Mã OTP đã được gửi về email của bạn');
      setStep(2);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const response = await authApi.resetPassword({
        email,
        otp,
        matKhauMoi: newPassword
      });
      setSuccessMessage(response.message || 'Đổi mật khẩu thành công!');

      setTimeout(() => {
        onNavigate && onNavigate('Login');
      }, 1000);
    } catch (error) {
      setErrorMessage(error.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Floating Premium Toast */}
      {successMessage ? (
        <View style={styles.toastWrapper}>
          <Animated.View style={[styles.toastContainer, { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }]}>
            <LinearGradient colors={['#DCFCE7', '#F0FDF4']} style={styles.toastGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.toastIcon}>✅</Text>
              <Text style={styles.toastText}>{successMessage}</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      ) : null}

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

            {step === 1 ? (
              <>
                <Text style={styles.headerText}>Quên mật khẩu?</Text>
                <Text style={styles.subHeaderText}>Nhập email của bạn để nhận mã OTP đặt lại mật khẩu</Text>

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

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <Pressable
                  style={[styles.submitBtnWrapper, loading && { opacity: 0.7 }]}
                  onPress={handleRequestOtp}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#2D5A27', '#059669']}
                    style={styles.btnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Gửi mã OTP</Text>}
                  </LinearGradient>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.headerText}>Đặt lại mật khẩu</Text>
                <Text style={styles.subHeaderText}>Nhập mã OTP và mật khẩu mới của bạn</Text>

                <View style={[styles.inputContainer, errorMessage ? { borderColor: '#FCA5A5' } : null]}>
                  <Text style={styles.icon}>🔢</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mã OTP (6 số)"
                    placeholderTextColor="#9CA3AF"
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text);
                      if (errorMessage) setErrorMessage('');
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <View style={[styles.inputContainer, errorMessage ? { borderColor: '#FCA5A5' } : null]}>
                  <Text style={styles.icon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu mới"
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9CA3AF"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
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
                    placeholder="Xác nhận mật khẩu mới"
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
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#2D5A27', '#059669']}
                    style={styles.btnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Xác nhận đổi mật khẩu</Text>}
                  </LinearGradient>
                </Pressable>
              </>
            )}

            <View style={styles.switchLink}>
              <Pressable onPress={() => {
                if (step === 2) {
                  setStep(1);
                } else {
                  onNavigate && onNavigate('Login');
                }
              }}>
                <Text style={styles.switchText2}>
                  {step === 2 ? '← Quay lại nhập email' : '← Quay lại đăng nhập'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;
