import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 412;
const BASE_H = 956;
const sw = (size) => (width / BASE_W) * size;
const sh = (size) => (height / BASE_H) * size;
const mod = (size, factor = 0.5) => size + (sw(size) - size) * factor;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121614' },
  backgroundGradient: { ...StyleSheet.absoluteFillObject },


  headerContainer: {
    width: '100%',
    paddingTop: sh(48),
    paddingHorizontal: sw(20),
    paddingBottom: sh(18),
    borderBottomLeftRadius: sw(28),
    borderBottomRightRadius: sw(28),
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,163,103,0.3)',
  },
  headerGradient: { ...StyleSheet.absoluteFillObject },

  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sh(16),
  },
  userProfileGroup: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: {
    width: sw(48), height: sw(48), borderRadius: sw(24),
    backgroundColor: '#8BA367',
    justifyContent: 'center', alignItems: 'center',
    marginRight: sw(12),
  },
  avatarInitials: { color: '#1A1A1A', fontWeight: '700', fontSize: mod(20) },
  roleText: { color: 'rgba(255,255,255,0.65)', fontSize: mod(12) },
  nameText: { color: '#FFF', fontSize: mod(16), fontWeight: '700' },
  shiftText: { color: '#8BA367', fontSize: mod(12) },

  notiBtn: {
    width: sw(42), height: sw(42), borderRadius: sw(21),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  notiBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#FFD700',
    justifyContent: 'center', alignItems: 'center',
  },
  notiBadgeText: { color: '#1A1A1A', fontSize: 10, fontWeight: '700' },

  // Toggle: Tại bàn / Mang về
  globalToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: sw(30),
    height: sh(42),
    padding: 4,
  },
  toggleTab: {
    flex: 1, borderRadius: sw(24),
    justifyContent: 'center', alignItems: 'center',
  },
  toggleTabActive: { backgroundColor: '#242928' },
  toggleTextActive: { color: '#8BA367', fontWeight: '700', fontSize: mod(14) },
  toggleTextInactive: { color: 'rgba(255,255,255,0.45)', fontWeight: '600', fontSize: mod(14) },

  // ===================== GRID =====================
  fadeEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: sh(100),
    zIndex: 10,
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: sw(15),
    paddingTop: sh(18),
    paddingBottom: sh(260), // room for overlays
  },
  tableCard: {
    width: sw(182),
    minHeight: sh(150),
    borderRadius: sw(16),
    borderWidth: 1,
    padding: sw(14),
    marginBottom: sh(14),
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(12),
  },
  tableName: { color: '#FFF', fontSize: mod(17), fontWeight: '700' },
  tableBadge: {
    paddingHorizontal: sw(8), paddingVertical: sh(3),
    borderRadius: sw(12),
  },
  tableBadgeText: { fontSize: mod(11), fontWeight: '600' },
  tableSubText: { color: 'rgba(255,255,255,0.55)', fontSize: mod(12) },
  tableMainValue: { fontSize: mod(20), fontWeight: '700', marginTop: sh(2) },

  // ===================== SUMMARY OVERLAY =====================
  summaryOverlay: {
    position: 'absolute',
    bottom: sh(95),
    left: sw(14),
    right: sw(14),
    height: sh(118),
    backgroundColor: '#1B1B1B',
    borderRadius: sw(22),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCol: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: sh(8),
  },
  summaryColBorder: {
    borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  summaryIconWrap: {
    width: sw(40), height: sw(40), borderRadius: sw(20),
    justifyContent: 'center', alignItems: 'center',
    marginBottom: sh(6),
    overflow: 'hidden', // prevent emoji bleed
  },
  summaryIcon: { fontSize: sw(18), lineHeight: sw(22) }, // constrained size
  summaryValue: { color: '#FFF', fontSize: mod(20), fontWeight: '700' },
  summaryLabel: { color: 'rgba(255,255,255,0.45)', fontSize: mod(11), marginTop: sh(2) },

  // ===================== BOTTOM NAV =====================
  navOverlay: {
    position: 'absolute',
    bottom: sh(28),
    alignSelf: 'center',
    width: sw(260),
    height: sh(56),
    backgroundColor: '#1A1A1A',
    borderRadius: sw(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: sw(4) },
  navIconActive: { fontSize: sw(18), lineHeight: sw(22) },
  navIcon: { fontSize: sw(16), lineHeight: sw(20), opacity: 0.4 },
  navLabelActive: { color: '#FFF', fontSize: mod(9), fontWeight: '600', marginTop: 2 },
  navLabel: { color: 'rgba(255,255,255,0.35)', fontSize: mod(9), marginTop: 2 },

  // ===================== BOTTOM SHEET =====================
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetContainer: {
    backgroundColor: 'rgba(26,26,26,0.98)',
    borderTopLeftRadius: sw(32),
    borderTopRightRadius: sw(32),
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: sw(24),
    paddingBottom: sh(40),
  },
  sheetHandle: {
    alignSelf: 'center',
    width: sw(36),
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: sh(10),
    marginBottom: sh(16),
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(20),
  },
  sheetTitle: { color: '#FFF', fontSize: mod(24), fontWeight: '700' },
  sheetSubtitle: { color: '#8BA367', fontSize: mod(14), marginTop: 2 },
  sheetCloseBtn: {
    width: sw(38), height: sw(38), borderRadius: sw(19),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  sheetCloseBtnText: { color: '#FFF', fontSize: mod(16) },

  // Action card
  sheetCard: {
    backgroundColor: 'rgba(139,163,103,0.10)',
    borderRadius: sw(24),
    borderWidth: 1,
    borderColor: 'rgba(139,163,103,0.3)',
    padding: sw(20),
    marginBottom: sh(16),
  },
  sheetCardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: sh(16) },
  sheetCardIcon: { fontSize: sw(20), marginRight: sw(8) },
  sheetCardTitle: { color: '#FFF', fontSize: mod(18), fontWeight: '600' },

  // Guest stepper
  sheetGuestLabel: { color: 'rgba(255,255,255,0.6)', fontSize: mod(14), marginBottom: sh(12) },
  sheetStepper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: sw(24),
    marginBottom: sh(20),
  },
  stepperBtn: {
    width: sw(56), height: sw(56), borderRadius: sw(28),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  stepperBtnText: { color: '#FFF', fontSize: mod(28), fontWeight: '300', lineHeight: 34 },
  stepperValue: { color: '#FFF', fontSize: 48, fontWeight: '700', width: sw(80), textAlign: 'center' },

  // Confirm button
  confirmBtn: {
    borderRadius: sw(16),
    borderWidth: 1,
    borderColor: 'rgba(139,163,103,0.5)',
  },
  confirmBtnInner: {
    height: sh(58),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: { color: '#FFF', fontSize: mod(16), fontWeight: '600' },

  // Reserve button
  reserveBtn: {
    height: sh(58),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: sw(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: sw(8),
  },
  reserveBtnIcon: { fontSize: sw(18) },
  reserveBtnText: { color: '#FFF', fontSize: mod(16), fontWeight: '600' },

  // Reserve form fields
  reserveFormField: { marginBottom: sh(16) },
  reserveFieldLabel: { color: 'rgba(255,255,255,0.7)', fontSize: mod(14), fontWeight: '500', marginBottom: sh(8) },
  reserveInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: sw(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: sw(16),
    height: sh(58),
  },
  reserveInputIcon: { fontSize: sw(18), marginRight: sw(10), opacity: 0.6 },
  reserveInput: { flex: 1, color: '#FFF', fontSize: mod(16) },

  // ===================== OCCUPIED SHEET =====================
  occStatRow: {
    flexDirection: 'row',
    marginBottom: sh(16),
  },
  occStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: sw(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: sw(16),
  },
  occStatLabel: { color: 'rgba(255,255,255,0.55)', fontSize: mod(12), marginBottom: sh(4) },
  occStatValue: { color: '#FFF', fontSize: mod(18), fontWeight: '600' },

  occPriceCard: {
    borderRadius: sw(24),
    borderWidth: 1,
    borderColor: 'rgba(139,163,103,0.3)',
    padding: sw(20),
    alignItems: 'center',
    marginBottom: sh(16),
  },
  occPriceLabel: { color: 'rgba(255,255,255,0.65)', fontSize: mod(14), marginBottom: sh(8) },
  occPriceValue: { color: '#8BA367', fontSize: mod(36), fontWeight: '700' },
  occGuestCount: { color: 'rgba(255,255,255,0.45)', fontSize: mod(12), marginTop: sh(4) },

  occBtnGhost: {
    height: sh(54),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: sw(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(12),
  },
  occBtnGhostText: { color: '#FFF', fontSize: mod(16), fontWeight: '500' },

  // ===================== RESERVED SHEET =====================
  resCard: {
    borderRadius: sw(24),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    padding: sw(20),
    marginBottom: sh(16),
    alignItems: 'center',
  },
  resTimeLabel: { color: 'rgba(255,255,255,0.65)', fontSize: mod(14), marginBottom: sh(6) },
  resTimeValue: { color: '#FFD700', fontSize: 48, fontWeight: '700', lineHeight: 54 },
  resDivider: {
    width: '100%', height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: sh(14),
  },
  resInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  resInfoKey: { color: 'rgba(255,255,255,0.55)', fontSize: mod(14) },
  resInfoValue: { color: '#FFF', fontSize: mod(14), fontWeight: '600' },
});

export default styles;
