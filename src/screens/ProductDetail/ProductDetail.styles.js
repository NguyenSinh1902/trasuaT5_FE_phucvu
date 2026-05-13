import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 412;
const BASE_H = 956;
const sw = (s) => (width / BASE_W) * s;
const sh = (s) => (height / BASE_H) * s;
const mod = (s) => (width / BASE_W) * s;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEEEEE' },
  scroll: { flex: 1 },
  content: { paddingBottom: sh(140) },

  // Header
  headerContainer: {
    height: sh(320),
    position: 'relative',
    overflow: 'hidden',
  },
  headerBg: {
    width: '100%',
    height: sh(180),
    backgroundColor: '#7E9B5D',
    borderBottomLeftRadius: sw(150),
    borderBottomRightRadius: sw(150),
    transform: [{ scaleX: 1.5 }],
    position: 'absolute',
    top: 0,
  },
  imageWrapper: {
    width: sw(340),
    height: sh(260),
    backgroundColor: '#FFF',
    borderRadius: sw(150),
    position: 'absolute',
    top: sh(40),
    left: (width - sw(340)) / 2,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    // Shadow for the oval
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    left: sw(15),
    top: sh(35),
    width: sw(32),
    height: sw(32),
    borderRadius: sw(16),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backIcon: { fontSize: mod(16), color: '#7E9B5D', fontWeight: 'bold' },
  backBtnArrow: { fontSize: mod(24), color: '#FFF' },

  // Info Section
  infoSection: { paddingHorizontal: sw(20), marginTop: sh(20) },
  productName: {
    color: '#7E9B5D',
    fontSize: mod(24),
    fontFamily: 'ABeeZee',
    fontWeight: '400',
    marginBottom: sh(8),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: sh(4),
  },
  descText: {
    flex: 1,
    color: '#677278',
    fontSize: mod(13),
    fontFamily: 'ABeeZee',
    fontWeight: '400',
    lineHeight: sh(18),
    paddingRight: sw(15),
  },
  vDivider: {
    width: 1,
    height: sh(40),
    backgroundColor: '#A3A3A3',
    marginHorizontal: sw(10),
  },
  basePriceGroup: { alignItems: 'flex-start' },
  basePriceLabel: { color: '#292E30', fontSize: mod(13), fontFamily: 'ABeeZee' },
  basePriceValue: { color: '#7E9B5D', fontSize: mod(13), fontFamily: 'Inter', fontWeight: '900' },

  hDivider: {
    height: 1,
    backgroundColor: '#CACACA',
    marginVertical: sh(20),
  },

  // Selection Groups
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    marginBottom: sh(12),
  },
  sectionTitle: { color: 'black', fontSize: mod(14), fontFamily: 'Inter', fontWeight: '800' },
  requiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    paddingHorizontal: sw(10),
    paddingVertical: sh(2),
    borderRadius: sw(10),
  },
  requiredIcon: { fontSize: mod(10), marginRight: sw(4) },
  requiredText: { color: 'black', fontSize: mod(10), fontFamily: 'ABeeZee' },
  optionalBadge: {
    backgroundColor: '#D9D9D9',
    paddingHorizontal: sw(10),
    paddingVertical: sh(2),
    borderRadius: sw(10),
  },
  optionalText: { color: 'black', fontSize: mod(10), fontFamily: 'ABeeZee' },

  // Size Grid
  sizeTrack: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F3',
    marginHorizontal: sw(16),
    borderRadius: sw(25),
    padding: 2,
    borderWidth: 1,
    borderColor: 'white',
    height: sh(42),
    alignItems: 'center',
  },
  sizeBtn: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center' },
  sizeBtnActive: {
    backgroundColor: '#F0F0F3',
    borderRadius: sw(20),
    borderWidth: 2,
    borderColor: 'black',
    // Neumorphic shadow simulation
    shadowColor: 'rgba(174, 174, 192, 0.4)',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  sizeText: { fontSize: mod(13), color: '#A3ADB2', fontFamily: 'ABeeZee' },
  sizeTextActive: { color: '#7E9B5D', fontWeight: '900' },

  sizePriceRow: {
    flexDirection: 'row',
    marginHorizontal: sw(16),
    marginTop: sh(8),
    marginBottom: sh(20),
  },
  sizePriceItem: { flex: 1, alignItems: 'center' },
  sizePriceText: { fontSize: mod(13), color: 'black', fontFamily: 'ABeeZee' },
  sizePriceTextActive: { color: '#7E9B5D', fontWeight: '700' },

  // Standard Buttons (Ice/Sugar)
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: sw(16),
    marginBottom: sh(25),
  },
  optionBtn: {
    width: sw(85),
    height: sh(34),
    backgroundColor: '#F0F0F3',
    borderRadius: sw(10),
    justifyContent: 'center',
    alignItems: 'center',
    // Soft shadow
    shadowColor: 'rgba(174,174,192,0.5)',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  optionBtnActive: {
    backgroundColor: '#7E9B5D',
  },
  optionBtnText: { color: '#A3ADB2', fontSize: mod(13), fontFamily: 'Inter', fontWeight: '500' },
  optionBtnTextActive: { color: 'rgba(255,255,255,0.8)', fontWeight: '900' },

  // Toppings
  toppingList: { paddingHorizontal: sw(16) },
  toppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(12),
    height: sh(40),
  },
  checkbox: {
    width: sw(18),
    height: sw(18),
    borderRadius: sw(9),
    borderWidth: 2,
    borderColor: '#7E9B5D',
    backgroundColor: 'white',
    marginRight: sw(12),
  },
  checkboxActive: { backgroundColor: '#7E9B5D' },
  toppingBox: {
    flex: 1,
    height: sh(32),
    backgroundColor: 'white',
    borderRadius: sw(20),
    paddingHorizontal: sw(15),
    justifyContent: 'center',
  },
  toppingBoxActive: {
    backgroundColor: '#E5E5E5',
    borderWidth: 2,
    borderColor: '#7E9B5D',
  },
  toppingName: { color: '#A3ADB2', fontSize: mod(13), fontFamily: 'ABeeZee' },
  toppingNameActive: { color: '#7E9B5D' },
  toppingPrice: { color: 'black', fontSize: mod(13), fontFamily: 'ABeeZee', marginLeft: sw(10) },
  toppingPriceActive: { color: '#7E9B5D', fontWeight: '700' },

  // Note Section
  noteInput: {
    marginHorizontal: sw(20),
    height: sh(70),
    backgroundColor: 'white',
    borderRadius: sw(20),
    borderWidth: 1,
    borderColor: '#D9D9D9',
    padding: sw(12),
    textAlignVertical: 'top',
    color: '#333',
    fontSize: mod(12),
    fontFamily: 'ABeeZee',
  },

  // Quantity Bottom
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: sh(25),
    paddingBottom: sh(10),
    marginBottom: sh(10),
  },
  qtyTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
    borderRadius: sw(50),
    borderWidth: 1,
    borderColor: 'white',
    height: sh(50),
    paddingHorizontal: sw(5),
  },
  qtyBtn: {
    width: sw(42),
    height: sw(42),
    backgroundColor: '#F0F0F3',
    borderRadius: sw(21),
    borderWidth: 2,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    // Inner shadow like effect
    elevation: 2,
  },
  qtyBtnText: { color: '#485054', fontSize: mod(20), fontWeight: '600' },
  qtyValue: { width: sw(40), textAlign: 'center', fontSize: mod(16), fontWeight: '700', color: '#485054' },
  aiIconBtn: {
    width: sw(54),
    height: sw(54),
    backgroundColor: '#3E4642',
    borderRadius: sw(15),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sw(20),
    // Glow effect
    shadowColor: '#FEF3C6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 243, 198, 0.2)',
  },
  aiIcon: { fontSize: sw(26) },

  // ===== FINAL SMART SUGGESTION (PREMIUM HORIZONTAL) =====
  smartBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smartContainer: {
    width: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#8BA367',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  smartTitleWrap: { marginBottom: 20 },
  smartMainName: { fontSize: 24, fontWeight: '900', color: '#166534', marginBottom: 4 },
  smartSubTitle: { fontSize: 13, color: '#64748B', fontStyle: 'italic' },
  
  horizontalToppingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F8E9',
    marginBottom: 12,
    // Soft floating shadow
    shadowColor: '#8BA367',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toppingImgWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: '#8BA367',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toppingImg: { width: '100%', height: '100%' },
  toppingInfo: { flex: 1 },
  toppingName: { fontSize: 17, fontWeight: '700', color: '#064E3B', marginBottom: 4, textTransform: 'capitalize' },
  toppingAdvice: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  toppingPriceLabel: {
    fontSize: 22,
    fontWeight: '900',
    color: '#8BA367', // Will use Gradient if possible or just bold
    marginLeft: 12,
  },

  finalConfirmBtn: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    // 3D Shadow
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  finalConfirmGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finalConfirmText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  
  finalSkipBtn: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  finalSkipText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#101828',
    paddingHorizontal: sw(16),
    paddingTop: sh(12),
    paddingBottom: sh(30),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(12),
  },
  totalPriceGroup: { flex: 1 },
  totalPriceLabel: { color: '#D1D5DC', fontSize: mod(12), fontWeight: '500' },
  totalPriceValue: { color: 'white', fontSize: mod(18), fontWeight: '700', marginTop: 2 },
  resetBtn: {
    paddingHorizontal: sw(15),
    paddingVertical: sh(6),
    borderRadius: sw(20),
    borderWidth: 2,
    borderColor: '#136159',
    backgroundColor: '#EEEEEE',
  },
  resetText: { color: '#7E9B5D', fontSize: mod(12), fontWeight: '700' },
  confirmBtn: {
    height: sh(56),
    backgroundColor: '#7E9B5D',
    borderRadius: sw(30),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: { color: 'white', fontSize: mod(16), fontWeight: '700', marginRight: sw(10) },
  confirmIcon: { fontSize: sw(16), color: 'white' },
});

export default styles;
