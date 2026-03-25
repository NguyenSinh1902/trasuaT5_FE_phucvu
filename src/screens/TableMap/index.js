import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './TableMap.styles';

// Sheet components
import EmptyTableSheet from './components/EmptyTableSheet';
import OccupiedTableSheet from './components/OccupiedTableSheet';
import ReserveTableSheet from './components/ReserveTableSheet';
import ReservedTableSheet from './components/ReservedTableSheet';
import EditReserveSheet from './components/EditReserveSheet';
import InvoiceDetailSheet from './components/InvoiceDetailSheet';
import UpdateGuestSheet from './components/UpdateGuestSheet';
import tableApi from '../../api/tableApi';
import reservationApi from '../../api/reservationApi';

// ===================== MOCK DATA =====================
const mockTables = [
  { id: 1, name: 'Bàn 01', status: 'empty', capacity: 4 },
  { id: 2, name: 'Bàn 02', status: 'occupied', time: '45 phút', price: '285.000₫' },
  { id: 3, name: 'Bàn 03', status: 'reserved', time: '19:30' },
  { id: 4, name: 'Bàn 04', status: 'empty', capacity: 4 },
  { id: 5, name: 'Bàn 05', status: 'occupied', time: '120 phút', price: '420.000₫' },
  { id: 6, name: 'Bàn 06', status: 'empty', capacity: 8 },
  { id: 7, name: 'Bàn 07', status: 'reserved', time: '20:00' },
  { id: 8, name: 'Bàn 08', status: 'empty', capacity: 2 },
  { id: 9, name: 'Bàn 09', status: 'occupied', time: '30 phút', price: '150.000₫' },
  { id: 10, name: 'Bàn 10', status: 'empty', capacity: 6 },
  { id: 11, name: 'Bàn 11', status: 'reserved', time: '21:00' },
  { id: 12, name: 'Bàn 12', status: 'occupied', time: '90 phút', price: '560.000₫' },
];

const getStatusStyle = (status) => {
  switch (status) {
    case 'CO_KHACH': return { bg: 'rgba(139,163,103,0.18)', border: 'rgba(139,163,103,0.4)', color: '#8BA367', label: 'Có khách' };
    case 'DA_DAT': return { bg: 'rgba(255,215,0,0.18)', border: 'rgba(255,215,0,0.4)', color: '#FFD700', label: 'Đã đặt' };
    default: return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', label: 'Trống' };
  }
};

