import React from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StatusBar,
} from 'react-native';
import styles from './ManHinhChao.styles';

const ManHinhChao = ({ navigation, onNavigate }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#49514E" translucent />

      {/* Decorative Background Blobs */}
      <View style={styles.topBgShape} />
      <View style={styles.secondaryBlob} />

      {/* Floating Bubbles */}
      <View style={styles.bubble1} />
      <View style={styles.bubble2} />
      <View style={styles.bubble3} />
      <View style={styles.bubble4} />
      <View style={styles.bubble5} />
      <View style={styles.bubble6} />
      <View style={styles.bubble7} />

      {/* Text Container */}
      <Text style={styles.titleText}>MatchTea</Text>
      <Text style={styles.sloganText}>Fresh drinks, happy moments!</Text>

      {/* Cups Images */}
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3014/3014526.png' }}
        style={styles.cupLeft}
        resizeMode="contain"
      />
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3014/3014526.png' }}
        style={styles.cupRight}
        resizeMode="contain"
      />
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3014/3014526.png' }}
        style={styles.cupCenter}
        resizeMode="contain"
      />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.primaryBtn}
          android_ripple={{ color: '#ffffff55' }}
          onPress={() => onNavigate ? onNavigate() : console.log('Navigate to Login')}
        >
          <Text style={styles.primaryBtnText}>Đăng nhập</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryBtn}
          android_ripple={{ color: '#00000015' }}
          onPress={() => onNavigate ? onNavigate() : console.log('Navigate to Register')}
        >
          <Text style={styles.secondaryBtnText}>Đăng Ký</Text>
        </Pressable>
      </View>

      {/* Footer Giant Layouts */}
      <View style={styles.footerBigCircle} />
      <View style={styles.footerMidCircle} />
      <View style={styles.footerInnerCircle} />

    </View>
  );
};

export default ManHinhChao;
