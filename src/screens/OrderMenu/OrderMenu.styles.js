import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 412;
const BASE_H = 956;
const sw = (s) => (width / BASE_W) * s;
const sh = (s) => (height / BASE_H) * s;
const mod = (s) => (width / BASE_W) * s;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1A0F' },
  bg: { ...StyleSheet.absoluteFillObject },

  // ===== HEADER =====
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: sh(52),
    paddingHorizontal: sw(16),
    paddingBottom: sh(12),
    backgroundColor: '#242928',
  },
  backBtn: {
    width: sw(32), height: sw(32), borderRadius: sw(16),
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnText: { color: '#FFF', fontSize: mod(16), fontWeight: '700' },
  headerTitle: {
    color: '#BAC8C3', fontSize: mod(18), fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  cartBtn: {
    width: sw(34), height: sw(34),
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  cartBtnText: { fontSize: sw(22) },
  cartBadge: {
    position: 'absolute', top: -2, right: -2,
    width: sw(16), height: sw(16), borderRadius: sw(8),
    backgroundColor: '#8BA367',
    justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#FFF', fontSize: mod(9), fontWeight: '700' },

  // ===== SEARCH =====
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(16),
    paddingVertical: sh(10),
    gap: sw(10),
    backgroundColor: '#242928',
  },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: sw(40),
    paddingHorizontal: sw(14),
    height: sh(44),
    borderWidth: 2,
    borderColor: '#7E9B5D',
  },
  searchIcon: { fontSize: sw(14), marginRight: sw(6), opacity: 0.5 },
  searchInput: { flex: 1, color: '#333', fontSize: mod(13), fontWeight: '300' },
  searchBtn: {
    width: sw(44), height: sw(44), borderRadius: sw(22),
    backgroundColor: '#8BA367',
    justifyContent: 'center', alignItems: 'center',
  },
  searchBtnText: { fontSize: sw(18) },

  // ===== CATEGORIES =====
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: sw(8),
    paddingVertical: sh(10),
    backgroundColor: 'rgba(15,26,15,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  catItem: { alignItems: 'center', flex: 1 },
  catCircle: {
    width: sw(46), height: sw(46), borderRadius: sw(23),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: sh(5),
  },
  catCircleActive: {
    backgroundColor: 'rgba(139,163,103,0.25)',
    borderColor: '#8BA367',
    shadowColor: '#8BA367',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  catEmoji: { fontSize: sw(22) },
  catEmojiActive: { fontSize: sw(26) },
  catLabel: {
    color: 'rgba(255,255,255,0.5)', fontSize: mod(9.5),
    fontWeight: '500', textAlign: 'center', lineHeight: 13,
  },
  catLabelActive: { color: '#8BA367', fontWeight: '700' },

  // ===== SCROLL =====
  scroll: { flex: 1 },

  // ===== BANNERS =====
  bannerScroll: { height: sh(140), marginHorizontal: sw(14), marginTop: sh(12), borderRadius: sw(24) },
  promoCard: {
    width: width - sw(28),
    height: sh(133),
    borderRadius: sw(24),
    padding: sw(16),
    justifyContent: 'center',
    marginRight: sw(10),
  },
  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: sw(10),
    paddingHorizontal: sw(8), paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: sh(4),
  },
  promoBadgeText: { color: '#FFF', fontSize: mod(9), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  promoTitle: { color: '#FFF', fontSize: mod(26), fontWeight: '700', lineHeight: 30 },
  promoSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: mod(11), fontWeight: '500', marginBottom: sh(8) },
  promoCta: {
    alignSelf: 'flex-start',
    borderRadius: sw(14),
    paddingHorizontal: sw(14), paddingVertical: sh(6),
  },
  promoCtaText: { fontSize: mod(12), fontWeight: '700' },

  // ===== SECTIONS =====
  section: { marginTop: sh(20), paddingHorizontal: sw(14) },
  sectionTitle: {
    color: 'rgba(255,255,255,0.65)', fontSize: mod(13), fontWeight: '800',
    marginBottom: sh(10), letterSpacing: 0.3,
  },
  productRow: { justifyContent: 'space-between' },

  // ===== PRODUCT CARD =====
  productCard: {
    width: (width - sw(28) - sw(12)) / 2,
    marginBottom: sh(14),
  },
  productImageWrap: { position: 'relative', marginBottom: sh(8) },
  productImageGradient: {
    width: '100%',
    height: sh(110),
    borderRadius: sw(20),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: sw(20),
  },
  productBadge: {
    position: 'absolute', top: sh(4), right: sw(4),
    backgroundColor: '#2B7FFF',
    borderRadius: sw(30),
    paddingHorizontal: sw(6), paddingVertical: 2,
  },
  productBadgeText: { color: '#FFF', fontSize: mod(10), fontWeight: '700' },
  addBtn: {
    position: 'absolute', bottom: sh(6), right: sw(6),
    width: sw(26), height: sw(26), borderRadius: sw(13),
    backgroundColor: '#B87651',
    justifyContent: 'center', alignItems: 'center',
  },
  addBtnText: { color: '#FFF', fontSize: mod(20), fontWeight: '300', lineHeight: 24 },
  productName: { color: '#FFF', fontSize: mod(11.5), fontWeight: '400', lineHeight: 16, marginBottom: 3 },
  productPrice: { color: '#B87651', fontSize: mod(12), fontWeight: '700' },
});

export default styles;
