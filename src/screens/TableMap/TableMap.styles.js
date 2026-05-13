import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 412;
const BASE_H = 956;
const sw = (size) => (width / BASE_W) * size;
const sh = (size) => (height / BASE_H) * size;
const mod = (size, factor = 0.5) => size + (sw(size) - size) * factor;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', 
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: mod(24),
    paddingBottom: sh(40),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle highlight
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
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

  // ===================== TAKE-AWAY LIST =====================
  takeawayListContainer: {
    paddingHorizontal: sw(20),
    paddingTop: sh(16),
  },
  takeawayCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: sw(16),
    padding: sw(16),
    marginBottom: sh(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  takeawayCardActive: {
    backgroundColor: 'rgba(255,165,0,0.1)',
    borderColor: 'rgba(255,165,0,0.3)',
  },
  takeawayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(8),
  },
  takeawayIdText: {
    color: '#FFF',
    fontSize: mod(18),
    fontWeight: '700',
  },
  takeawayTimeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: mod(12),
  },
  takeawayInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  takeawayCustomerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: mod(14),
  },
  takeawayTotalText: {
    color: '#8BA367',
    fontSize: mod(16),
    fontWeight: '700',
  },

  // FAB (Floating Action Button) cho Tạo Đơn Mới
  fabCreateOrder: {
    position: 'absolute',
    bottom: sh(230), // Increased to clear the summary overlay (which ends at ~213)
    right: sw(25),
    width: sw(64),
    height: sw(64),
    borderRadius: sw(32),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    zIndex: 999,
    shadowColor: '#8BA367',
    shadowOffset: { width: 0, height: 0 }, // Uniform glow instead of directional shadow
    shadowOpacity: 0.6,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)', // Subtle white border for sharpness
    backgroundColor: '#8BA367',
  },
  fabIconText: {
    fontSize: sw(40),
    color: '#FFFFFF',
    fontWeight: '300', // Using light/thin weight for a cleaner look sometimes, or keep bold?
    // User liked it sharp, let's use a cleaner bold
    includeFontPadding: false, // Android specific centering fix
    textAlignVertical: 'center', // Android specific centering fix
    marginTop: sh(-4), // Micro-adjustment for visual centering
  },
  // ===================== TABLET/POS SPECIFIC STYLES (PREMIUM UI) =====================
  tabletContainer: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#FFFFFF', // Nền tổng thể
  },

  // --- SIDEBAR ---
  tabletSidebar: {
    width: 280,
    backgroundColor: '#E6F0EA', // Xanh nhạt rõ ràng hơn (Light Matcha)
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  tabletSidebarCollapsed: {
    width: 88,
    alignItems: 'center',
  },
  sidebarHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoText: {
    fontSize: 22,
    color: '#34A853',
  },
  brandTitleGroup: {
    marginLeft: 12,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    opacity: 0.6,
  },
  collapseBtn: { display: 'none' }, // Removed top collapse
  collapseIcon: { display: 'none' },

  sidebarToggleBottom: {
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sidebarToggleIcon: {
    fontSize: 28,
    color: '#64748B',
    fontWeight: '300',
    marginTop: -4,
  },

  // --- NAV ITEMS ---
  tabletNavContainer: {
    flex: 1,
    backgroundColor: '#34A853', // Base green
    borderRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#064E3B',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  tabletNavContainerCollapsed: {
    paddingHorizontal: 8,
  },
  tabletNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabletNavItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabletNavIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabletNavIcon: {
    fontSize: 18,
    color: '#34A853',
  },
  tabletNavIconActive: {
    color: '#34A853',
  },
  tabletNavLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 14,
  },
  tabletNavLabelActive: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 14,
  },

  // --- USER PROFILE (BOTTOM SIDEBAR) ---
  sidebarFooter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sidebarFooterCollapsed: {
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  userProfileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#34A853',
    fontWeight: '800',
    fontSize: 18,
  },
  userInfoText: {
    marginLeft: 12,
  },
  userName: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '800',
  },
  userRole: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
    marginTop: 2,
  },

  // --- MAIN CONTENT ---
  tabletMain: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Nền dưới danh sách bàn màu trắng tinh
  },

  // --- TOP HEADER (MAIN) ---
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#F1F5F9', // Màu Header đậm hơn xíu để phân biệt rõ ràng
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10, // Đảm bảo shadow đè lên ScrollView
  },

  // Segmented Control
  globalToggle: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
    padding: 4,
    height: 46,
    width: 240,
  },
  toggleTab: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  toggleTabActive: {
    backgroundColor: 'transparent',
  },
  toggleTextInactive: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Search & Filter
  searchFilterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 48,
    width: 320,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIconOuter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchIconInner: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '300',
    transform: [{ rotate: '45deg' }, { scaleX: -1 }],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    height: '100%',
    paddingVertical: 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  filterBtnIcon: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '300',
  },
  tabletNotiBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tabletNotiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // --- GRID ---
  tabletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 180, // Safe space for vertically stacked FABs
    justifyContent: 'flex-start',
  },
  tabletTableCard: {
    width: '23%',
    minWidth: 200,
    height: 140,
    borderRadius: 16,
    marginHorizontal: '1%',
    marginBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'space-between',
    overflow: 'visible',
    // Soft Shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  tabletTakeawayCard: {
    width: '31.3%',
    minWidth: 240,
    height: 180,
    borderRadius: 20,
    marginHorizontal: '1%',
    marginBottom: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  glowingBorder: {
    borderColor: '#F59E0B',
    borderWidth: 2,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  newCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  newCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  newCardStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    marginLeft: 8, // Khoảng cách tránh bị dính vào tên bàn
  },
  newCardStatusDot: {
    width: 7, height: 7, borderRadius: 3.5,
  },
  newCardStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  newCardMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Căn giữa đồng hồ
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  newCardInfoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  newCardInfoIcon: {
    fontSize: 13,
  },
  newCardInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.5,
  },
  newCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  newCardDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  newCardDetailsText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  newCardBottomLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  newCardPriceText: {
    fontSize: 20,
    fontWeight: '700',
    flexShrink: 1, // ensure it doesn't push the label out
    textAlign: 'right',
  },
  legendGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  // --- FABs (Floating Action Buttons) ---
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 40,
    flexDirection: 'column', // Xếp chồng lên nhau theo chiều dọc
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    zIndex: 999,
  },
  premiumFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  premiumFabIcon: {
    fontSize: 22,
    color: '#FFF',
  },
  premiumFabText: { display: 'none' },

  // --- BOTTOM MODALS CONTAINER ---
  bottomModalContainer: {
    position: 'absolute',
    bottom: 50, // Cách đáy nhiều hơn FABs một chút
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 998,
    pointerEvents: 'box-none',
  },
  statsModalCard: {
    backgroundColor: '#064E3B', // Deep Emerald/Matcha Dark
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 24,
    gap: 40,
    borderWidth: 1,
    borderColor: '#047857',
  },
  statsBannerCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsBannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statsBannerTextGroup: {
    justifyContent: 'center',
  },
  statsBannerLabel: {
    color: '#A7F3D0', // Light Mint for readability on dark background
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsBannerValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  statsBannerDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#047857',
  },

  // --- PROMO MODAL CONTENT ---
  promoModalCard: {
    width: 480,
    backgroundColor: '#FFFBEB', // Warm cream - tone ấm áp phù hợp icon quà
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 22,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A', // Viền vàng nhạt
  },
  promoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  promoModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E', // Nâu ấm
  },
  promoModalClose: {
    fontSize: 22,
    color: '#D97706',
    fontWeight: '400',
    padding: 4,
  },
  promoModalDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    marginBottom: 16,
  },
  promoModalEmpty: {
    fontSize: 15,
    color: '#B45309', // Nâu cam ấm
    textAlign: 'center',
    paddingVertical: 20,
    fontWeight: '500',
  },
});

export default styles;
