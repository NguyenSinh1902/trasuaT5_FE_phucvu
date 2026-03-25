import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './Login.styles';

const Login = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Linear Gradient Background */}
      <LinearGradient 
        colors={['#242928', '#49514E', '#5B605E', '#7A8A84', '#BAC8C3']}
        locations={[0.31, 0.45, 0.59, 0.78, 0.93]}
        style={styles.backgroundGradient}
      />

      {/* Text Header */}
      <Text style={styles.titleText}>MatchTea</Text>
      <Text style={styles.sloganText}>Fresh drinks, happy moments!</Text>

      {/* Glassmorphism Card */}
      <View style={styles.cardContainer}>
        
        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleActiveBackground} />
          <Pressable style={styles.toggleBtn}>
            <Text style={styles.toggleTextActive}>Đăng nhập</Text>
          </Pressable>
          <Pressable style={styles.toggleBtn} onPress={() => onNavigate && onNavigate('Register')}>
            <Text style={styles.toggleTextInactive}>Đăng ký</Text>
          </Pressable>
        </View>

        {/* Input Form using Flexbox for even spacing */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.labelText}>Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nhập email..."
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.labelText}>Mật Khẩu</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nhập mật khẩu..."
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Action Button */}
        <Pressable 
          style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.8 }]}
          onPress={() => onNavigate && onNavigate('TableMap')}
        >
          <Text style={styles.loginBtnText}>Đăng nhập</Text>
        </Pressable>

        {/* Note / Link */}
        <View style={styles.signupLinkContainer}>
          <Text style={styles.signupLinkText1}>Chưa có tài khoản? </Text>
          <Pressable onPress={() => onNavigate && onNavigate('Register')}>
            <Text style={styles.signupLinkText2}>Đăng ký</Text>
          </Pressable>
        </View>
      </View>

      {/* Footer Giant Circles */}
      <View style={styles.footerBigCircle} />
      <View style={styles.footerMidCircle} />
      <View style={styles.footerInnerCircle} />
    </View>
  );
};

export default Login;