// ===================== MAIN SCREEN =====================
const TableMap = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('dine');

  // Bottom sheet state
  const [selectedTable, setSelectedTable] = useState(null);   // empty table
  const [reserveTable, setReserveTable] = useState(null);     // reserve form
  const [occupiedTable, setOccupiedTable] = useState(null);   // occupied table
  const [updateGuestTable, setUpdateGuestTable] = useState(null);
  const [reservedTable, setReservedTable] = useState(null);
  const [editReserveTable, setEditReserveTable] = useState(null);
  const [invoiceTable, setInvoiceTable] = useState(null); // edit reservation
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();

    // Auto-refresh every 1 minute to update "Đã ngồi" time
    const timer = setInterval(fetchTables, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchTables = async () => {
    try {
      const [tableData, resData] = await Promise.all([
        tableApi.getTables(),
        reservationApi.getActiveReservations(),
      ]);

      // Merge data: Find reservation for each table
      const merged = tableData.map(table => {
        const res = resData.find(r =>
          r.danhSachBan && r.danhSachBan.some(b => b.idBan === table.idBan)
        );
        return { ...table, reservation: res };
      });

      setTables(merged);
    } catch (err) {
      console.error('Fetch map data failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMinutesSat = (isoStr) => {
    if (!isoStr) return 0;
    const start = new Date(isoStr);
    const now = new Date();
    const diff = now - start;
    const mins = Math.floor(diff / (1000 * 60));
    return Math.max(0, mins);
  };

  const handleTablePress = (table) => {
    if (table.tinhTrangBan === 'TRONG') setSelectedTable(table);
    if (table.tinhTrangBan === 'CO_KHACH') setOccupiedTable(table);
    if (table.tinhTrangBan === 'DA_DAT') setReservedTable(table);
  };

  const handleReserve = () => {
    setReserveTable(selectedTable);
    setSelectedTable(null);
  };

  const handleOpenMenu = (selectedTables = [], newReservationId) => {
    // If multiple tables were selected in the sheet, pass them all
    const contextTable = selectedTables.length > 0 ? { ...selectedTables[0] } : { ...selectedTable };
    if (newReservationId) {
       contextTable.idPhieuDatTemp = newReservationId;
    }
    setSelectedTable(null);
    onNavigate && onNavigate('OrderMenu', { table: contextTable, allSelected: selectedTables });
  };

  const handleUpdateGuest = () => {
    setUpdateGuestTable(occupiedTable);
    setOccupiedTable(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#1A1A1A', '#0F1A0F']} style={styles.backgroundGradient} />

      {/* ===== HEADER ===== */}
      <View style={styles.headerContainer}>
        <LinearGradient colors={['#1E2D1E', '#172517']} style={styles.headerGradient} />
        <View style={styles.userInfoRow}>
          <View style={styles.userProfileGroup}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarInitials}>M</Text>
            </View>
            <View>
              <Text style={styles.roleText}>Nhân viên</Text>
              <Text style={styles.nameText}>Mai Linh</Text>
              <Text style={styles.shiftText}>Ca Chiều</Text>
            </View>
          </View>
          <View style={{ position: 'relative' }}>
            <View style={styles.notiBtn}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </View>
            <View style={styles.notiBadge}><Text style={styles.notiBadgeText}>3</Text></View>
          </View>
        </View>
        <View style={styles.globalToggle}>
          <Pressable
            style={[styles.toggleTab, activeTab === 'dine' && styles.toggleTabActive]}
            onPress={() => setActiveTab('dine')}>
            <Text style={activeTab === 'dine' ? styles.toggleTextActive : styles.toggleTextInactive}>Tại bàn</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleTab, activeTab === 'take' && styles.toggleTabActive]}
            onPress={() => setActiveTab('take')}>
            <Text style={activeTab === 'take' ? styles.toggleTextActive : styles.toggleTextInactive}>Mang về</Text>
          </Pressable>
        </View>
      </View>

      {/* ===== TABLE GRID ===== */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Đang tải danh sách bàn...</Text>
        ) : tables.map(t => {
          const s = getStatusStyle(t.tinhTrangBan);
          return (
            <Pressable
              key={t.idBan}
              style={[styles.tableCard, { backgroundColor: s.bg, borderColor: s.border }]}
              onPress={() => handleTablePress(t)}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableName}>{t.tenBan}</Text>
                <View style={[styles.tableBadge, { backgroundColor: s.color + '30' }]}>
                  <Text style={[styles.tableBadgeText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>
              {t.tinhTrangBan === 'TRONG' && <Text style={styles.tableSubText}>Sức chứa: {t.sucChua} người</Text>}
              {t.tinhTrangBan === 'CO_KHACH' && (
                <View>
                  <Text style={styles.tableSubText}>Đã ngồi: {calculateMinutesSat(t.reservation?.thoiGianDat)} phút</Text>
                  <Text style={[styles.tableSubText, { marginTop: 4 }]}>Tạm tính</Text>
                  <Text style={[styles.tableMainValue, { color: s.color }]}>0.000₫</Text>
                </View>
              )}
              {t.tinhTrangBan === 'DA_DAT' && (
                <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                  <Text style={styles.tableSubText}>Giờ hẹn đến</Text>
                  <Text style={[styles.tableMainValue, { color: s.color, fontSize: 26, marginTop: 4 }]}>
                    {t.reservation?.thoiGianDat ? t.reservation.thoiGianDat.slice(11, 16) : '--:--'}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ===== FADING EDGE ===== */}
      <LinearGradient
        colors={['rgba(18,22,20,0)', 'rgba(18,22,20,0.95)']}
        style={styles.fadeEdge}
        pointerEvents="none"
      />

      {/* ===== SUMMARY OVERLAY ===== */}
      <View style={styles.summaryOverlay}>
        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(139,163,103,0.2)' }]}>
            <Text style={styles.summaryIcon}>👥</Text>
          </View>
          <Text style={styles.summaryValue}>{tables.filter(t => t.tinhTrangBan === 'CO_KHACH').length}</Text>
          <Text style={styles.summaryLabel}>Đang phục vụ</Text>
        </View>
        <View style={[styles.summaryCol, styles.summaryColBorder]}>
          <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(255,215,0,0.2)' }]}>
            <Text style={styles.summaryIcon}>🕒</Text>
          </View>
          <Text style={styles.summaryValue}>{tables.filter(t => t.tinhTrangBan === 'DA_DAT').length}</Text>
          <Text style={styles.summaryLabel}>Đã đặt</Text>
        </View>
        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
            <Text style={styles.summaryIcon}>💰</Text>
          </View>
          <Text style={styles.summaryValue}>0.000k</Text>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
        </View>
      </View>

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

      {/* ===== BOTTOM SHEET MODALS ===== */}
      <EmptyTableSheet
        table={selectedTable}
        tables={tables}
        onClose={() => setSelectedTable(null)}
        onReserve={handleReserve}
        onOpenMenu={handleOpenMenu}
        onRefresh={fetchTables}
      />
      <ReserveTableSheet
        table={reserveTable}
        onClose={() => setReserveTable(null)}
        onRefresh={fetchTables}
      />
      <OccupiedTableSheet
        table={occupiedTable}
        tables={tables}
        onClose={() => setOccupiedTable(null)}
        onUpdateGuest={handleUpdateGuest}
        onRefresh={fetchTables}
        onOpenMenu={handleOpenMenu}
        onViewInvoice={(t) => setInvoiceTable(t)}
      />
      <UpdateGuestSheet
        table={updateGuestTable}
        onClose={() => setUpdateGuestTable(null)}
      />
      <ReservedTableSheet
        table={reservedTable}
        onClose={() => setReservedTable(null)}
        onRefresh={fetchTables}
        onEdit={() => {
          setEditReserveTable(reservedTable);
          setReservedTable(null);
        }}
      />
      <EditReserveSheet
        table={editReserveTable}
        onClose={() => setEditReserveTable(null)}
      />
      <InvoiceDetailSheet
        table={invoiceTable}
        onClose={() => setInvoiceTable(null)}
      />
    </View>
  );
};

export default TableMap;
