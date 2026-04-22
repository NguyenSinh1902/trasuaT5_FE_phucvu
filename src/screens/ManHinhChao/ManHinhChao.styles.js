import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

const COLORS = {
  primary: '#2D5A27',
  secondary: '#E8F5E9',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column',
    backgroundColor: COLORS.secondary,
  },
  brandSide: {
    flex: isTablet ? 1.2 : 1, 
    position: 'relative',
    justifyContent: 'center', // Center carousel
    alignItems: 'center',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(232, 245, 233, 0.65)', 
  },
  brandTitleWrap: {
    position: 'absolute',
    top: 30,
    left: 40,
    zIndex: 10,
    flexDirection: 'column',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: isTablet ? 28 : 24,
    marginRight: 6,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandTitleLeft: {
    color: '#064E3B',
    fontSize: isTablet ? 28 : 24,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 2,
    marginTop: -2,
    marginLeft: 4, 
    opacity: 0.9,
  },
  contentSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isTablet ? COLORS.white : COLORS.secondary, 
    position: 'relative',
    overflow: 'hidden',
  },
  cornerBlob: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(209, 250, 229, 0.4)', 
  },
  cornerBlob2: {
    position: 'absolute',
    top: -100,
    right: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(232, 245, 233, 0.5)',
  },
  contentWrapper: {

    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    padding: 30,
  },
  titleText: {
    fontSize: isTablet ? 48 : 36,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    display: isTablet ? 'none' : 'flex', // Trên tablet chữ logo đã ở bên trái
  },
  sloganText: {
    fontSize: isTablet ? 20 : 16,
    color: '#4B5563',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    justifyContent: 'center',
  },
  primaryBtnWrapper: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#A5D6A7',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;
