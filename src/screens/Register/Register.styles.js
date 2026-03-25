import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 414;
const BASE_H = 896;

const sw = (size) => (width / BASE_W) * size;
const sh = (size) => (height / BASE_H) * size;
const mod = (size, factor = 0.5) => size + (sw(size) - size) * factor;

const COLORS = {
  cardBg: 'rgba(93, 82, 82, 0.24)',
  white: '#FFFFFF',
  accentText: '#FFECCF',
  tabActiveBg: '#242928',
  tabInactiveBg: '#BAC8C3',
  inputBg: '#FFFFFF',
  inputBorder: '#EEEFF1',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  titleText: {
    position: 'absolute',
    width: width,
    top: sh(88),
    textAlign: 'center',
    color: COLORS.white,
    fontSize: mod(36),
    fontWeight: '800', 
    letterSpacing: 0.72,
    zIndex: 10,
  },
  sloganText: {
    position: 'absolute',
    width: width,
    top: sh(134),
    textAlign: 'center',
    color: COLORS.accentText,
    fontSize: mod(13, 0.3),
    fontWeight: '400',
    zIndex: 10,
  },
  cardContainer: {
    position: 'absolute',
    width: sw(320),
    height: sh(590), // Shorter card to close the gap
    left: sw(47),
    top: sh(218),
    backgroundColor: COLORS.cardBg,
    borderRadius: sw(30),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
  },
  toggleContainer: {
    position: 'absolute',
    width: sw(297),
    height: sh(50),
    left: sw(11.5),
    top: sh(32), 
    backgroundColor: COLORS.tabInactiveBg,
    borderRadius: sw(35),
    borderWidth: 1,
    borderColor: '#242928',
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(2),
  },
  toggleActiveBackground: {
    position: 'absolute',
    width: sw(158),
    height: sh(46),
    right: sw(2), // Register tab active
    top: sh(1),
    backgroundColor: COLORS.tabActiveBg,
    borderRadius: sw(35),
  },
  toggleBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  toggleTextActive: {
    color: COLORS.tabInactiveBg,
    fontSize: mod(13),
    fontWeight: '600',
  },
  toggleTextInactive: {
    color: '#242928',
    fontSize: mod(13),
    fontWeight: '600',
  },
  
  // Flexbox Form Container for evenly spaced inputs
  formContainer: {
    position: 'absolute',
    top: sh(100), 
    left: sw(11.5),
    width: sw(297),
    flexDirection: 'column',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: sh(22), // Even spacing!
  },
  labelText: {
    color: COLORS.white,
    fontSize: mod(12),
    fontWeight: '500',
    marginBottom: sh(8),
    marginLeft: sw(15),
  },
  input: {
    width: '100%',
    height: sh(50),
    backgroundColor: COLORS.inputBg,
    borderRadius: sw(35),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: sw(20),
    fontSize: mod(14),
    color: '#000',
  },
  
  // Bottom actions inside card using relative absolute positioning from bottom
  loginBtn: {
    position: 'absolute',
    width: sw(297),
    height: sh(50),
    left: sw(11.5),
    bottom: sh(60),
    backgroundColor: '#242928',
    borderRadius: sw(35),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: mod(16),
    fontWeight: '700',
  },
  signupLinkContainer: {
    position: 'absolute',
    width: '100%',
    bottom: sh(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLinkText1: { color: 'rgba(255, 255, 255, 0.60)', fontSize: mod(14), fontWeight: '500' },
  signupLinkText2: { color: COLORS.white, fontSize: mod(14), fontWeight: '700' },

  // Footer Decor
  footerBigCircle: {
    position: 'absolute',
    width: sw(768),
    height: sw(768),
    left: sw(-177),
    top: sh(691),
    backgroundColor: '#49514E',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#BAC8C3',
    zIndex: 5,
  },
  footerMidCircle: {
    position: 'absolute',
    width: sw(223),
    height: sw(223),
    left: sw(95.5),
    top: sh(818),
    backgroundColor: COLORS.white,
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: '#7A8A84',
    borderStyle: 'dotted',
    zIndex: 6,
  },
  footerInnerCircle: {
    position: 'absolute',
    width: sw(181),
    height: sw(181),
    left: sw(116.5),
    top: sh(835),
    backgroundColor: COLORS.white,
    borderRadius: 9999,
    borderWidth: 8,
    borderColor: '#49514E',
    zIndex: 7,
  },
});

export default styles;
