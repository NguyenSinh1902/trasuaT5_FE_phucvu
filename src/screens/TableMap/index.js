import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
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

const { width } = Dimensions.get('window');
const sw = (size) => (width / 412) * size;

const TableMap = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('dine'); // 'dine' or 'take'
  const [tables, setTables] = useState([]);
  const [takeawayOrders, setTakeawayOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sheets state
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTakeaway, setSelectedTakeaway] = useState(null);
  const [isReserveSheetVisible, setIsReserveSheetVisible] = useState(false);
  const [isUpdateGuestVisible, setIsUpdateGuestVisible] = useState(false);
  const [isInvoiceSheetVisible, setIsInvoiceSheetVisible] = useState(false);
  const [isEditReserveVisible, setIsEditReserveVisible] = useState(false);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const fetchData = async () => {
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

      // Map data to tables (Dine-in)
      const mappedTables = tableData.map(t => {
        const res = reservations.find(r => r.danhSachBan?.some(b => b.idBan === t.idBan));
        const activeInvoice = invoices.find(inv => 
          inv.loaiDonHang === 'TAI_BAN' && 
          inv.danhSachTenBan?.includes(t.tenBan) &&
          inv.trangThai !== 'DA_THANH_TOAN' &&
          inv.trangThai !== 'DA_HUY'
        );
        return { ...t, reservation: res, invoice: activeInvoice };
      });
      setTables(mappedTables);

      // Filter takeaway orders
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
  };

  const getStatusStyle = (tinhTrang, invoiceTrangThai) => {
    if (invoiceTrangThai === 'CHO_THANH_TOAN') {
      return { bg: 'rgba(255,215,0,0.15)', border: 'rgba(255,215,0,0.4)', color: '#FFD700', label: 'Chờ Thanh Toán', icon: '🔔' };
    }
    if (invoiceTrangThai === 'DA_THANH_TOAN') {
      return { bg: 'rgba(152,16,250,0.12)', border: 'rgba(152,16,250,0.3)', color: '#9810FA', label: 'Đã Thanh Toán' };
    }
    
    switch (tinhTrang) {
      case 'TRONG':
        return { bg: 'rgba(139,163,103,0.12)', border: 'rgba(139,163,103,0.3)', color: '#8BA367', label: 'Bàn Trống' };
      case 'DA_DAT':
        return { bg: 'rgba(43,127,255,0.12)', border: 'rgba(43,127,255,0.3)', color: '#2B7FFF', label: 'Đã Đặt' };
      case 'CO_KHACH':
        return { bg: 'rgba(255,68,68,0.12)', border: 'rgba(255,68,68,0.3)', color: '#FF4444', label: 'Đang Dùng' };
      default:
        return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#FFFFFF', label: 'Không xác định' };
    }
  };

  const getTakeawayStatusStyle = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN':
        return { bg: 'rgba(255,165,0,0.12)', border: 'rgba(255,165,0,0.3)', color: '#FFA500', label: 'Chờ xác nhận' };
      case 'DANG_PHA_CHE':
        return { bg: 'rgba(255,68,68,0.12)', border: 'rgba(255,68,68,0.3)', color: '#FF4444', label: 'Đang pha chế' };
      case 'CHO_LAY_MON':
        return { bg: 'rgba(139,163,103,0.12)', border: 'rgba(139,163,103,0.3)', color: '#8BA367', label: 'Chờ lấy món' };
      case 'CHO_THANH_TOAN':
        return { bg: 'rgba(255,215,0,0.15)', border: 'rgba(255,215,0,0.4)', color: '#FFD700', label: 'Chờ thanh toán', icon: '🔔' };
      case 'DA_THANH_TOAN':
        return { bg: 'rgba(152,16,250,0.12)', border: 'rgba(152,16,250,0.3)', color: '#9810FA', label: 'Đã thanh toán' };
      default:
        return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#FFFFFF', label: status || 'Đang xử lý' };
    }
  };

  const handleTablePress = (table) => {
    setSelectedTable(table);
  };

  const handleOpenMenu = (selectedTables, reservation, isTakeaway = false, invoiceId = null) => {
    const table = Array.isArray(selectedTables) && selectedTables.length > 0 ? selectedTables[0] : (selectedTable || null);
    onNavigate('OrderMenu', {
      table,
      reservation,
      isTakeaway,
      invoiceId
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.userInfoRow}>
          <View style={styles.userProfileGroup}>
            <View style={styles.avatarWrap}>
                <Text style={styles.avatarInitials}>ML</Text>
            </View>
            <View>
              <Text style={styles.roleText}>Nhân viên</Text>
              <Text style={styles.nameText}>Mai Linh</Text>
              <Text style={styles.shiftText}>Ca Chiều</Text>
            </View>
          </View>
          <View style={styles.notiBtn}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
            <View style={styles.notiBadge}><Text style={styles.notiBadgeText}>3</Text></View>
          </View>
        </View>
        <View style={styles.globalToggle}>
          <Pressable style={[styles.toggleTab, activeTab === 'dine' && styles.toggleTabActive]} onPress={() => setActiveTab('dine')}>
            <Text style={activeTab === 'dine' ? styles.toggleTextActive : styles.toggleTextInactive}>Tại bàn</Text>
          </Pressable>
          <Pressable style={[styles.toggleTab, activeTab === 'take' && styles.toggleTabActive]} onPress={() => setActiveTab('take')}>
            <Text style={activeTab === 'take' ? styles.toggleTextActive : styles.toggleTextInactive}>Mang về</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={activeTab === 'take' ? styles.takeawayListContainer : styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8BA367" />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#8BA367" style={{ marginTop: 40 }} />
        ) : activeTab === 'dine' ? (
          tables.map(t => {
            const s = getStatusStyle(t.tinhTrangBan, t.invoice?.trangThai);
            return (
              <Pressable key={t.idBan} style={[styles.tableCard, { backgroundColor: s.bg, borderColor: s.border }]} onPress={() => handleTablePress(t)}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableName}>{t.tenBan}</Text>
                  {s.icon && <Text style={{ fontSize: sw(18) }}>{s.icon}</Text>}
                </View>
                
                <View style={[styles.tableBadge, { backgroundColor: s.color + '25', marginBottom: 8, alignSelf: 'flex-start' }]}>
                  <Text style={[styles.tableBadgeText, { color: s.color }]}>{s.label}</Text>
                </View>

                {t.tinhTrangBan === 'TRONG' && <Text style={styles.tableSubText}>Sức chứa: {t.sucChua} người</Text>}
                {t.tinhTrangBan === 'CO_KHACH' && (
                  <View>
                    <Text style={styles.tableSubText}>Tạm tính</Text>
                    <Text style={[styles.tableMainValue, { color: s.color }]}>
                      {t.invoice?.tongThanhToan?.toLocaleString('vi-VN') || '0'}₫
                    </Text>
                  </View>
                )}
                {t.tinhTrangBan === 'DA_DAT' && (
                  <View>
                    <Text style={styles.tableSubText}>Giờ hẹn đến</Text>
                    <Text style={[styles.tableMainValue, { color: s.color, fontSize: 24 }]}>
                      {t.reservation?.thoiGianDat ? t.reservation.thoiGianDat.slice(11, 16) : '--:--'}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })
        ) : (
          takeawayOrders.length === 0 ? (
            <Text style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 40 }}>Chưa có đơn mang về nào</Text>
          ) : (
            takeawayOrders.map(order => {
              const s = getTakeawayStatusStyle(order.trangThai);
              return (
                <Pressable
                  key={order.idHoaDon}
                  style={[styles.takeawayCard, { backgroundColor: s.bg, borderColor: s.border }]}
                  onPress={() => setSelectedTakeaway(order)}>
                  <View style={styles.takeawayHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.takeawayIdText}>Đơn #{order.idHoaDon}</Text>
                      {s.icon && <Text style={{ marginLeft: 8 }}>{s.icon}</Text>}
                    </View>
                    <Text style={styles.takeawayTimeText}>
                      {order.thoiGianTao ? new Date(order.thoiGianTao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                  </View>
                  <View style={styles.takeawayInfoRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.takeawayCustomerText}>{order.tenKhachHang || 'Khách vãng lai'}</Text>
                      <View style={[styles.tableBadge, { backgroundColor: s.color + '25', marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 8 }]}>
                        <Text style={[styles.tableBadgeText, { color: s.color, fontSize: 10 }]}>{s.label}</Text>
                      </View>
                    </View>
                    <Text style={[styles.takeawayTotalText, { color: s.color }]}>{order.tongThanhToan?.toLocaleString('vi-VN')}₫</Text>
                  </View>
                </Pressable>
              );
            })
          )
        )}
      </ScrollView>

      {activeTab === 'take' && (
        <Pressable style={styles.fabCreateOrder} onPress={() => handleOpenMenu([], null, true)}>
          <Text style={styles.fabIconText}>+</Text>
        </Pressable>
      )}

      {/* Summary Overlay (với hiệu ứng làm mờ nhẹ phía sau) */}
      <View style={styles.summaryOverlay}>
        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(255,68,68,0.2)' }]}><Text style={styles.summaryIcon}>👥</Text></View>
          <Text style={styles.summaryValue}>{tables.filter(t => t.tinhTrangBan === 'CO_KHACH').length}</Text>
          <Text style={styles.summaryLabel}>Đang phục vụ</Text>
        </View>
        <View style={[styles.summaryCol, styles.summaryColBorder]}>
          <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(43,127,255,0.2)' }]}><Text style={styles.summaryIcon}>🕒</Text></View>
          <Text style={styles.summaryValue}>{tables.filter(t => t.tinhTrangBan === 'DA_DAT').length}</Text>
          <Text style={styles.summaryLabel}>Đã đặt</Text>
        </View>
        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(255,215,0,0.15)' }]}><Text style={styles.summaryIcon}>💰</Text></View>
          <Text style={styles.summaryValue}>{tables.reduce((acc, t) => acc + (t.invoice?.tongThanhToan || 0), 0).toLocaleString('vi-VN')}</Text>
          <Text style={styles.summaryLabel}>Tạm thu</Text>
        </View>
      </View>

      {/* Sheets (Conditional Rendering for better performance) */}
      {selectedTable && selectedTable.tinhTrangBan === 'TRONG' && (
        <EmptyTableSheet 
          table={selectedTable} 
          onClose={() => setSelectedTable(null)} 
          onReserve={() => { setIsReserveSheetVisible(true); setSelectedTable(null); }}
          onOpenMenu={(tables) => handleOpenMenu(tables, null)}
        />
      )}

      {selectedTable && selectedTable.tinhTrangBan === 'CO_KHACH' && (
        <OccupiedTableSheet 
          table={selectedTable} 
          tables={tables}
          onClose={() => setSelectedTable(null)} 
          onUpdateGuest={() => setIsUpdateGuestVisible(true)}
          onRefresh={fetchData}
          onOpenMenu={(tables) => handleOpenMenu(tables, null)}
          onViewInvoice={(table) => { setIsInvoiceSheetVisible(true); setSelectedTable(table); }}
        />
      )}

      {selectedTable && selectedTable.tinhTrangBan === 'DA_DAT' && (
        <ReservedTableSheet 
          table={selectedTable} 
          onClose={() => setSelectedTable(null)} 
          onRefresh={fetchData}
          onOpenMenu={(tables, res) => handleOpenMenu(tables, res)}
          onEdit={() => { setIsEditReserveVisible(true); setSelectedTable(null); }}
        />
      )}

      {isReserveSheetVisible && selectedTable && (
        <ReserveTableSheet table={selectedTable} onClose={() => setIsReserveSheetVisible(false)} onRefresh={fetchData} />
      )}

      {isUpdateGuestVisible && selectedTable && (
        <UpdateGuestSheet table={selectedTable} onClose={() => setIsUpdateGuestVisible(false)} onRefresh={fetchData} />
      )}

      {isInvoiceSheetVisible && selectedTable && (
        <InvoiceDetailSheet 
          table={selectedTable} 
          onClose={() => setIsInvoiceSheetVisible(false)} 
          onRefresh={fetchData}
          onOpenMenu={(tables) => handleOpenMenu(tables, null)}
        />
      )}

      {isEditReserveVisible && selectedTable && (
        <EditReserveSheet table={selectedTable} onClose={() => setIsEditReserveVisible(false)} onRefresh={fetchData} />
      )}

      {selectedTakeaway && (
        <TakeawayDetailSheet 
          invoice={selectedTakeaway}
          onClose={() => setSelectedTakeaway(null)}
          onRefresh={fetchData}
          onOpenMenu={(tables, res, takeaway, invId) => handleOpenMenu([], null, true, invId)}
        />
      )}

      {/* ===== BOTTOM NAV ===== */}
      <View style={styles.navOverlay}>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>History</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navLabel}>Settings</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TableMap;
