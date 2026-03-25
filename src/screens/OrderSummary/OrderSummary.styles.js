import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 412;
const BASE_H = 956;
const sw = (s) => (width / BASE_W) * s;
const sh = (s) => (height / BASE_H) * s;
const mod = (s) => (width / BASE_W) * s;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1A0F' },
  scroll: { flex: 1 },
  content: { paddingBottom: sh(160) },

  // Header
  header: {
    height: sh(144),
    backgroundColor: '#7E9B5D',
    borderBottomLeftRadius: sw(20),
    borderBottomRightRadius: sw(20),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridLine: {
    width: sw(40),
    height: sw(40),
    borderWidth: 0.5,
    borderColor: 'white',
  },
  backBtn: {
    position: 'absolute',
    left: sw(16),
    top: sh(38),
    width: sw(32),
    height: sw(32),
    borderRadius: sw(16),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { color: 'white', fontSize: mod(20) },
  headerTitle: {
    marginTop: sh(20),
    color: '#BAC8C3',
    fontSize: mod(20),
    fontFamily: 'Inter',
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Section Header
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sw(16),
    marginTop: sh(25),
    marginBottom: sh(15),
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: mod(12),
    fontFamily: 'Inter',
    fontWeight: '800',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    paddingHorizontal: sw(10),
    paddingVertical: sh(4),
    borderRadius: sw(20),
  },
  addItemIcon: { fontSize: mod(14), color: 'black', marginRight: sw(4) },
  addItemText: { color: 'black', fontSize: mod(10), fontFamily: 'ABeeZee' },

  // Item List
  itemList: { paddingHorizontal: sw(16) },
  itemContainer: {
    marginBottom: sh(15),
    borderRadius: sw(30),
    backgroundColor: '#F0F0F3',
    shadowColor: 'white',
    shadowOffset: { width: -5, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(12),
    backgroundColor: '#F0F0F3',
  },
  itemImg: {
    width: sw(57),
    height: sw(57),
    borderRadius: sw(28),
    backgroundColor: '#D1D1D1',
  },
  itemInfo: { flex: 1, marginLeft: sw(12) },
  itemName: {
    color: '#232F2E',
    fontSize: mod(14),
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  itemOptions: {
    color: '#5E5E5E',
    fontSize: mod(10),
    fontFamily: 'Inter',
    fontWeight: '500',
    marginTop: sh(4),
  },
  itemPrice: {
    color: '#136159',
    fontSize: mod(14),
    fontFamily: 'Poppins',
    fontWeight: '500',
    marginRight: sw(40),
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: sw(20),
    paddingHorizontal: sw(8),
    height: sh(24),
    marginRight: sw(28),
  },
  qtyBtn: { width: sw(16), alignItems: 'center' },
  qtyBtnText: { color: 'black', fontSize: mod(14), fontWeight: '500' },
  qtyValWrap: {
    width: sw(18),
    height: sw(18),
    borderRadius: sw(9),
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: sw(4),
  },
  qtyValue: { color: 'black', fontSize: mod(11), fontWeight: '500' },

  editBtn: {
    position: 'absolute',
    right: sw(12),
    top: sh(12),
    width: sw(24),
    height: sw(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: { fontSize: mod(16), color: '#777' },

  deleteBtn: {
    width: sw(80),
    height: '100%',
    backgroundColor: '#E33535',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    zIndex: -1,
  },
  deleteIcon: { fontSize: mod(24) },

  // Summary Totals
  summarySection: {
    paddingHorizontal: sw(16),
    marginTop: sh(15),
  },
  divider: {
    height: 1,
    backgroundColor: '#CACACA',
    marginBottom: sh(10),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sh(12),
  },
  totalLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: mod(14),
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  totalPriceValue: {
    color: '#7E9B5D',
    fontSize: mod(14),
    fontFamily: 'Poppins',
    fontWeight: '500',
  },

  // Promo Banners
  promoScroll: { marginTop: sh(20), paddingLeft: sw(16) },
  promoCard: {
    width: sw(268),
    height: sh(150),
    borderRadius: sw(24),
    overflow: 'hidden',
    marginRight: sw(16),
    padding: sw(16),
    justifyContent: 'space-between',
  },
  promoBadge: {
    backgroundColor: 'rgba(253, 199, 0, 0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: sw(12),
    paddingVertical: sh(4),
    borderRadius: sw(16),
    marginBottom: sh(10),
  },
  promoBadgeText: { color: '#59168B', fontSize: mod(9), fontWeight: '700', letterSpacing: 0.5 },
  promoTitle: { color: 'white', fontSize: mod(24), fontFamily: 'Joti One', fontWeight: '400' },
  promoSubtitle: { color: 'rgba(255, 255, 255, 0.9)', fontSize: mod(12), fontWeight: '500', marginTop: sh(4) },
  promoAction: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    paddingHorizontal: sw(16),
    paddingVertical: sh(6),
    borderRadius: sw(14),
    marginTop: sh(12),
  },
  promoActionText: { color: '#EC003F', fontSize: mod(12), fontWeight: '700' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: sh(108),
    backgroundColor: '#363636',
    borderTopLeftRadius: sw(30),
    borderTopRightRadius: sw(30),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    // Inner shadow simulation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  finalTotalWrap: { flex: 1 },
  finalTotalLabel: { color: 'white', fontSize: mod(12), fontWeight: '500' },
  finalTotalValue: { color: '#7E9B5D', fontSize: mod(20), fontWeight: '900', marginTop: sh(2) },
  orderBtn: {
    width: sw(188),
    height: sh(45),
    backgroundColor: '#7E9B5D',
    borderRadius: sw(30),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderBtnText: { color: 'white', fontSize: mod(15), fontWeight: '700' },
  orderBtnIcon: { color: 'white', fontSize: mod(16), marginLeft: sw(10) },
});

export default styles;
