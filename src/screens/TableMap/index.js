import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator, Dimensions, RefreshControl, useWindowDimensions, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './TableMap.styles';
import tableApi from '../../api/tableApi';
import orderApi from '../../api/orderApi';
import reservationApi from '../../api/reservationApi';

// Sheet components
import EmptyTableSheet from './components/EmptyTableSheet';
import OccupiedTableSheet from './components/OccupiedTableSheet';
import ReserveTableSheet from './components/ReserveTableSheet';
import ReservedTableSheet from './components/ReservedTableSheet';
import EditReserveSheet from './components/EditReserveSheet';
import InvoiceDetailSheet from './components/InvoiceDetailSheet';
import UpdateGuestSheet from './components/UpdateGuestSheet';
import TakeawayDetailSheet from './components/TakeawayDetailSheet';

const { width: windowWidth } = Dimensions.get('window');

const TableMap = ({ onNavigate }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const [activeTab, setActiveTab] = useState('dine');
  const [tables, setTables] = useState([]);
  const [takeawayOrders, setTakeawayOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Tablet States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  // Sheets state
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTakeaway, setSelectedTakeaway] = useState(null);
  const [reserveTable, setReserveTable] = useState(null);
  const [updateGuestTable, setUpdateGuestTable] = useState(null);
  const [invoiceTable, setInvoiceTable] = useState(null);
  const [editReserveTable, setEditReserveTable] = useState(null);

  // Đồng hồ thời gian thực - cập nhật mỗi giây
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsedTime = (startTime) => {
    if (!startTime) return '--:--:--';
    const diff = Math.max(0, currentTime.getTime() - new Date(startTime).getTime());
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const fetchData = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      const [tableRes, allInvoices, resRes] = await Promise.all([
        tableApi.getAll(),
        orderApi.getAll().catch(() => ({ data: [] })),
        reservationApi.getActiveReservations().catch(() => [])
      ]);

      const tableData = Array.isArray(tableRes) ? tableRes : (tableRes.data || []);
      const invoices = Array.isArray(allInvoices) ? allInvoices : (allInvoices.data || []);
      const reservations = Array.isArray(resRes) ? resRes : [];

      const mappedTables = tableData.map(t => {
        const res = reservations.find(r => r.danhSachBan?.some(b => b.idBan === t.idBan));
        const tableInvoices = invoices.filter(inv =>
          inv.loaiDonHang === 'TAI_BAN' &&
          inv.danhSachTenBan?.includes(t.tenBan) &&
          inv.trangThai !== 'DA_THANH_TOAN' &&
          inv.trangThai !== 'DA_HUY' &&
          inv.trangThai !== 'HOAN_TAT'
        );
        const activeInvoice = tableInvoices.length > 0 ? tableInvoices[tableInvoices.length - 1] : null;
        return { ...t, reservation: res, invoice: activeInvoice };
      });
      setTables(mappedTables);

      const takeaways = invoices.filter(inv =>
        inv.loaiDonHang === 'MANG_VE' &&
        inv.trangThai !== 'HOAN_TAT' &&
        inv.trangThai !== 'DA_HUY'
      );
      setTakeawayOrders(takeaways);
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 30000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  const filteredTables = useMemo(() => {
    if (!searchQuery) return tables;
    return tables.filter(t => t.tenBan?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tables, searchQuery]);

  const filteredTakeaways = useMemo(() => {
    if (!searchQuery) return takeawayOrders;
    return takeawayOrders.filter(o =>
      o.idHoaDon?.toString().includes(searchQuery) ||
      o.tenKhachHang?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [takeawayOrders, searchQuery]);

  const getStatusStyle = (tinhTrang) => {
    switch (tinhTrang) {
      case 'TRONG': return { bg: '#DCFCE7', color: '#22C55E', baseColor: '#22C55E', label: 'Bàn Trống' };
      case 'DA_DAT': return { bg: '#DBEAFE', color: '#3B82F6', baseColor: '#3B82F6', label: 'Đã Đặt' };
      case 'CO_KHACH': return { bg: '#FEE2E2', color: '#EF4444', baseColor: '#EF4444', label: 'Đang Dùng' };
      default: return { bg: '#E5E7EB', color: '#94A3B8', baseColor: '#94A3B8', label: 'Không xác định' };
    }
  };

  const getTakeawayStatusStyle = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN': return { bg: '#F1F5F9', color: '#64748B', label: 'Chờ xác nhận' };
      case 'DANG_PHA_CHE': return { bg: '#EFF6FF', color: '#3B82F6', label: 'Đang pha chế' };
      case 'CHO_LAY_MON': return { bg: '#F0FDFA', color: '#0D9488', label: 'Chờ lấy món' };
      case 'CHO_THANH_TOAN': return { bg: '#FFF7ED', color: '#EA580C', label: 'Chờ thanh toán' };
      case 'DA_THANH_TOAN': return { bg: '#FEFCE8', color: '#CA8A04', label: 'Đã thanh toán' };
      default: return { bg: '#F1F5F9', color: '#94A3B8', label: status || 'Đang xử lý' };
    }
  };

  const getOrderStatusStyle = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN': return { bg: '#BCF0DA', color: '#10B981', label: 'Chờ xác nhận' };
      case 'DANG_PHA_CHE': return { bg: '#DBEAFE', color: '#3B82F6', label: 'Đang pha chế' };
      case 'CHO_LAY_MON': return { bg: '#CCFBF1', color: '#0D9488', label: 'Chờ lấy món' };
      case 'DANG_PHUC_VU': return { bg: '#DCFCE7', color: '#22C55E', label: 'Đang phục vụ' };
      case 'CHO_THANH_TOAN': return { bg: '#FEF3C7', color: '#D97706', label: 'Chờ thanh toán' };
      case 'DA_THANH_TOAN': return { bg: '#FEF08A', color: '#A16207', label: 'Đã thanh toán' };
      case 'HOAN_TAT': return { bg: '#F3E8FF', color: '#9333EA', label: 'Hoàn tất' };
      case 'DA_HUY': return { bg: '#FEE2E2', color: '#EF4444', label: 'Đã hủy' };
      default: return { bg: '#E5E7EB', color: '#94A3B8', label: 'Không xác định' };
    }
  };

  const handleTablePress = (table) => setSelectedTable(table);

  const handleOpenMenu = (selectedTables, reservation, isTakeaway = false, invoiceId = null) => {
    let table = Array.isArray(selectedTables) && selectedTables.length > 0 ? selectedTables[0] : (selectedTable || null);
    if (!isTakeaway && reservation && table) {
      if (!table.reservation) table = { ...table, reservation: { idPhieuDat: reservation } };
      else if (!table.reservation.idPhieuDat) table.reservation.idPhieuDat = reservation;
    }
    onNavigate('OrderMenu', { table, reservation, isTakeaway, invoiceId });
  };

  // =========================================================
  // ========== RENDER BLOCKS ================================
  // =========================================================

  const renderTabletSidebar = () => (
    <View style={[styles.tabletSidebar, isSidebarCollapsed && styles.tabletSidebarCollapsed]}>
      {/* Click Logo => Toggle Sidebar */}
      <Pressable
        style={[styles.sidebarHeader, isSidebarCollapsed && styles.sidebarHeaderCollapsed]}
        onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        <View style={styles.brandGroup}>
          <View style={styles.brandLogo}><Text style={styles.brandLogoText}>🍃</Text></View>
          {!isSidebarCollapsed && (
            <View style={styles.brandTitleGroup}>
              <Text style={styles.brandTitle}>MatchTea</Text>
              <Text style={styles.brandSubtitle}>App phục vụ</Text>
            </View>
          )}
        </View>
      </Pressable>

      <View style={[styles.tabletNavContainer, isSidebarCollapsed && styles.tabletNavContainerCollapsed]}>
        <Pressable style={[styles.tabletNavItem, styles.tabletNavItemActive, isSidebarCollapsed && styles.tabletNavItemCollapsed]}>
          <Text style={[styles.tabletNavIcon, styles.tabletNavIconActive]}>🏠</Text>
          {!isSidebarCollapsed && <Text style={styles.tabletNavLabelActive}>Trang chủ</Text>}
        </Pressable>
        <Pressable style={[styles.tabletNavItem, isSidebarCollapsed && styles.tabletNavItemCollapsed]}>
          <Text style={styles.tabletNavIcon}>📋</Text>
          {!isSidebarCollapsed && <Text style={styles.tabletNavLabel}>Lịch sử đơn hàng</Text>}
        </Pressable>
        <Pressable style={[styles.tabletNavItem, isSidebarCollapsed && styles.tabletNavItemCollapsed]}>
          <Text style={styles.tabletNavIcon}>⚙️</Text>
          {!isSidebarCollapsed && <Text style={styles.tabletNavLabel}>Cài đặt</Text>}
        </Pressable>
      </View>

      <View style={{ marginTop: 'auto' }}>
        <View style={[styles.sidebarFooter, isSidebarCollapsed && styles.sidebarFooterCollapsed]}>
          <View style={styles.userProfileGroup}>
            <View style={styles.avatarWrap}><Text style={styles.avatarInitials}>ML</Text></View>
            {!isSidebarCollapsed && (
              <View style={styles.userInfoText}>
                <Text style={styles.userName}>Mai Linh</Text>
                <Text style={styles.userRole}>Phục vụ - Ca Chiều</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabletTopHeader = () => (
    <View style={styles.topHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
        <View style={styles.globalToggle}>
          <Pressable style={[styles.toggleTab, activeTab === 'dine' && styles.toggleTabActive]} onPress={() => setActiveTab('dine')}>
            <Text style={activeTab === 'dine' ? styles.toggleTextActive : styles.toggleTextInactive}>Tại bàn</Text>
          </Pressable>
          <Pressable style={[styles.toggleTab, activeTab === 'take' && styles.toggleTabActive]} onPress={() => setActiveTab('take')}>
            <Text style={activeTab === 'take' ? styles.toggleTextActive : styles.toggleTextInactive}>Mang về</Text>
          </Pressable>
        </View>
        {activeTab === 'dine' && (
          <View style={styles.legendGroup}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.legendText}>Trống</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Có khách</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Đã đặt</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.searchFilterGroup}>
        <View style={styles.searchBarWrap}>
          <View style={styles.searchIconOuter}>
            <Text style={styles.searchIconInner}>⚲</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'dine' ? 'Tìm kiếm bàn...' : 'Tìm mã đơn / tên khách...'}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.filterBtn}>
          <Text style={styles.filterBtnIcon}>⌥</Text>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <Text style={styles.filterBtnIcon}>🔔</Text>
          <View style={styles.tabletNotiBadge}>
            <Text style={styles.tabletNotiBadgeText}>3</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );

  // ── TABLE CARD ──────────────────────────────────────────
  const renderTableCard = (t) => {
    const s = getStatusStyle(t.tinhTrangBan);
    const hasInvoice = t.tinhTrangBan === 'CO_KHACH' && t.invoice;
    const orderStatus = hasInvoice ? getOrderStatusStyle(t.invoice.trangThai) : null;
    const showOnlyStatusTag = t.tinhTrangBan === 'DA_DAT'; // Bỏ hiển thị tag 'Bàn Trống' vì đã có line màu trên đầu phân biệt trạng thái rồi.

    // Elapsed time
    const elapsedTime = hasInvoice
      ? formatElapsedTime(t.invoice.thoiGianTao)
      : t.tinhTrangBan === 'DA_DAT' && t.reservation?.thoiGianDat
        ? t.reservation.thoiGianDat.slice(11, 16)
        : '--:--:--';

    return (
      <Pressable
        key={t.idBan}
        style={[styles.tabletTableCard, { borderTopColor: s.baseColor }]}
        onPress={() => handleTablePress(t)}
      >
        {/* Row 1: Tên bàn + Tag trạng thái đơn */}
        <View style={styles.newCardTopRow}>
          <Text style={styles.newCardTitle} numberOfLines={1}>{t.tenBan}</Text>
          {orderStatus ? (
            <View style={[styles.newCardStatusTag, { backgroundColor: orderStatus.bg }]}>
              <View style={[styles.newCardStatusDot, { backgroundColor: orderStatus.color }]} />
              <Text style={[styles.newCardStatusText, { color: orderStatus.color }]}>{orderStatus.label}</Text>
            </View>
          ) : showOnlyStatusTag ? (
            <View style={[styles.newCardStatusTag, { backgroundColor: s.bg }]}>
              <View style={[styles.newCardStatusDot, { backgroundColor: s.baseColor }]} />
              <Text style={[styles.newCardStatusText, { color: s.baseColor }]}>{s.label}</Text>
            </View>
          ) : null}
        </View>

        {/* Row 2: Đồng hồ căn giữa */}
        <View style={styles.newCardMiddleRow}>
          <View style={styles.newCardInfoTag}>
            <Text style={styles.newCardInfoIcon}>🕒</Text>
            <Text style={styles.newCardInfoText}>{elapsedTime}</Text>
          </View>
        </View>

        {/* Row 3: Tạm tính + Giá */}
        <View style={styles.newCardBottomRow}>
          <Text style={styles.newCardBottomLabel}>Tạm tính</Text>
          <Text
            style={[styles.newCardPriceText, { color: hasInvoice && t.invoice?.tongThanhToan > 0 ? '#EF4444' : '#94A3B8' }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {t.invoice?.tongThanhToan ? Math.round(t.invoice.tongThanhToan).toLocaleString('vi-VN') + ' VND' : '0 VND'}
          </Text>
        </View>
      </Pressable>
    );
  };

  // ── TAKEAWAY CARD ───────────────────────────────────────
  const renderTakeawayCard = (order) => {
    const s = getTakeawayStatusStyle(order.trangThai);
    const orderStatusStyle = getOrderStatusStyle(order.trangThai);
    return (
      <Pressable
        key={order.idHoaDon}
        style={[styles.tabletTableCard, { borderTopColor: s.color }]}
        onPress={() => setSelectedTakeaway(order)}
      >
        <View style={styles.newCardTopRow}>
          <Text style={styles.newCardTitle}>Đơn #{order.idHoaDon}</Text>
          <View style={[styles.newCardStatusTag, { backgroundColor: orderStatusStyle.bg }]}>
            <View style={[styles.newCardStatusDot, { backgroundColor: orderStatusStyle.color }]} />
            <Text style={[styles.newCardStatusText, { color: orderStatusStyle.color }]}>{orderStatusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.newCardMiddleRow}>
          <View style={styles.newCardInfoTag}>
            <Text style={styles.newCardInfoIcon}>🕒</Text>
            <Text style={styles.newCardInfoText}>{formatElapsedTime(order.thoiGianTao)}</Text>
          </View>
        </View>

        <View style={styles.newCardBottomRow}>
          <Text style={styles.newCardBottomLabel} numberOfLines={1}>{order.tenKhachHang || 'Khách vãng lai'}</Text>
          <Text
            style={[styles.newCardPriceText, { color: order.tongThanhToan > 0 ? '#EF4444' : '#94A3B8' }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {order.tongThanhToan ? Math.round(order.tongThanhToan).toLocaleString('vi-VN') + ' VND' : '0 VND'}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderTabletGrid = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.tabletGrid}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34A853" />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#34A853" style={{ marginTop: 40, alignSelf: 'center', width: '100%' }} />
      ) : activeTab === 'dine' ? (
        filteredTables.map(renderTableCard)
      ) : (
        filteredTakeaways.map(renderTakeawayCard)
      )}
    </ScrollView>
  );

  // ── FABs: Vertical stack, bottom-right ─────────────────
  const renderTabletFABs = () => (
    <View style={styles.fabContainer}>
      {activeTab === 'take' && (
        <Pressable onPress={() => handleOpenMenu([], null, true)}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.premiumFab}>
            <Text style={styles.premiumFabIcon}>+</Text>
          </LinearGradient>
        </Pressable>
      )}
      {/* Khuyến mãi - nút trên */}
      <Pressable onPress={() => { setShowPromo(!showPromo); setShowStats(false); }}>
        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.premiumFab}>
          <Text style={styles.premiumFabIcon}>🎁</Text>
        </LinearGradient>
      </Pressable>
      {/* Thống kê - nút dưới */}
      <Pressable onPress={() => { setShowStats(!showStats); setShowPromo(false); }}>
        <LinearGradient colors={['#0D9488', '#0F766E']} style={styles.premiumFab}>
          <Text style={styles.premiumFabIcon}>📊</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  // ── Thống kê Modal: Bottom-center, NO backdrop ─────────
  const renderTabletStatsModal = () => {
    if (!showStats) return null;
    return (
      <View style={styles.bottomModalContainer} pointerEvents="box-none">
        <View style={styles.statsModalCard}>
          <View style={styles.statsBannerCol}>
            <View style={[styles.statsBannerIconWrap, { backgroundColor: 'rgba(239,68,68,0.15)' }]}><Text>👥</Text></View>
            <View style={styles.statsBannerTextGroup}>
              <Text style={styles.statsBannerLabel}>Đang phục vụ</Text>
              <Text style={[styles.statsBannerValue, { color: '#EF4444' }]}>{tables.filter(t => t.tinhTrangBan === 'CO_KHACH').length}</Text>
            </View>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerCol}>
            <View style={[styles.statsBannerIconWrap, { backgroundColor: 'rgba(59,130,246,0.15)' }]}><Text>🕒</Text></View>
            <View style={styles.statsBannerTextGroup}>
              <Text style={styles.statsBannerLabel}>Đã đặt</Text>
              <Text style={[styles.statsBannerValue, { color: '#3B82F6' }]}>{tables.filter(t => t.tinhTrangBan === 'DA_DAT').length}</Text>
            </View>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerCol}>
            <View style={[styles.statsBannerIconWrap, { backgroundColor: 'rgba(245,158,11,0.15)' }]}><Text>💰</Text></View>
            <View style={styles.statsBannerTextGroup}>
              <Text style={styles.statsBannerLabel}>Tạm thu</Text>
              <Text style={[styles.statsBannerValue, { color: '#F59E0B' }]}>
                {tables.reduce((acc, t) => acc + (t.invoice?.tongThanhToan || 0), 0).toLocaleString('vi-VN')} VND
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ── Khuyến mãi Modal: Bottom-center, NO backdrop ────────
  const renderPromoModal = () => {
    if (!showPromo) return null;
    return (
      <View style={styles.bottomModalContainer} pointerEvents="box-none">
        <View style={styles.promoModalCard}>
          <View style={styles.promoModalHeader}>
            <Text style={styles.promoModalTitle}>🎁 Khuyến mãi hôm nay</Text>
            <Pressable onPress={() => setShowPromo(false)}>
              <Text style={styles.promoModalClose}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.promoModalDivider} />
          <Text style={styles.promoModalEmpty}>Hiện chưa có chương trình khuyến mãi nào đang chạy.</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={isTablet ? styles.tabletContainer : styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {isTablet ? (
        <>
          {renderTabletSidebar()}
          <View style={styles.tabletMain}>
            {renderTabletTopHeader()}
            {renderTabletGrid()}
            {renderTabletFABs()}
            {renderTabletStatsModal()}
            {renderPromoModal()}
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Xoay màn hình để dùng POS mode</Text>
        </View>
      )}

      {selectedTable && selectedTable.tinhTrangBan === 'TRONG' && (
        <EmptyTableSheet table={selectedTable} tables={tables} onClose={() => setSelectedTable(null)} onReserve={() => { setReserveTable(selectedTable); setSelectedTable(null); }} onOpenMenu={(tables, resId) => handleOpenMenu(tables, resId)} onRefresh={fetchData} />
      )}
      {selectedTable && selectedTable.tinhTrangBan === 'CO_KHACH' && (
        <OccupiedTableSheet table={selectedTable} tables={tables} onClose={() => setSelectedTable(null)} onUpdateGuest={() => { setUpdateGuestTable(selectedTable); setSelectedTable(null); }} onRefresh={fetchData} onOpenMenu={(tables, resId, isTakeaway, invId) => handleOpenMenu(tables, resId, isTakeaway, invId)} onViewInvoice={(table) => { setInvoiceTable(table); setSelectedTable(null); }} />
      )}
      {selectedTable && selectedTable.tinhTrangBan === 'DA_DAT' && (
        <ReservedTableSheet table={selectedTable} onClose={() => setSelectedTable(null)} onRefresh={fetchData} onOpenMenu={(tables, res) => handleOpenMenu(tables, res)} onEdit={() => { setEditReserveTable(selectedTable); setSelectedTable(null); }} />
      )}
      {reserveTable && <ReserveTableSheet table={reserveTable} tables={tables} onClose={() => setReserveTable(null)} onRefresh={fetchData} />}
      {updateGuestTable && <UpdateGuestSheet table={updateGuestTable} onClose={() => setUpdateGuestTable(null)} onRefresh={fetchData} />}
      {invoiceTable && <InvoiceDetailSheet table={invoiceTable} onClose={() => setInvoiceTable(null)} onRefresh={fetchData} onOpenMenu={(tables, resId, isTakeaway, invId) => handleOpenMenu(tables, resId, isTakeaway, invId)} />}
      {editReserveTable && <EditReserveSheet table={editReserveTable} onClose={() => setEditReserveTable(null)} onRefresh={fetchData} />}
      {selectedTakeaway && <TakeawayDetailSheet invoice={selectedTakeaway} onClose={() => setSelectedTakeaway(null)} onRefresh={fetchData} onOpenMenu={(tables, res, takeaway, invId) => handleOpenMenu([], null, true, invId)} />}
    </View>
  );
};

export default TableMap;
