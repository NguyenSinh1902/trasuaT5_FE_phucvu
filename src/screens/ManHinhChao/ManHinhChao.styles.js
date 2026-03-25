import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Using iPhone 11 Pro Max/12 Pro Max/13 Pro Max as base (w: 414, h: 896) for Figma coords
const BASE_W = 414;
const BASE_H = 896;

const sw = (size) => (width / BASE_W) * size;
const sh = (size) => (height / BASE_H) * size;
const mod = (size, factor = 0.5) => size + (sw(size) - size) * factor;

const COLORS = {
  bg: '#EEEEEE',
  primary: '#49514E',
  secondary: '#7A8A84',
  accentText: '#FFECCF',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    overflow: 'hidden',
  },
  
  // 1. Giant Background Blob (Actually a large rounded rectangle positioned absolute)
  topBgShape: {
    position: 'absolute',
    width: sw(490),
    height: sh(345),
    left: sw(-31),
    top: sh(-33),
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: sw(180),   // Making it a smooth curve at bottom
    borderBottomRightRadius: sw(180),
  },

  // 2. Secondary blob (Lighter green blob behind cups)
  secondaryBlob: {
    position: 'absolute',
    width: sw(314),
    height: sh(365),
    left: sw(52),
    top: sh(15),
    backgroundColor: COLORS.secondary,
    borderRadius: sw(150), // organic circle shape
    transform: [{ scaleY: 0.9 }],
  },

  // 3. Floating decorative bubbles
  bubble1: { position: 'absolute', width: sw(23), height: sw(23), left: sw(33), top: sh(193), backgroundColor: COLORS.primary, borderRadius: 99 },
  bubble2: { position: 'absolute', width: sw(12), height: sw(12), left: sw(9), top: sh(155), backgroundColor: COLORS.primary, borderRadius: 99 },
  bubble3: { position: 'absolute', width: sw(32), height: sw(32), left: sw(175), top: sh(364), backgroundColor: COLORS.secondary, borderRadius: 99 },
  bubble4: { position: 'absolute', width: sw(12), height: sw(12), left: sw(158), top: sh(389), backgroundColor: COLORS.secondary, borderRadius: 99 },
  
  // Outlined bubbles
  bubble5: { position: 'absolute', width: sw(30), height: sw(30), left: sw(353), top: sh(30), borderWidth: 4, borderColor: COLORS.secondary, borderRadius: 99 },
  bubble6: { position: 'absolute', width: sw(10), height: sw(10), left: sw(383), top: sh(63), borderWidth: 1.5, borderColor: COLORS.secondary, borderRadius: 99 },
  bubble7: { position: 'absolute', width: sw(10), height: sw(10), left: sw(393), top: sh(17), borderWidth: 1.5, borderColor: COLORS.secondary, borderRadius: 99 },

  // 4. Texts
  titleText: {
    position: 'absolute',
    left: 0,
    width: width,
    top: sh(79),
    textAlign: 'center',
    color: COLORS.white,
    fontSize: mod(36),
    fontWeight: '800', // Mocking 'Potta One'
    letterSpacing: 0.72,
    zIndex: 10,
  },
  sloganText: {
    position: 'absolute',
    left: 0,
    width: width,
    top: sh(125),
    textAlign: 'center',
    color: COLORS.accentText,
    fontSize: mod(13, 0.3),
    fontWeight: '400',
    zIndex: 10,
  },

  // 5. Cups
  cupLeft: {
    position: 'absolute',
    width: sw(114),
    height: sh(150),
    left: sw(29),
    top: sh(152),
    zIndex: 5,
    tintColor: '#5C4433', // Thêm màu cho dễ phân biệt ly phụ
  },
  cupRight: {
    position: 'absolute',
    width: sw(114),
    height: sh(150),
    left: sw(282),
    top: sh(152),
    zIndex: 5,
    tintColor: '#6DA04B', // Màu ly phụ
  },
  cupCenter: {
    position: 'absolute',
    width: sw(144),
    height: sh(216),
    left: sw(137), // Giữa
    top: sh(172),
    zIndex: 6,
    // Soft premium dropshadow
    shadowColor: '#1A251D',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },

  // 6. Buttons
  buttonContainer: {
    position: 'absolute',
    top: sh(459),
    width: width,
    alignItems: 'center',
    zIndex: 20,
  },
  primaryBtn: {
    width: sw(241),
    height: sh(54),
    backgroundColor: COLORS.primary, // Chuyển linear gradient thành solid cho mượt
    borderRadius: sw(27),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(23), // Khoảng cách giữa 2 nút: (536 - 459 - 54) = 23
    // Thick premium shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryBtn: {
    width: sw(241),
    height: sh(54),
    backgroundColor: COLORS.white,
    borderRadius: sw(27),
    borderWidth: 5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: mod(20),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: mod(20),
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // 7. Footer Decorative Circles
  footerBigCircle: {
    position: 'absolute',
    width: sw(768),
    height: sw(768),
    left: sw(-177),
    top: sh(691),
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#BAC8C3',
    zIndex: 0,
  },
  footerMidCircle: {
    position: 'absolute',
    width: sw(223),
    height: sw(223),
    left: sw(95.5), // Center = (width-223)/2 = 85 to 103 depending on width. Figma says 103.
    top: sh(818),
    backgroundColor: COLORS.white,
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderStyle: 'dotted', // Dùng dotted giả lập nét đứt tròn
    zIndex: 1,
  },
  footerInnerCircle: {
    position: 'absolute',
    width: sw(181),
    height: sw(181),
    left: sw(116.5), // (width-181)/2
    top: sh(835),
    backgroundColor: COLORS.white,
    borderRadius: 9999,
    borderWidth: 8,
    borderColor: COLORS.primary,
    zIndex: 2,
  },
});

export default styles;
